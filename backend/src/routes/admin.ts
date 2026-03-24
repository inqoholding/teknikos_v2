import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { adminInboxRequests, businesses, contracts, customers, inventory, jobs, technicians } from "../db/app-schema.js";
import { account, session, user } from "../db/auth-schema.js";
import { db } from "../db/index.js";
import { conflict, notFound } from "../lib/errors.js";
import {
  BUSINESS_PLANS,
  SUBSCRIPTION_STATUSES,
  getPlanCatalog,
  getPlanUsageSnapshot,
  getSubscriptionAlert,
  normalizeBusinessPlan,
  normalizeSubscriptionStatus,
  serializeSubscriptionState,
} from "../lib/plans.js";
import { requireAdminRole, requireSession, requireStaffRole } from "../lib/session.js";
import { formatDateShort } from "../utils/serializers.js";
import { hashPassword } from "better-auth/crypto";

const updateSubscriptionSchema = z.object({
  plan: z.enum(BUSINESS_PLANS).optional(),
  subscriptionStatus: z.enum(SUBSCRIPTION_STATUSES).optional(),
  trialEndsAt: z.coerce.date().optional().nullable(),
  currentPeriodEndsAt: z.coerce.date().optional().nullable(),
  subscriptionNotes: z.string().max(500).optional().nullable(),
});

const resetClientPasswordSchema = z.object({
  businessId: z.string().min(1),
  newPassword: z.string().min(8).optional(),
});

function generateTemporaryPassword() {
  const seed = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TeknikOS!${seed}`;
}

export const adminRouter = Router();

adminRouter.use(requireSession);
adminRouter.use((_req, res, next) => {
  requireStaffRole(res);
  next();
});

adminRouter.get("/subscriptions", async (_req, res) => {
  const [businessRows, ownerRows, technicianRows, customerRows, inventoryRows, contractRows, jobRows] =
    await Promise.all([
      db.select().from(businesses),
      db.select().from(user),
      db.select().from(technicians),
      db.select().from(customers),
      db.select().from(inventory),
      db.select().from(contracts),
      db.select().from(jobs),
    ]);

  const ownerMap = new Map(ownerRows.map((row) => [row.id, row]));

  const data = businessRows.map((business) => {
    const owner = ownerMap.get(business.ownerUserId);
    const techniciansCount = technicianRows.filter((row) => row.businessId === business.id).length;
    const customersCount = customerRows.filter((row) => row.businessId === business.id).length;
    const inventoryCount = inventoryRows.filter((row) => row.businessId === business.id).length;
    const contractsCount = contractRows.filter((row) => row.businessId === business.id).length;
    const activeJobs = jobRows.filter(
      (row) => row.businessId === business.id && !["done", "cancelled"].includes(row.status),
    ).length;

    return {
      id: business.id,
      name: business.name,
      slug: business.slug,
      city: business.city ?? "-",
      serviceType: business.serviceType,
      planDetails: serializeSubscriptionState(business),
      plan: normalizeBusinessPlan(business.plan),
      subscriptionStatus: serializeSubscriptionState(business).subscriptionStatus,
      subscriptionStatusLabel: serializeSubscriptionState(business).subscriptionStatusLabel,
      trialEndsAt: business.trialEndsAt,
      trialEndsAtLabel: formatDateShort(business.trialEndsAt),
      currentPeriodEndsAt: business.currentPeriodEndsAt,
      currentPeriodEndsAtLabel: formatDateShort(business.currentPeriodEndsAt),
      subscriptionAlert: getSubscriptionAlert(business),
      subscriptionNotes: business.subscriptionNotes ?? "",
      owner: owner
        ? {
            id: owner.id,
            name: owner.name,
            email: owner.email,
            phone: owner.phone ?? null,
          }
        : null,
      counts: {
        technicians: techniciansCount,
        customers: customersCount,
        inventoryItems: inventoryCount,
        contracts: contractsCount,
        activeJobs,
      },
      createdAt: business.createdAt,
      createdAtLabel: formatDateShort(business.createdAt),
    };
  });

  res.json({
    data,
    meta: {
      plans: getPlanCatalog(),
      statuses: SUBSCRIPTION_STATUSES,
    },
  });
});

adminRouter.get("/inbox", async (_req, res) => {
  const [businessRows, requestRows] = await Promise.all([
    db.select().from(businesses),
    db.select().from(adminInboxRequests),
  ]);

  const expiryAlerts = businessRows
    .map((business) => {
      const alert = getSubscriptionAlert(business);
      if (!alert) {
        return null;
      }

      return {
        id: `subscription-${business.id}`,
        type: "subscription_alert",
        status: "open",
        source: "system",
        businessId: business.id,
        businessName: business.name,
        requesterName: business.name,
        requesterEmail: business.email,
        requesterPhone: business.phone,
        currentPlan: business.plan,
        targetPlan: null,
        message: alert.message,
        createdAt: business.currentPeriodEndsAt ?? business.updatedAt,
        updatedAt: business.updatedAt,
        title: alert.title,
        level: alert.level,
      };
    })
    .filter((row): row is NonNullable<typeof row> => row !== null);

  const data = [...requestRows, ...expiryAlerts]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((row) => ({
      id: row.id,
      type: row.type,
      status: row.status,
      source: row.source,
      businessId: row.businessId ?? null,
      businessName: row.businessName ?? "-",
      requesterName: row.requesterName ?? "-",
      requesterEmail: row.requesterEmail ?? "-",
      requesterPhone: row.requesterPhone ?? "-",
      currentPlan: row.currentPlan ?? "-",
      targetPlan: row.targetPlan ?? "-",
      message: row.message ?? "",
      title: "title" in row ? row.title : null,
      level: "level" in row ? row.level : "info",
      createdAt: row.createdAt,
      createdAtLabel: formatDateShort(row.createdAt),
    }));

  res.json({ data });
});

adminRouter.get("/calendar", async (_req, res) => {
  const [businessRows, customerRows, technicianRows, jobRows] = await Promise.all([
    db.select().from(businesses),
    db.select().from(customers),
    db.select().from(technicians),
    db.select().from(jobs),
  ]);

  const businessMap = new Map(businessRows.map((row) => [row.id, row]));
  const customerMap = new Map(customerRows.map((row) => [row.id, row]));
  const technicianMap = new Map(technicianRows.map((row) => [row.id, row]));

  const data = jobRows
    .filter((job) => job.status !== "cancelled")
    .sort((a, b) => a.scheduleAt.getTime() - b.scheduleAt.getTime())
    .map((job) => {
      const assignedIds =
        Array.isArray(job.assignedTechnicianIds) && job.assignedTechnicianIds.length > 0
          ? job.assignedTechnicianIds
          : job.technicianId
            ? [job.technicianId]
            : [];

      const techniciansAssigned = assignedIds
        .map((technicianId) => technicianMap.get(technicianId)?.name)
        .filter(Boolean) as string[];

      return {
        id: job.id,
        number: job.number,
        title: job.title,
        status: job.status,
        priority: job.priority,
        scheduleAt: job.scheduleAt,
        schedule: formatDateShort(job.scheduleAt),
        deadlineAt: job.deadlineAt,
        business: businessMap.get(job.businessId)?.name ?? "Bisnis",
        customer: customerMap.get(job.customerId)?.name ?? "Tanpa pelanggan",
        technicians: techniciansAssigned,
        location: job.location,
      };
    });

  res.json({ data });
});

adminRouter.patch("/subscriptions/:businessId", async (req, res) => {
  requireAdminRole(res);
  const payload = updateSubscriptionSchema.parse(req.body);
  const businessId = req.params.businessId;
  const [existing] = await db.select().from(businesses).where(eq(businesses.id, businessId));

  if (!existing) {
    res.status(404).json({ error: "NOT_FOUND", message: "Bisnis tidak ditemukan." });
    return;
  }

  const nextPlan = payload.plan ? normalizeBusinessPlan(payload.plan) : existing.plan;
  const nextStatus = payload.subscriptionStatus
    ? normalizeSubscriptionStatus(payload.subscriptionStatus)
    : existing.subscriptionStatus;

  const [updated] = await db
    .update(businesses)
    .set({
      plan: nextPlan,
      subscriptionStatus: nextStatus,
      trialEndsAt: payload.trialEndsAt === undefined ? existing.trialEndsAt : payload.trialEndsAt,
      currentPeriodEndsAt:
        payload.currentPeriodEndsAt === undefined
          ? existing.currentPeriodEndsAt
          : payload.currentPeriodEndsAt,
      subscriptionNotes:
        payload.subscriptionNotes === undefined
          ? existing.subscriptionNotes
          : payload.subscriptionNotes || null,
      updatedAt: new Date(),
    })
    .where(eq(businesses.id, businessId))
    .returning();

  const usage = await getPlanUsageSnapshot(businessId);

  res.json({
    data: {
      ...updated,
      ...serializeSubscriptionState(updated),
      usage,
    },
  });
});

adminRouter.post("/clients/reset-password", async (req, res) => {
  requireAdminRole(res);
  const payload = resetClientPasswordSchema.parse(req.body);
  const [business] = await db.select().from(businesses).where(eq(businesses.id, payload.businessId));

  if (!business) {
    throw notFound("Bisnis tidak ditemukan.");
  }

  const [owner] = await db.select().from(user).where(eq(user.id, business.ownerUserId));
  if (!owner) {
    throw notFound("Owner client tidak ditemukan.");
  }

  const [credentialAccount] = await db
    .select()
    .from(account)
    .where(eq(account.userId, owner.id));

  if (!credentialAccount) {
    throw conflict("Akun client belum memiliki login email/password yang bisa direset.");
  }

  const temporaryPassword = payload.newPassword || generateTemporaryPassword();
  const hashedPassword = await hashPassword(temporaryPassword);

  await db
    .update(account)
    .set({
      password: hashedPassword,
      updatedAt: new Date(),
    })
    .where(eq(account.id, credentialAccount.id));

  await db.delete(session).where(eq(session.userId, owner.id));

  await db.insert(adminInboxRequests).values({
    id: crypto.randomUUID(),
    businessId: business.id,
    type: "password_help",
    status: "open",
    source: "admin",
    businessName: business.name,
    requesterName: owner.name,
    requesterEmail: owner.email,
    requesterPhone: owner.phone ?? null,
    currentPlan: business.plan,
    message: "Admin melakukan reset password untuk client ini.",
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  res.json({
    data: {
      businessId: business.id,
      ownerEmail: owner.email,
      temporaryPassword,
      message: "Password client berhasil direset. Password lama tidak bisa dilihat demi keamanan data.",
    },
  });
});

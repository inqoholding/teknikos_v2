import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { businesses } from "../db/app-schema.js";
import { user } from "../db/auth-schema.js";
import { badRequest, notFound } from "../lib/errors.js";
import { BUSINESS_PLANS, getPlanCatalog, normalizeBusinessPlan, serializePlanState } from "../lib/plans.js";
import { getSessionUser, isStaffRole, requireBusiness, requireSession } from "../lib/session.js";
import { slugify } from "../utils/serializers.js";

const setupSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().min(4),
  city: z.string().min(2),
  serviceType: z.string().min(2).default("AC"),
  plan: z.enum(BUSINESS_PLANS).default("Starter"),
});

export const businessRouter = Router();

businessRouter.use(requireSession);

businessRouter.post("/setup", async (req, res) => {
  const payload = setupSchema.parse(req.body);
  const currentUser = getSessionUser(res);
  const now = new Date();
  const normalizedPlan = normalizeBusinessPlan(payload.plan);
  const defaultSubscriptionStatus = normalizedPlan === "Starter" ? "active" : "pending_payment";
  const trialEndsAt = null;

  if (currentUser.businessId) {
    const [existing] = await db
      .update(businesses)
      .set({
        ...payload,
        plan: normalizedPlan,
        email: payload.email || null,
        subscriptionStatus: defaultSubscriptionStatus,
        trialEndsAt,
        updatedAt: now,
      })
      .where(eq(businesses.id, currentUser.businessId))
      .returning();

    res.status(200).json({
      data: {
        ...existing,
        ...serializePlanState(existing.plan, existing.subscriptionStatus),
        availablePlans: getPlanCatalog(),
      },
    });
    return;
  }

  const businessId = crypto.randomUUID();
  const [createdBusiness] = await db
    .insert(businesses)
    .values({
      id: businessId,
      ownerUserId: currentUser.id,
      name: payload.name,
      slug: `${slugify(payload.name)}-${businessId.slice(0, 6)}`,
      phone: payload.phone,
      email: payload.email || null,
      address: payload.address,
      city: payload.city,
      serviceType: payload.serviceType,
      plan: normalizedPlan,
      subscriptionStatus: defaultSubscriptionStatus,
      trialEndsAt,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  await db
    .update(user)
    .set({
      businessId,
      updatedAt: now,
    })
    .where(eq(user.id, currentUser.id));

  res.status(201).json({
    data: {
      ...createdBusiness,
      ...serializePlanState(createdBusiness.plan, createdBusiness.subscriptionStatus),
      availablePlans: getPlanCatalog(),
    },
  });
});

businessRouter.get("/me", async (_req, res) => {
  const businessId = requireBusiness(res);
  const currentUser = getSessionUser(res);
  const [business] = await db.select().from(businesses).where(eq(businesses.id, businessId));
  if (!business) {
    throw notFound("Bisnis tidak ditemukan.");
  }

  res.json({
    data: {
      ...business,
      ...serializePlanState(business.plan, business.subscriptionStatus),
      availablePlans: getPlanCatalog(),
      owner: {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone ?? null,
      },
    },
  });
});

businessRouter.patch("/me", async (req, res) => {
  const businessId = requireBusiness(res);
  const payload = setupSchema.partial().parse(req.body);
  const currentUser = getSessionUser(res);
  const updatePayload: Record<string, unknown> = {
    ...payload,
    email: payload.email === "" ? null : payload.email,
    updatedAt: new Date(),
  };

  if (payload.plan && !isStaffRole(currentUser.role)) {
    throw badRequest("Paket tidak bisa diubah dari pengaturan owner. Hubungi admin untuk perubahan subscription.");
  }

  if (payload.plan && isStaffRole(currentUser.role)) {
    updatePayload.plan = normalizeBusinessPlan(payload.plan);
  }

  const [updated] = await db
    .update(businesses)
    .set(updatePayload)
    .where(eq(businesses.id, businessId))
    .returning();

  if (!updated) {
    throw notFound("Bisnis tidak ditemukan.");
  }

  res.json({
    data: {
      ...updated,
      ...serializePlanState(updated.plan, updated.subscriptionStatus),
      availablePlans: getPlanCatalog(),
    },
  });
});

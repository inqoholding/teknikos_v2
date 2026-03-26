import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { contracts, customers } from "../db/app-schema.js";
import { db } from "../db/index.js";
import { notFound } from "../lib/errors.js";
import { assertPlanFeature, assertSubscriptionWritable } from "../lib/plans.js";
import { requireCustomerForBusiness } from "../lib/ownership.js";
import { getCurrentBusiness, requireBusiness, requireOwnerAccess, requireSession } from "../lib/session.js";
import { contractStatus, formatDateShort, formatRupiahCompact } from "../utils/serializers.js";
import { entityIdSchema, textField } from "../lib/validation.js";

const contractSchema = z.object({
  customerId: entityIdSchema,
  plan: textField("Paket kontrak", 2, 120),
  serviceInterval: textField("Interval servis", 2, 60).default("Bulanan"),
  unitCount: z.number().int().min(1).default(1),
  value: z.number().int().min(0),
  nextServiceAt: z.coerce.date(),
  status: z.enum(["Aktif", "Hampir Jatuh Tempo", "Expired"]).optional(),
}).strict();

const contractParamsSchema = z.object({
  id: entityIdSchema,
}).strict();

export const contractsRouter = Router();

contractsRouter.use(requireSession);
contractsRouter.use((_req, res, next) => {
  try {
    requireOwnerAccess(res);
    next();
  } catch (error) {
    next(error);
  }
});

contractsRouter.get("/", async (_req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  assertPlanFeature(business.plan, "contractsEnabled");
  const rows = await db
    .select({
      contract: contracts,
      customer: customers,
    })
    .from(contracts)
    .leftJoin(customers, eq(contracts.customerId, customers.id))
    .where(eq(contracts.businessId, businessId))
    .orderBy(desc(contracts.nextServiceAt));

  res.json({
    data: rows.map(({ contract, customer }) => ({
      id: contract.id,
      customer: customer?.name ?? "Tanpa pelanggan",
      plan: `${contract.serviceInterval} · ${contract.unitCount} unit`,
      value: formatRupiahCompact(contract.value),
      nextService: formatDateShort(contract.nextServiceAt),
      status: contractStatus(contract.nextServiceAt, contract.status),
    })),
  });
});

contractsRouter.post("/", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const payload = contractSchema.parse(req.body);
  assertPlanFeature(business.plan, "contractsEnabled");
  assertSubscriptionWritable(business.subscriptionStatus, business.currentPeriodEndsAt);
  await requireCustomerForBusiness(payload.customerId, businessId);
  const [created] = await db
    .insert(contracts)
    .values({
      id: crypto.randomUUID(),
      businessId,
      ...payload,
      status: payload.status ?? contractStatus(payload.nextServiceAt),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  res.status(201).json({ data: created });
});

contractsRouter.patch("/:id", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const { id } = contractParamsSchema.parse(req.params);
  const payload = contractSchema.partial().parse(req.body);
  assertPlanFeature(business.plan, "contractsEnabled");
  assertSubscriptionWritable(business.subscriptionStatus, business.currentPeriodEndsAt);
  const nextCustomerId = payload.customerId;
  if (nextCustomerId) {
    await requireCustomerForBusiness(nextCustomerId, businessId);
  }

  const [updated] = await db
    .update(contracts)
    .set({
      ...payload,
      status:
        payload.status ??
        (payload.nextServiceAt ? contractStatus(payload.nextServiceAt) : undefined),
      updatedAt: new Date(),
    })
    .where(and(eq(contracts.id, id), eq(contracts.businessId, businessId)))
    .returning();

  if (!updated) {
    throw notFound("Kontrak tidak ditemukan.");
  }

  res.json({ data: updated });
});

contractsRouter.delete("/:id", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const { id } = contractParamsSchema.parse(req.params);
  assertPlanFeature(business.plan, "contractsEnabled");
  assertSubscriptionWritable(business.subscriptionStatus, business.currentPeriodEndsAt);
  const [deleted] = await db
    .delete(contracts)
    .where(and(eq(contracts.id, id), eq(contracts.businessId, businessId)))
    .returning();

  if (!deleted) {
    throw notFound("Kontrak tidak ditemukan.");
  }

  res.json({ data: { success: true } });
});

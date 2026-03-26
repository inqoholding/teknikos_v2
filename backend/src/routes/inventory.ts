import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { inventory } from "../db/app-schema.js";
import { notFound } from "../lib/errors.js";
import { assertPlanFeature, assertSubscriptionWritable } from "../lib/plans.js";
import { getCurrentBusiness, requireBusiness, requireOwnerAccess, requireSession } from "../lib/session.js";
import { formatRupiahCompact, inventoryStatus } from "../utils/serializers.js";
import { entityIdSchema, textField } from "../lib/validation.js";

const inventorySchema = z.object({
  name: textField("Nama item", 2, 120),
  sku: textField("SKU", 2, 60),
  category: textField("Kategori", 2, 80),
  stock: z.number().int().min(0).default(0),
  minStock: z.number().int().min(0).default(0),
  buyPrice: z.number().int().min(0),
  sellPrice: z.number().int().min(0),
}).strict();

const adjustStockSchema = z.object({
  delta: z.number().int(),
}).strict();

const inventoryParamsSchema = z.object({
  id: entityIdSchema,
}).strict();

export const inventoryRouter = Router();

inventoryRouter.use(requireSession);
inventoryRouter.use((_req, res, next) => {
  try {
    requireOwnerAccess(res);
    next();
  } catch (error) {
    next(error);
  }
});

inventoryRouter.get("/", async (_req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  assertPlanFeature(business.plan, "inventoryEnabled");
  const rows = await db
    .select()
    .from(inventory)
    .where(eq(inventory.businessId, businessId))
    .orderBy(desc(inventory.updatedAt));

  res.json({
    data: rows.map((item) => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      stock: item.stock,
      minStock: item.minStock,
      buyPriceValue: item.buyPrice,
      buyPrice: formatRupiahCompact(item.buyPrice),
      sellPriceValue: item.sellPrice,
      sellPrice: formatRupiahCompact(item.sellPrice),
      status: inventoryStatus(item.stock, item.minStock),
    })),
  });
});

inventoryRouter.post("/", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const payload = inventorySchema.parse(req.body);
  assertPlanFeature(business.plan, "inventoryEnabled");
  assertSubscriptionWritable(business.subscriptionStatus, business.currentPeriodEndsAt);
  const [created] = await db
    .insert(inventory)
    .values({
      id: crypto.randomUUID(),
      businessId,
      ...payload,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  res.status(201).json({ data: created });
});

inventoryRouter.patch("/:id", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const { id } = inventoryParamsSchema.parse(req.params);
  const payload = inventorySchema.partial().parse(req.body);
  assertPlanFeature(business.plan, "inventoryEnabled");
  assertSubscriptionWritable(business.subscriptionStatus, business.currentPeriodEndsAt);
  const [updated] = await db
    .update(inventory)
    .set({
      ...payload,
      updatedAt: new Date(),
    })
    .where(and(eq(inventory.id, id), eq(inventory.businessId, businessId)))
    .returning();

  if (!updated) {
    throw notFound("Item inventori tidak ditemukan.");
  }

  res.json({ data: updated });
});

inventoryRouter.patch("/:id/adjust-stock", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const { id } = inventoryParamsSchema.parse(req.params);
  const payload = adjustStockSchema.parse(req.body);
  assertPlanFeature(business.plan, "inventoryEnabled");
  assertSubscriptionWritable(business.subscriptionStatus, business.currentPeriodEndsAt);
  const [item] = await db
    .select()
    .from(inventory)
    .where(and(eq(inventory.id, id), eq(inventory.businessId, businessId)));

  if (!item) {
    res.status(404).json({ error: "NOT_FOUND", message: "Item inventori tidak ditemukan." });
    return;
  }

  const nextStock = Math.max(0, item.stock + payload.delta);
  const [updated] = await db
    .update(inventory)
    .set({
      stock: nextStock,
      updatedAt: new Date(),
    })
    .where(eq(inventory.id, item.id))
    .returning();

  res.json({ data: updated });
});

inventoryRouter.delete("/:id", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const { id } = inventoryParamsSchema.parse(req.params);
  assertPlanFeature(business.plan, "inventoryEnabled");
  assertSubscriptionWritable(business.subscriptionStatus, business.currentPeriodEndsAt);
  const [deleted] = await db
    .delete(inventory)
    .where(and(eq(inventory.id, id), eq(inventory.businessId, businessId)))
    .returning();

  if (!deleted) {
    throw notFound("Item inventori tidak ditemukan.");
  }

  res.json({ data: { success: true } });
});

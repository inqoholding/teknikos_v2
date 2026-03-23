import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { customers, inventory, invoices, jobItems, jobs, technicians } from "../db/app-schema.js";
import { db } from "../db/index.js";
import { badRequest, notFound } from "../lib/errors.js";
import { assertPlanFeature, assertMonthlyJobLimit, assertSubscriptionWritable } from "../lib/plans.js";
import {
  requireCustomerForBusiness,
  requireInventoryForBusiness,
  requireJobForBusiness,
  requireTechnicianForBusiness,
} from "../lib/ownership.js";
import { getCurrentBusiness, requireBusiness, requireSession } from "../lib/session.js";
import { formatDateShort, formatRupiahCompact, formatSchedule } from "../utils/serializers.js";

const jobItemSchema = z.object({
  inventoryId: z.string().optional().nullable(),
  kind: z.enum(["service", "sparepart"]).default("service"),
  name: z.string().min(2),
  quantity: z.number().int().min(1).default(1),
  unitPrice: z.number().int().min(0).default(0),
  note: z.string().optional(),
});

const photoValueSchema = z
  .string()
  .refine((value) => value.startsWith("data:image/") || /^https?:\/\//.test(value), {
    message: "Foto harus berupa URL gambar atau data URL image.",
  });

const jobStatusSchema = z.enum([
  "pending",
  "assigned",
  "on_the_way",
  "in_progress",
  "done",
  "paid",
  "cancelled",
]);

const jobSchema = z.object({
  title: z.string().min(2),
  customerId: z.string().min(1),
  technicianId: z.string().optional().nullable(),
  technicianIds: z.array(z.string()).optional(),
  type: z.string().min(2),
  scheduleAt: z.coerce.date(),
  price: z.number().int().min(0),
  status: jobStatusSchema.default("pending"),
  priority: z.enum(["Normal", "Urgent"]).default("Normal"),
  description: z.string().default(""),
  location: z.string().min(4),
  beforePhotoUrl: photoValueSchema.optional().nullable(),
  afterPhotoUrl: photoValueSchema.optional().nullable(),
  cancelReason: z.string().optional().nullable(),
  items: z.array(jobItemSchema).default([]),
});

const activeTechnicianStatuses = new Set(["assigned", "on_the_way", "in_progress", "done"]);
const allowedTransitions: Record<string, string[]> = {
  pending: ["assigned", "cancelled"],
  assigned: ["on_the_way", "cancelled"],
  on_the_way: ["in_progress", "cancelled"],
  in_progress: ["done", "cancelled"],
  done: [],
  paid: [],
  cancelled: [],
};

function normalizeTechnicianIds(input?: string[] | null, fallbackId?: string | null) {
  const source = input && input.length > 0 ? input : fallbackId ? [fallbackId] : [];
  return Array.from(new Set(source.map((value) => value.trim()).filter(Boolean)));
}

function isInitialJobStatus(status: string) {
  return status === "pending" || status === "assigned";
}

function requireValidTransition(currentStatus: string, nextStatus: string) {
  if (currentStatus === nextStatus) {
    return;
  }

  const allowed = allowedTransitions[currentStatus] ?? [];
  if (!allowed.includes(nextStatus)) {
    throw badRequest(`Status job tidak bisa pindah dari ${currentStatus} ke ${nextStatus}.`);
  }
}

function getJobTotalPrice(price: number, items: Array<{ totalPrice: number }>) {
  const itemsTotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  return itemsTotal > 0 ? itemsTotal : price;
}

async function nextJobNumber(businessId: string) {
  const existing = await db.select({ id: jobs.id }).from(jobs).where(eq(jobs.businessId, businessId));
  return `JOB-${String(existing.length + 1).padStart(3, "0")}`;
}

async function nextInvoiceNumber() {
  return `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
}

async function validateJobRelations(input: {
  businessId: string;
  customerId?: string;
  technicianIds: string[];
  status: string;
  cancelReason?: string | null;
}) {
  if (input.customerId) {
    await requireCustomerForBusiness(input.customerId, input.businessId);
  }

  for (const technicianId of input.technicianIds) {
    await requireTechnicianForBusiness(technicianId, input.businessId);
  }

  if (activeTechnicianStatuses.has(input.status) && input.technicianIds.length === 0) {
    throw badRequest("Job dengan status ini harus memiliki minimal satu teknisi.");
  }

  if (input.status === "cancelled" && !input.cancelReason?.trim()) {
    throw badRequest("Alasan pembatalan wajib diisi saat job dibatalkan.");
  }
}

async function validateJobItems(
  businessId: string,
  items: Array<z.infer<typeof jobItemSchema>>,
) {
  for (const item of items) {
    if (item.kind !== "sparepart") {
      continue;
    }

    if (!item.inventoryId) {
      throw badRequest("Sparepart harus terhubung ke barang inventori.");
    }

    await requireInventoryForBusiness(item.inventoryId, businessId);
  }
}

function assertJobItemPlanAccess(
  plan: string | null | undefined,
  items: Array<z.infer<typeof jobItemSchema>>,
) {
  const usesInventory = items.some((item) => item.kind === "sparepart" || item.inventoryId);
  if (usesInventory) {
    assertPlanFeature(plan, "inventoryEnabled");
  }
}

async function syncInventoryUsage(
  businessId: string,
  previousItems: Array<typeof jobItems.$inferSelect>,
  nextItems: Array<z.infer<typeof jobItemSchema>>,
) {
  const previousUsage = new Map<string, number>();
  const nextUsage = new Map<string, number>();

  for (const item of previousItems) {
    if (item.kind !== "sparepart" || !item.inventoryId) {
      continue;
    }

    previousUsage.set(item.inventoryId, (previousUsage.get(item.inventoryId) ?? 0) + item.quantity);
  }

  for (const item of nextItems) {
    if (item.kind !== "sparepart" || !item.inventoryId) {
      continue;
    }

    nextUsage.set(item.inventoryId, (nextUsage.get(item.inventoryId) ?? 0) + item.quantity);
  }

  const inventoryIds = new Set([...previousUsage.keys(), ...nextUsage.keys()]);
  for (const inventoryId of inventoryIds) {
    const previousQuantity = previousUsage.get(inventoryId) ?? 0;
    const nextQuantity = nextUsage.get(inventoryId) ?? 0;
    const delta = nextQuantity - previousQuantity;

    if (delta === 0) {
      continue;
    }

    const inventoryItem = await requireInventoryForBusiness(inventoryId, businessId);
    if (delta > 0 && inventoryItem.stock < delta) {
      throw badRequest(`Stok ${inventoryItem.name} tidak cukup untuk dipakai di service.`);
    }

    await db
      .update(inventory)
      .set({
        stock: inventoryItem.stock - delta,
        updatedAt: new Date(),
      })
      .where(and(eq(inventory.id, inventoryId), eq(inventory.businessId, businessId)));
  }
}

async function replaceJobItems(
  businessId: string,
  jobId: string,
  nextItems: Array<z.infer<typeof jobItemSchema>>,
) {
  const previousItems = await db.select().from(jobItems).where(eq(jobItems.jobId, jobId));
  await validateJobItems(businessId, nextItems);
  await syncInventoryUsage(businessId, previousItems, nextItems);

  await db.delete(jobItems).where(eq(jobItems.jobId, jobId));
  if (nextItems.length === 0) {
    return;
  }

  await db.insert(jobItems).values(
    nextItems.map((item) => ({
      id: crypto.randomUUID(),
      jobId,
      inventoryId: item.inventoryId || null,
      kind: item.kind,
      name: item.name,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice,
      note: item.note || null,
    })),
  );
}

function getAssignedTechnicianIds(job: typeof jobs.$inferSelect) {
  return normalizeTechnicianIds(job.assignedTechnicianIds ?? [], job.technicianId);
}

function serializeJob(
  row: {
    job: typeof jobs.$inferSelect;
    customer?: typeof customers.$inferSelect | null;
  },
  technicianMap: Map<string, typeof technicians.$inferSelect>,
) {
  const technicianIds = getAssignedTechnicianIds(row.job);
  const assignedTechnicians = technicianIds
    .map((technicianId) => technicianMap.get(technicianId))
    .filter(Boolean)
    .map((technician) => technician!.name);

  return {
    id: row.job.id,
    number: row.job.number,
    title: row.job.title,
    customerId: row.job.customerId,
    customer: row.customer?.name ?? "Tanpa pelanggan",
    technicianId: technicianIds[0] ?? "",
    technicianIds,
    technician: assignedTechnicians.join(", ") || "Belum ditugaskan",
    technicians: assignedTechnicians,
    type: row.job.type,
    schedule: formatSchedule(row.job.scheduleAt),
    price: formatRupiahCompact(row.job.price),
    status: row.job.status,
    priority: row.job.priority as "Normal" | "Urgent",
    description: row.job.description,
    location: row.job.location,
    beforePhotoUrl: row.job.beforePhotoUrl,
    afterPhotoUrl: row.job.afterPhotoUrl,
    createdAt: row.job.createdAt,
    updatedAt: row.job.updatedAt,
    completedAt: row.job.completedAt,
    cancelReason: row.job.cancelReason,
  };
}

export const jobsRouter = Router();

jobsRouter.use(requireSession);

jobsRouter.get("/", async (req, res) => {
  const businessId = requireBusiness(res);
  const status = typeof req.query.status === "string" ? req.query.status : "";
  const technicianId = typeof req.query.technicianId === "string" ? req.query.technicianId : "";
  const q = typeof req.query.q === "string" ? req.query.q.trim().toLowerCase() : "";

  const [rows, businessTechnicians] = await Promise.all([
    db
      .select({
        job: jobs,
        customer: customers,
      })
      .from(jobs)
      .leftJoin(customers, eq(jobs.customerId, customers.id))
      .where(and(eq(jobs.businessId, businessId), status ? eq(jobs.status, status) : undefined))
      .orderBy(desc(jobs.scheduleAt)),
    db.select().from(technicians).where(eq(technicians.businessId, businessId)),
  ]);

  const technicianMap = new Map(businessTechnicians.map((technician) => [technician.id, technician]));
  const serialized = rows.map((row) => serializeJob(row, technicianMap));
  const filtered = serialized.filter((job) => {
    const matchesTechnician = technicianId ? job.technicianIds.includes(technicianId) : true;
    const haystack = `${job.number} ${job.title} ${job.customer} ${job.location} ${job.technician}`.toLowerCase();
    const matchesSearch = q ? haystack.includes(q) : true;
    return matchesTechnician && matchesSearch;
  });

  res.json({ data: filtered });
});

jobsRouter.get("/:id", async (req, res) => {
  const businessId = requireBusiness(res);
  const [row, businessTechnicians] = await Promise.all([
    db
      .select({
        job: jobs,
        customer: customers,
      })
      .from(jobs)
      .leftJoin(customers, eq(jobs.customerId, customers.id))
      .where(and(eq(jobs.id, req.params.id), eq(jobs.businessId, businessId))),
    db.select().from(technicians).where(eq(technicians.businessId, businessId)),
  ]);

  if (!row[0]) {
    res.status(404).json({ error: "NOT_FOUND", message: "Job tidak ditemukan." });
    return;
  }

  const technicianMap = new Map(businessTechnicians.map((technician) => [technician.id, technician]));
  const [items, jobInvoice] = await Promise.all([
    db.select().from(jobItems).where(eq(jobItems.jobId, row[0].job.id)),
    db.select().from(invoices).where(eq(invoices.jobId, row[0].job.id)),
  ]);

  res.json({
    data: {
      ...serializeJob(row[0], technicianMap),
      items: items.map((item) => ({
        ...item,
        unitPriceLabel: formatRupiahCompact(item.unitPrice),
        totalPriceLabel: formatRupiahCompact(item.totalPrice),
      })),
      invoice: jobInvoice[0]
        ? {
            ...jobInvoice[0],
            totalLabel: formatRupiahCompact(jobInvoice[0].total),
            dueDateLabel: formatDateShort(jobInvoice[0].dueDate),
          }
        : null,
    },
  });
});

jobsRouter.post("/", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const payload = jobSchema.parse(req.body);
  assertSubscriptionWritable(business.subscriptionStatus);
  if (!isInitialJobStatus(payload.status)) {
    throw badRequest("Job baru hanya bisa dibuat dengan status pending atau assigned.");
  }

  const technicianIds = normalizeTechnicianIds(payload.technicianIds, payload.technicianId);
  if (technicianIds.length > 1) {
    assertPlanFeature(business.plan, "multiTechnicianEnabled");
  }
  assertJobItemPlanAccess(business.plan, payload.items);
  await assertMonthlyJobLimit(businessId, business.plan, payload.scheduleAt);
  await validateJobRelations({
    businessId,
    customerId: payload.customerId,
    technicianIds,
    status: payload.status,
    cancelReason: payload.cancelReason || null,
  });

  const now = new Date();
  const jobId = crypto.randomUUID();
  await validateJobItems(businessId, payload.items);
  const resolvedPrice = getJobTotalPrice(
    payload.price,
    payload.items.map((item) => ({ totalPrice: item.quantity * item.unitPrice })),
  );

  const [created] = await db
    .insert(jobs)
    .values({
      id: jobId,
      businessId,
      number: await nextJobNumber(businessId),
      title: payload.title,
      customerId: payload.customerId,
      technicianId: technicianIds[0] ?? null,
      assignedTechnicianIds: technicianIds,
      type: payload.type,
      scheduleAt: payload.scheduleAt,
      price: resolvedPrice,
      status: payload.status,
      priority: payload.priority,
      description: payload.description,
      location: payload.location,
      beforePhotoUrl: payload.beforePhotoUrl || null,
      afterPhotoUrl: payload.afterPhotoUrl || null,
      cancelReason: payload.cancelReason || null,
      completedAt: null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  await replaceJobItems(businessId, jobId, payload.items);

  res.status(201).json({ data: created });
});

jobsRouter.patch("/:id", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const payload = jobSchema.partial().parse(req.body);
  assertSubscriptionWritable(business.subscriptionStatus);
  const { items: _items, beforePhotoUrl, afterPhotoUrl, ...jobUpdates } = payload;
  const currentJob = await requireJobForBusiness(req.params.id, businessId);

  const nextStatus = payload.status ?? currentJob.status;
  const currentTechnicianIds = getAssignedTechnicianIds(currentJob);
  const nextTechnicianIds =
    payload.technicianIds !== undefined
      ? normalizeTechnicianIds(payload.technicianIds)
      : payload.technicianId !== undefined
        ? normalizeTechnicianIds(undefined, payload.technicianId || null)
        : currentTechnicianIds;
  const nextCancelReason =
    payload.cancelReason === undefined ? currentJob.cancelReason : payload.cancelReason || null;
  const nextCustomerId = payload.customerId ?? currentJob.customerId;
  const nextItems = payload.items ?? null;
  if (nextTechnicianIds.length > 1) {
    assertPlanFeature(business.plan, "multiTechnicianEnabled");
  }
  assertJobItemPlanAccess(business.plan, nextItems ?? []);

  if (payload.status) {
    requireValidTransition(currentJob.status, payload.status);
  }

  await validateJobRelations({
    businessId,
    customerId: nextCustomerId,
    technicianIds: nextTechnicianIds,
    status: nextStatus,
    cancelReason: nextCancelReason,
  });

  const resolvedPrice =
    nextItems !== null
      ? getJobTotalPrice(
          payload.price ?? currentJob.price,
          nextItems.map((item) => ({ totalPrice: item.quantity * item.unitPrice })),
        )
      : payload.price ?? currentJob.price;

  const [updated] = await db
    .update(jobs)
    .set({
      ...jobUpdates,
      price: resolvedPrice,
      beforePhotoUrl: beforePhotoUrl === undefined ? undefined : beforePhotoUrl || null,
      afterPhotoUrl: afterPhotoUrl === undefined ? undefined : afterPhotoUrl || null,
      technicianId: nextTechnicianIds[0] ?? null,
      assignedTechnicianIds: nextTechnicianIds,
      cancelReason:
        payload.cancelReason === undefined
          ? nextStatus === "cancelled"
            ? nextCancelReason
            : undefined
          : nextCancelReason,
      completedAt:
        nextStatus === "done"
          ? currentJob.completedAt ?? new Date()
          : payload.status === "cancelled"
            ? null
            : undefined,
      updatedAt: new Date(),
    })
    .where(and(eq(jobs.id, req.params.id), eq(jobs.businessId, businessId)))
    .returning();

  if (!updated) {
    throw notFound("Job tidak ditemukan.");
  }

  if (nextItems !== null) {
    await replaceJobItems(businessId, currentJob.id, nextItems);
  }

  res.json({ data: updated });
});

jobsRouter.delete("/:id", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  assertSubscriptionWritable(business.subscriptionStatus);
  await requireJobForBusiness(req.params.id, businessId);
  await db.delete(jobs).where(and(eq(jobs.id, req.params.id), eq(jobs.businessId, businessId)));
  res.json({ data: { success: true } });
});

jobsRouter.post("/:id/invoice", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  assertSubscriptionWritable(business.subscriptionStatus);
  const job = await requireJobForBusiness(req.params.id, businessId);

  if (job.status === "cancelled") {
    throw badRequest("Invoice tidak bisa dibuat dari job yang dibatalkan.");
  }

  const [existing] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.jobId, job.id), eq(invoices.businessId, businessId)));
  if (existing) {
    res.json({ data: existing });
    return;
  }

  const itemTotals = await db
    .select({ totalPrice: jobItems.totalPrice })
    .from(jobItems)
    .where(eq(jobItems.jobId, job.id));
  const total = getJobTotalPrice(job.price, itemTotals);
  if (total <= 0) {
    throw badRequest("Invoice tidak bisa dibuat jika total job masih nol.");
  }

  const [created] = await db
    .insert(invoices)
    .values({
      id: crypto.randomUUID(),
      businessId,
      customerId: job.customerId,
      jobId: job.id,
      number: await nextInvoiceNumber(),
      total,
      status: "Sent",
      dueDate: new Date(job.scheduleAt.getTime() + 3 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  res.status(201).json({ data: created });
});

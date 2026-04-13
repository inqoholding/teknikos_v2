import { Router } from "express";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { customers, invoices, jobs } from "../db/app-schema.js";
import { db } from "../db/index.js";
import { badRequest, notFound } from "../lib/errors.js";
import { assertSubscriptionWritable } from "../lib/plans.js";
import {
  requireCustomerForBusiness,
  requireInvoiceForBusiness,
  requireJobForBusiness,
} from "../lib/ownership.js";
import { getCurrentBusiness, requireBusiness, requireOwnerAccess, requireSession } from "../lib/session.js";
import { formatDateShort, formatRupiahCompact, invoiceStatus } from "../utils/serializers.js";
import { entityIdSchema, nullableDateField, nullableOptionalTextField } from "../lib/validation.js";

const invoiceSchema = z.object({
  customerId: entityIdSchema,
  jobId: entityIdSchema.optional().nullable(),
  total: z.number().int().min(0),
  status: z.enum(["Draft", "Sent", "Paid", "Overdue"]).default("Draft"),
  dueDate: z.coerce.date(),
  paidAmount: z.number().int().min(0).optional(),
  paymentMethod: nullableOptionalTextField("Metode pembayaran", 80),
  paidAt: nullableDateField,
}).strict();

const invoiceParamsSchema = z.object({
  id: entityIdSchema,
}).strict();

const invoiceQuerySchema = z.object({
  status: z.enum(["Draft", "Sent", "Paid", "Overdue"]).optional().or(z.literal("")).default(""),
}).strict();

async function nextInvoiceNumber() {
  return `INV-${new Date().getFullYear()}-${String(Date.now()).slice(-4)}`;
}

async function validateInvoiceRelations(input: {
  businessId: string;
  customerId: string;
  jobId?: string | null;
}) {
  const customer = await requireCustomerForBusiness(input.customerId, input.businessId);
  if (!input.jobId) {
    return { customer, job: null };
  }

  const job = await requireJobForBusiness(input.jobId, input.businessId);
  if (job.customerId !== customer.id) {
    throw badRequest("Invoice harus terhubung ke pelanggan yang sama dengan job.");
  }

  return { customer, job };
}

export const invoicesRouter = Router();

invoicesRouter.use(requireSession);
invoicesRouter.use((_req, res, next) => {
  try {
    requireOwnerAccess(res);
    next();
  } catch (error) {
    next(error);
  }
});

invoicesRouter.get("/", async (req, res) => {
  const businessId = requireBusiness(res);
  const { status } = invoiceQuerySchema.parse(req.query);
  const rows = await db
    .select({
      invoice: invoices,
      customer: customers,
      job: jobs,
    })
    .from(invoices)
    .leftJoin(customers, eq(invoices.customerId, customers.id))
    .leftJoin(jobs, eq(invoices.jobId, jobs.id))
    .where(
      and(
        eq(invoices.businessId, businessId),
        status ? eq(invoices.status, status) : undefined,
      ),
    )
    .orderBy(desc(invoices.createdAt));

  res.json({
    data: rows.map(({ invoice, customer, job }) => {
      const resolvedStatus = invoiceStatus(invoice.status, invoice.dueDate, invoice.paidAt);
      return {
        id: invoice.id,
        number: invoice.number,
        customer: customer?.name ?? "Tanpa pelanggan",
        job: job?.number ?? "-",
        total: formatRupiahCompact(invoice.total),
        status: resolvedStatus,
        dueDate: formatDateShort(invoice.dueDate),
      };
    }),
  });
});

invoicesRouter.post("/", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const payload = invoiceSchema.parse(req.body);
  assertSubscriptionWritable(business.subscriptionStatus, business.currentPeriodEndsAt);
  await validateInvoiceRelations({
    businessId,
    customerId: payload.customerId,
    jobId: payload.jobId || null,
  });

  const paidAt = payload.status === "Paid" ? payload.paidAt ?? new Date() : payload.paidAt ?? null;
  const [created] = await db
    .insert(invoices)
    .values({
      id: crypto.randomUUID(),
      businessId,
      number: await nextInvoiceNumber(),
      ...payload,
      jobId: payload.jobId || null,
      paymentMethod: payload.paymentMethod || null,
      paidAmount: payload.paidAmount ?? (payload.status === "Paid" ? payload.total : 0),
      paidAt,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  res.status(201).json({ data: created });
});

invoicesRouter.patch("/:id", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const { id } = invoiceParamsSchema.parse(req.params);
  const payload = invoiceSchema.partial().parse(req.body);
  assertSubscriptionWritable(business.subscriptionStatus, business.currentPeriodEndsAt);
  const currentInvoice = await requireInvoiceForBusiness(id, businessId);
  const nextCustomerId = payload.customerId ?? currentInvoice.customerId;
  const nextJobId = payload.jobId === undefined ? currentInvoice.jobId : payload.jobId || null;
  await validateInvoiceRelations({
    businessId,
    customerId: nextCustomerId,
    jobId: nextJobId,
  });

  const nextStatus = payload.status ?? currentInvoice.status;
  const nextTotal = payload.total ?? currentInvoice.total;
  const [updated] = await db
    .update(invoices)
    .set({
      ...payload,
      jobId: payload.jobId === undefined ? undefined : nextJobId,
      paymentMethod:
        payload.paymentMethod === undefined ? undefined : payload.paymentMethod || null,
      paidAmount:
        payload.paidAmount === undefined && nextStatus === "Paid"
          ? currentInvoice.paidAmount || nextTotal
          : payload.paidAmount,
      paidAt:
        payload.paidAt === undefined && nextStatus === "Paid"
          ? currentInvoice.paidAt ?? new Date()
          : payload.paidAt,
      updatedAt: new Date(),
    })
    .where(and(eq(invoices.id, id), eq(invoices.businessId, businessId)))
    .returning();

  if (!updated) {
    throw notFound("Invoice tidak ditemukan.");
  }

  res.json({ data: updated });
});

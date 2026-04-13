import { Router } from "express";
import { and, desc, eq, like, or } from "drizzle-orm";
import { z } from "zod";
import { contracts, customers, invoices, jobs } from "../db/app-schema.js";
import { db } from "../db/index.js";
import { badRequest, notFound } from "../lib/errors.js";
import { assertSubscriptionWritable } from "../lib/plans.js";
import { getCurrentBusiness, requireBusiness, requireOwnerAccess, requireSession } from "../lib/session.js";
import { contractStatus, formatDateShort, formatRupiahCompact, formatSchedule, invoiceStatus } from "../utils/serializers.js";
import { entityIdSchema, optionalEmailField, phoneField, shortSearchField, stringArrayField, textField } from "../lib/validation.js";

const customerSchema = z.object({
  name: textField("Nama pelanggan", 2, 120),
  phone: phoneField,
  email: optionalEmailField,
  address: textField("Alamat", 4, 240),
  units: stringArrayField("Unit pelanggan", 120, 25).default([]),
}).strict();

const customerParamsSchema = z.object({
  id: entityIdSchema,
}).strict();

const customerQuerySchema = z.object({
  q: shortSearchField,
}).strict();

export const customersRouter = Router();

customersRouter.use(requireSession);
customersRouter.use((_req, res, next) => {
  try {
    requireOwnerAccess(res);
    next();
  } catch (error) {
    next(error);
  }
});

customersRouter.get("/", async (req, res) => {
  const businessId = requireBusiness(res);
  const { q } = customerQuerySchema.parse(req.query);
  const filter = and(
    eq(customers.businessId, businessId),
    q
      ? or(
          like(customers.name, `%${q}%`),
          like(customers.phone, `%${q}%`),
          like(customers.address, `%${q}%`),
        )
      : undefined,
  );

  const [customerRows, jobRows, contractRows, invoiceRows] = await Promise.all([
    db.select().from(customers).where(filter).orderBy(desc(customers.createdAt)),
    db.select().from(jobs).where(eq(jobs.businessId, businessId)),
    db.select().from(contracts).where(eq(contracts.businessId, businessId)),
    db.select().from(invoices).where(eq(invoices.businessId, businessId)),
  ]);

  res.json({
    data: customerRows.map((customer) => {
      const history = jobRows.filter((job) => job.customerId === customer.id);
      const customerInvoices = invoiceRows.filter((invoice) => invoice.customerId === customer.id);
      const unpaidInvoices = customerInvoices.filter(
        (invoice) => invoiceStatus(invoice.status, invoice.dueDate, invoice.paidAt) !== "Paid",
      );
      const overdueInvoices = unpaidInvoices.filter(
        (invoice) => invoiceStatus(invoice.status, invoice.dueDate, invoice.paidAt) === "Overdue",
      );
      const lastCompletedJob = [...history]
        .filter((job) => ["done", "paid"].includes(job.status) && job.scheduleAt <= new Date())
        .sort((a, b) => (b.completedAt ?? b.scheduleAt).getTime() - (a.completedAt ?? a.scheduleAt).getTime())[0];
      const activeContract = contractRows
        .filter((contract) => contract.customerId === customer.id)
        .sort((a, b) => b.nextServiceAt.getTime() - a.nextServiceAt.getTime())[0];
      const contractLabel = activeContract
        ? `${contractStatus(activeContract.nextServiceAt, activeContract.status)} · Next ${formatDateShort(activeContract.nextServiceAt)}`
        : "Tidak ada";
      const resolvedContractStatus = activeContract
        ? contractStatus(activeContract.nextServiceAt, activeContract.status)
        : null;
      const daysSinceLastService = lastCompletedJob
        ? (Date.now() - new Date(lastCompletedJob.completedAt ?? lastCompletedJob.scheduleAt).getTime()) /
          (1000 * 60 * 60 * 24)
        : Number.POSITIVE_INFINITY;

      let health: "Aktif" | "Kontrak Aktif" | "Perlu Follow Up" | "Butuh Billing" | "Dormant" = "Dormant";
      let nextAction = "Lengkapi profil pelanggan dan unit agar tim lapangan siap bekerja.";

      if (overdueInvoices.length > 0) {
        health = "Butuh Billing";
        nextAction = `${overdueInvoices.length} invoice overdue perlu diingatkan pembayarannya.`;
      } else if (resolvedContractStatus === "Hampir Jatuh Tempo") {
        health = "Perlu Follow Up";
        nextAction = `Jadwalkan service kontrak sebelum ${formatDateShort(activeContract?.nextServiceAt ?? null)}.`;
      } else if (resolvedContractStatus === "Aktif") {
        health = "Kontrak Aktif";
        nextAction = "Jaga SLA dan cari peluang upsell unit atau add-on service.";
      } else if (daysSinceLastService <= 30) {
        health = "Aktif";
        nextAction = "Minta review pelanggan dan tawarkan repeat order berikutnya.";
      } else if (history.length > 0) {
        health = "Perlu Follow Up";
        nextAction = "Pelanggan lama perlu dihubungi ulang untuk repeat order.";
      }

      return {
        id: customer.id,
        name: customer.name,
        phone: customer.phone,
        email: customer.email ?? "",
        address: customer.address,
        units: customer.units,
        totalJobs: history.length,
        lastService: lastCompletedJob ? formatDateShort(lastCompletedJob.completedAt ?? lastCompletedJob.scheduleAt) : "Belum ada",
        contract: contractLabel,
        health,
        nextAction,
        openInvoices: unpaidInvoices.length,
        balanceDue: formatRupiahCompact(unpaidInvoices.reduce((sum, invoice) => sum + invoice.total, 0)),
      };
    }),
  });
});

customersRouter.get("/:id", async (req, res) => {
  const businessId = requireBusiness(res);
  const { id } = customerParamsSchema.parse(req.params);
  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, id), eq(customers.businessId, businessId)));

  if (!customer) {
    res.status(404).json({ error: "NOT_FOUND", message: "Pelanggan tidak ditemukan." });
    return;
  }

  const [jobHistory, activeContracts] = await Promise.all([
    db
      .select()
      .from(jobs)
      .where(and(eq(jobs.customerId, customer.id), eq(jobs.businessId, businessId)))
      .orderBy(desc(jobs.scheduleAt))
      .limit(10),
    db
      .select()
      .from(contracts)
      .where(and(eq(contracts.customerId, customer.id), eq(contracts.businessId, businessId)))
      .orderBy(desc(contracts.nextServiceAt)),
  ]);

  res.json({
    data: {
      ...customer,
      jobHistory: jobHistory.map((job) => ({
        id: job.id,
        number: job.number,
        title: job.title,
        status: job.status,
        schedule: formatSchedule(job.scheduleAt),
        price: formatRupiahCompact(job.price),
      })),
      contracts: activeContracts.map((contract) => ({
        id: contract.id,
        plan: contract.plan,
        value: formatRupiahCompact(contract.value),
        nextService: formatDateShort(contract.nextServiceAt),
        status: contractStatus(contract.nextServiceAt, contract.status),
      })),
    },
  });
});

customersRouter.post("/", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const payload = customerSchema.parse(req.body);
  assertSubscriptionWritable(business.subscriptionStatus, business.currentPeriodEndsAt);
  const [created] = await db
    .insert(customers)
    .values({
      id: crypto.randomUUID(),
      businessId,
      name: payload.name,
      phone: payload.phone,
      email: payload.email || null,
      address: payload.address,
      units: payload.units,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    .returning();

  res.status(201).json({ data: created });
});

customersRouter.patch("/:id", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const { id } = customerParamsSchema.parse(req.params);
  const payload = customerSchema.partial().parse(req.body);
  assertSubscriptionWritable(business.subscriptionStatus, business.currentPeriodEndsAt);
  const [updated] = await db
    .update(customers)
    .set({
      ...payload,
      email: payload.email === "" ? null : payload.email,
      updatedAt: new Date(),
    })
    .where(and(eq(customers.id, id), eq(customers.businessId, businessId)))
    .returning();

  if (!updated) {
    throw notFound("Pelanggan tidak ditemukan.");
  }

  res.json({ data: updated });
});

customersRouter.delete("/:id", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const { id } = customerParamsSchema.parse(req.params);
  assertSubscriptionWritable(business.subscriptionStatus, business.currentPeriodEndsAt);

  const [existingJobs] = await db.select({ id: jobs.id }).from(jobs).where(eq(jobs.customerId, id)).limit(1);
  if (existingJobs) {
    throw badRequest("Gagal. Pelanggan ini sudah memiliki data job operasional dan invoice. Menghapus pelanggan akan merusak riwayat akuntansi Anda. Ubah data pelanggan jika ada salah ketik, atau biarkan sebagai arsip.");
  }

  const [deleted] = await db
    .delete(customers)
    .where(and(eq(customers.id, id), eq(customers.businessId, businessId)))
    .returning();

  if (!deleted) {
    throw notFound("Pelanggan tidak ditemukan.");
  }

  res.json({ data: { success: true } });
});

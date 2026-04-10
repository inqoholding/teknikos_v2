import { Router } from "express";
import { eq } from "drizzle-orm";
import { businesses, contracts, customers, inventory, invoices, jobs, technicians } from "../db/app-schema.js";
import { db } from "../db/index.js";
import { serializeSubscriptionState } from "../lib/plans.js";
import { requireBusiness, requireOwnerAccess, requireSession } from "../lib/session.js";
import {
  contractStatus,
  formatDateShort,
  formatRupiahCompact,
  formatSchedule,
  inventoryStatus,
  invoiceStatus,
} from "../utils/serializers.js";

export const dashboardRouter = Router();

dashboardRouter.use(requireSession);
dashboardRouter.use((_req, res, next) => {
  try {
    requireOwnerAccess(res);
    next();
  } catch (error) {
    next(error);
  }
});

function getAssignedTechnicianIds(job: typeof jobs.$inferSelect) {
  const rawIds =
    Array.isArray(job.assignedTechnicianIds) && job.assignedTechnicianIds.length > 0
      ? job.assignedTechnicianIds
      : job.technicianId
        ? [job.technicianId]
        : [];

  return Array.from(new Set(rawIds.map((value) => value.trim()).filter(Boolean)));
}

dashboardRouter.get("/stats", async (_req, res) => {
  const businessId = requireBusiness(res);
  const [business, allJobs, allTechs, allCustomers, allContracts, allInventory, allInvoices] =
    await Promise.all([
      db.select().from(businesses).where(eq(businesses.id, businessId)),
      db.select().from(jobs).where(eq(jobs.businessId, businessId)),
      db.select().from(technicians).where(eq(technicians.businessId, businessId)),
      db.select().from(customers).where(eq(customers.businessId, businessId)),
      db.select().from(contracts).where(eq(contracts.businessId, businessId)),
      db.select().from(inventory).where(eq(inventory.businessId, businessId)),
      db.select().from(invoices).where(eq(invoices.businessId, businessId)),
    ]);

  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Makassar", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(now);
  const witaYear = parseInt(parts.find(p => p.type === "year")!.value);
  const witaMonth = parseInt(parts.find(p => p.type === "month")!.value) - 1;
  const witaDay = parseInt(parts.find(p => p.type === "day")!.value);

  const startOfToday = new Date(Date.UTC(witaYear, witaMonth, witaDay) - 8 * 3600 * 1000);
  const endOfToday = new Date(startOfToday.getTime() + 24 * 3600 * 1000);
  const startOfMonth = new Date(Date.UTC(witaYear, witaMonth, 1) - 8 * 3600 * 1000);
  const endOfMonth = new Date(Date.UTC(witaYear, witaMonth + 1, 1) - 8 * 3600 * 1000);
  const customerMap = new Map(allCustomers.map((customer) => [customer.id, customer]));
  const technicianMap = new Map(allTechs.map((technician) => [technician.id, technician]));
  const invoicedJobIds = new Set(allInvoices.filter((invoice) => invoice.jobId).map((invoice) => invoice.jobId));
  const unpaidInvoices = allInvoices.filter(
    (invoice) => invoiceStatus(invoice.status, invoice.dueDate, invoice.paidAt) !== "Paid",
  );
  const overdueInvoices = unpaidInvoices.filter(
    (invoice) => invoiceStatus(invoice.status, invoice.dueDate, invoice.paidAt) === "Overdue",
  );
  const businessRecord = business[0] ?? null;

  const todayJobs = allJobs.filter((job) => job.scheduleAt >= startOfToday && job.scheduleAt < endOfToday).length;
  const activeJobs = allJobs.filter((job) =>
    ["assigned", "on_the_way", "in_progress"].includes(job.status),
  ).length;
  const doneToday = allJobs.filter(
    (job) => job.completedAt && job.completedAt >= startOfToday && job.completedAt < endOfToday,
  ).length;
  const activeTechnicians = allTechs.filter((tech) =>
    ["Aktif", "Bertugas", "Standby"].includes(tech.status),
  ).length;
  const activeContracts = allContracts.filter(
    (contract) => contractStatus(contract.nextServiceAt, contract.status) === "Aktif",
  ).length;
  const lowStockItems = allInventory.filter(
    (item) => inventoryStatus(item.stock, item.minStock) !== "Aman",
  );
  const monthlyRevenue = allInvoices
    .filter(
      (invoice) =>
        invoice.status === "Paid" &&
        (invoice.paidAt ?? invoice.createdAt) >= startOfMonth &&
        (invoice.paidAt ?? invoice.createdAt) < endOfMonth,
    )
    .reduce((sum, invoice) => sum + invoice.total, 0);

  const recentJobs = [...allJobs]
    .sort((a, b) => b.scheduleAt.getTime() - a.scheduleAt.getTime())
    .slice(0, 5)
    .map((job) => ({
      id: job.id,
      number: job.number,
      title: job.title,
      schedule: formatSchedule(job.scheduleAt),
      status: job.status,
      price: formatRupiahCompact(job.price),
    }));

  const revenueBars = Array.from({ length: 7 }).map((_, index) => {
    const offsetDays = 6 - index;
    const date = new Date(startOfToday.getTime() - offsetDays * 24 * 3600 * 1000);
    const next = new Date(date.getTime() + 24 * 3600 * 1000);
    const value = allInvoices
      .filter(
        (invoice) =>
          invoice.status === "Paid" &&
          (invoice.paidAt ?? invoice.createdAt) >= date &&
          (invoice.paidAt ?? invoice.createdAt) < next,
      )
      .reduce((sum, invoice) => sum + invoice.total, 0);

    return {
      label: new Intl.DateTimeFormat("id-ID", { weekday: "short", timeZone: "Asia/Makassar" }).format(date),
      value,
      valueLabel: formatRupiahCompact(value),
    };
  });

  const statusLabels = ["pending", "assigned", "on_the_way", "in_progress", "done"];
  const statusBreakdown = statusLabels.map((label) => ({
    label,
    value: allJobs.filter((job) => job.status === label).length,
  }));

  const readyToInvoiceCount = allJobs.filter(
    (job) =>
      ["assigned", "on_the_way", "in_progress", "done"].includes(job.status) &&
      !invoicedJobIds.has(job.id) &&
      job.status !== "cancelled" &&
      job.price > 0,
  ).length;
  const unassignedJobsCount = allJobs.filter(
    (job) => !["done", "cancelled"].includes(job.status) && getAssignedTechnicianIds(job).length === 0,
  ).length;
  const followUpCustomersCount = allCustomers.filter((customer) => {
    const customerContracts = allContracts.filter((contract) => contract.customerId === customer.id);
    const latestContract = [...customerContracts].sort(
      (a, b) => b.nextServiceAt.getTime() - a.nextServiceAt.getTime(),
    )[0];
    const latestContractStatus = latestContract
      ? contractStatus(latestContract.nextServiceAt, latestContract.status)
      : null;
    const customerInvoices = allInvoices.filter((invoice) => invoice.customerId === customer.id);
    const hasOverdueInvoice = customerInvoices.some(
      (invoice) => invoiceStatus(invoice.status, invoice.dueDate, invoice.paidAt) === "Overdue",
    );
    const recentCompletedJob = [...allJobs]
      .filter((job) => job.customerId === customer.id && job.completedAt)
      .sort((a, b) => (b.completedAt ?? b.scheduleAt).getTime() - (a.completedAt ?? a.scheduleAt).getTime())[0];

    const daysSinceLastVisit = recentCompletedJob?.completedAt
      ? (Date.now() - recentCompletedJob.completedAt.getTime()) / (1000 * 60 * 60 * 24)
      : Number.POSITIVE_INFINITY;

    return hasOverdueInvoice || latestContractStatus === "Hampir Jatuh Tempo" || daysSinceLastVisit > 45;
  }).length;

  const opsQueues = [
    {
      id: "unassigned",
      label: "Job Belum Ditugaskan",
      count: unassignedJobsCount,
      description: "Queue dispatch untuk job yang masih perlu teknisi.",
      href: "/jobs?status=pending",
      tone: "warning" as const,
    },
    {
      id: "ready-to-bill",
      label: "Siap Ditagih",
      count: readyToInvoiceCount,
      description: "Job aktif tanpa invoice, siap lanjut ke billing.",
      href: "/jobs",
      tone: "info" as const,
    },
    {
      id: "overdue-invoices",
      label: "Invoice Overdue",
      count: overdueInvoices.length,
      description: "Perlu reminder pembayaran agar cashflow tetap sehat.",
      href: "/invoices",
      tone: "danger" as const,
      amountLabel: formatRupiahCompact(overdueInvoices.reduce((sum, invoice) => sum + invoice.total, 0)),
    },
    {
      id: "follow-up",
      label: "Pelanggan Perlu Follow Up",
      count: followUpCustomersCount,
      description: "Gabungan kontrak mendekati due, invoice overdue, dan pelanggan lama tidak aktif.",
      href: "/customers",
      tone: "success" as const,
    },
  ];

  const dispatchToday = allJobs
    .filter((job) => job.scheduleAt >= startOfToday && job.scheduleAt < endOfToday && job.status !== "cancelled")
    .sort((a, b) => a.scheduleAt.getTime() - b.scheduleAt.getTime())
    .slice(0, 8)
    .map((job) => {
      const assignedTechnicians = getAssignedTechnicianIds(job)
        .map((technicianId) => technicianMap.get(technicianId)?.name)
        .filter(Boolean) as string[];

      return {
        id: job.id,
        number: job.number,
        title: job.title,
        customer: customerMap.get(job.customerId)?.name ?? "Tanpa pelanggan",
        technicians: assignedTechnicians,
        schedule: formatSchedule(job.scheduleAt),
        location: job.location,
        status: job.status,
        priority: job.priority as "Normal" | "Urgent",
      };
    });

  res.json({
    data: {
      todayJobs,
      activeJobs,
      doneToday,
      activeTechnicians,
      totalCustomers: allCustomers.length,
      activeContracts,
      monthlyRevenue,
      monthlyRevenueLabel: formatRupiahCompact(monthlyRevenue),
      lowStockCount: lowStockItems.length,
      lowStockItems: lowStockItems.map((item) => ({
        id: item.id,
        name: item.name,
        stock: item.stock,
        minStock: item.minStock,
      })),
      recentJobs,
      revenueBars,
      statusBreakdown,
      opsQueues,
      dispatchToday,
      business: businessRecord
        ? {
            ...businessRecord,
            ...serializeSubscriptionState(businessRecord),
          }
        : null,
    },
  });
});

dashboardRouter.get("/technicians-live", async (_req, res) => {
  const businessId = requireBusiness(res);
  const rows = await db.select().from(technicians).where(eq(technicians.businessId, businessId));
  res.json({
    data: rows
      .filter((tech) => tech.latitude !== null && tech.longitude !== null)
      .map((tech) => ({
        id: tech.id,
        name: tech.name,
        status: tech.status,
        latitude: tech.latitude,
        longitude: tech.longitude,
        lastSeenAt: tech.lastSeenAt ? formatDateShort(tech.lastSeenAt) : null,
      })),
  });
});

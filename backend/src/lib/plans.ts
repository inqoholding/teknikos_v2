import { and, eq, gte, lt } from "drizzle-orm";
import { businesses, contracts, inventory, jobs, technicians } from "../db/app-schema.js";
import { db } from "../db/index.js";
import { badRequest, forbidden, notFound } from "./errors.js";

export const BUSINESS_PLANS = ["Starter", "Pro", "Bisnis"] as const;
export type BusinessPlan = (typeof BUSINESS_PLANS)[number];

export const SUBSCRIPTION_STATUSES = [
  "pending_payment",
  "paid",
  "active",
  "trialing",
  "past_due",
  "paused",
  "cancelled",
] as const;
export type SubscriptionStatus = (typeof SUBSCRIPTION_STATUSES)[number];

type PlanEntitlement = {
  key: BusinessPlan;
  label: string;
  maxTechnicians: number;
  maxMonthlyJobs: number;
  inventoryEnabled: boolean;
  contractsEnabled: boolean;
  multiTechnicianEnabled: boolean;
  advancedDashboardEnabled: boolean;
  adminReviewPriority: "standard" | "priority";
  highlights: string[];
};

const PLAN_ENTITLEMENTS: Record<BusinessPlan, PlanEntitlement> = {
  Starter: {
    key: "Starter",
    label: "Starter",
    maxTechnicians: 1,
    maxMonthlyJobs: 25,
    inventoryEnabled: false,
    contractsEnabled: false,
    multiTechnicianEnabled: false,
    advancedDashboardEnabled: false,
    adminReviewPriority: "standard",
    highlights: ["1 teknisi", "invoice manual", "job & pelanggan dasar"],
  },
  Pro: {
    key: "Pro",
    label: "Pro",
    maxTechnicians: 10,
    maxMonthlyJobs: 300,
    inventoryEnabled: true,
    contractsEnabled: true,
    multiTechnicianEnabled: true,
    advancedDashboardEnabled: true,
    adminReviewPriority: "standard",
    highlights: ["hingga 10 teknisi", "inventori & kontrak", "dashboard operasional penuh"],
  },
  Bisnis: {
    key: "Bisnis",
    label: "Bisnis",
    maxTechnicians: 50,
    maxMonthlyJobs: 5000,
    inventoryEnabled: true,
    contractsEnabled: true,
    multiTechnicianEnabled: true,
    advancedDashboardEnabled: true,
    adminReviewPriority: "priority",
    highlights: ["tim besar", "workflow penuh", "monitoring subscription prioritas"],
  },
};

const WRITABLE_SUBSCRIPTION_STATUSES = new Set<SubscriptionStatus>(["active", "trialing", "paid"]);

export function normalizeBusinessPlan(plan?: string | null): BusinessPlan {
  if (plan === "Pro" || plan === "Bisnis" || plan === "Starter") {
    return plan;
  }

  return "Starter";
}

export function normalizeSubscriptionStatus(status?: string | null): SubscriptionStatus {
  if (
    status === "pending_payment" ||
    status === "paid" ||
    status === "active" ||
    status === "trialing" ||
    status === "past_due" ||
    status === "paused" ||
    status === "cancelled"
  ) {
    return status;
  }

  return "pending_payment";
}

export function getPlanEntitlements(plan?: string | null) {
  return PLAN_ENTITLEMENTS[normalizeBusinessPlan(plan)];
}

export function getPlanCatalog() {
  return BUSINESS_PLANS.map((plan) => getPlanEntitlements(plan));
}

export function getSubscriptionLabel(status?: string | null) {
  const normalized = normalizeSubscriptionStatus(status);
  if (normalized === "pending_payment") return "Pending Payment";
  if (normalized === "paid") return "Paid";
  if (normalized === "active") return "Aktif";
  if (normalized === "trialing") return "Trial";
  if (normalized === "past_due") return "Pembayaran Jatuh Tempo";
  if (normalized === "paused") return "Dijeda";
  return "Dibatalkan";
}

export async function getBusinessSubscriptionContext(businessId: string) {
  const [business] = await db
    .select()
    .from(businesses)
    .where(eq(businesses.id, businessId));

  if (!business) {
    throw notFound("Bisnis tidak ditemukan.");
  }

  const plan = normalizeBusinessPlan(business.plan);
  const subscriptionStatus = normalizeSubscriptionStatus(business.subscriptionStatus);

  return {
    business,
    plan,
    subscriptionStatus,
    entitlements: getPlanEntitlements(plan),
  };
}

export function serializePlanState(plan?: string | null, subscriptionStatus?: string | null) {
  const entitlements = getPlanEntitlements(plan);
  return {
    plan: entitlements.key,
    subscriptionStatus: normalizeSubscriptionStatus(subscriptionStatus),
    subscriptionStatusLabel: getSubscriptionLabel(subscriptionStatus),
    entitlements,
  };
}

export function assertSubscriptionWritable(subscriptionStatus?: string | null) {
  const normalized = normalizeSubscriptionStatus(subscriptionStatus);
  if (!WRITABLE_SUBSCRIPTION_STATUSES.has(normalized)) {
    throw forbidden(
      normalized === "past_due"
        ? "Subscription perlu diperbarui sebelum data bisa diubah."
        : "Subscription bisnis ini sedang tidak aktif untuk perubahan data.",
    );
  }
}

export function assertPlanFeature(plan: string | null | undefined, feature: keyof Pick<
  PlanEntitlement,
  "inventoryEnabled" | "contractsEnabled" | "multiTechnicianEnabled" | "advancedDashboardEnabled"
>) {
  const entitlements = getPlanEntitlements(plan);
  if (entitlements[feature]) {
    return entitlements;
  }

  const featureLabels = {
    inventoryEnabled: "Inventori hanya tersedia mulai paket Pro.",
    contractsEnabled: "Kontrak servis hanya tersedia mulai paket Pro.",
    multiTechnicianEnabled: "Multi teknisi per job hanya tersedia mulai paket Pro.",
    advancedDashboardEnabled: "Dashboard operasional lanjutan hanya tersedia mulai paket Pro.",
  } as const;

  throw forbidden(featureLabels[feature]);
}

export async function assertTechnicianLimit(businessId: string, plan?: string | null) {
  const entitlements = getPlanEntitlements(plan);
  const existing = await db
    .select({ id: technicians.id })
    .from(technicians)
    .where(eq(technicians.businessId, businessId));

  if (existing.length >= entitlements.maxTechnicians) {
    throw badRequest(
      `Paket ${entitlements.label} maksimal ${entitlements.maxTechnicians} teknisi. Upgrade paket untuk menambah teknisi.`,
    );
  }
}

export async function assertMonthlyJobLimit(businessId: string, plan?: string | null, scheduleAt?: Date | null) {
  const entitlements = getPlanEntitlements(plan);
  const pivot = scheduleAt ?? new Date();
  const startOfMonth = new Date(pivot.getFullYear(), pivot.getMonth(), 1);
  const startOfNextMonth = new Date(pivot.getFullYear(), pivot.getMonth() + 1, 1);

  const existing = await db
    .select({ id: jobs.id })
    .from(jobs)
    .where(
      and(
        eq(jobs.businessId, businessId),
        gte(jobs.scheduleAt, startOfMonth),
        lt(jobs.scheduleAt, startOfNextMonth),
      ),
    );

  if (existing.length >= entitlements.maxMonthlyJobs) {
    throw badRequest(
      `Paket ${entitlements.label} maksimal ${entitlements.maxMonthlyJobs} job per bulan.`,
    );
  }
}

export async function getPlanUsageSnapshot(businessId: string) {
  const [technicianRows, inventoryRows, contractRows] = await Promise.all([
    db.select({ id: technicians.id }).from(technicians).where(eq(technicians.businessId, businessId)),
    db.select({ id: inventory.id }).from(inventory).where(eq(inventory.businessId, businessId)),
    db.select({ id: contracts.id }).from(contracts).where(eq(contracts.businessId, businessId)),
  ]);

  return {
    technicians: technicianRows.length,
    inventoryItems: inventoryRows.length,
    contracts: contractRows.length,
  };
}

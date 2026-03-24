import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { businesses } from "../db/app-schema.js";
import { user } from "../db/auth-schema.js";
import { badRequest, notFound } from "../lib/errors.js";
import { BUSINESS_PLANS, getPlanCatalog, normalizeBusinessPlan, serializeSubscriptionState } from "../lib/plans.js";
import {
  createOrStartWahaSession,
  disconnectWahaSession,
  getWahaQrCode,
  getWahaSession,
  isWahaConfigured,
  sendWahaText,
} from "../lib/waha.js";
import { getSessionUser, isStaffRole, requireBusiness, requireOwnerAccess, requireSession } from "../lib/session.js";
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

const updateWhatsappSchema = z.object({
  mode: z.enum(["basic", "automation"]),
});

const sendWhatsappSchema = z.object({
  phone: z.string().min(6),
  message: z.string().min(1),
});

function serializeWhatsappState(business: typeof businesses.$inferSelect, extras?: { qrCodeDataUrl?: string | null }) {
  const mode = business.whatsappMode === "automation" ? "automation" : "basic";
  const automationStatus =
    business.whatsappAutomationStatus === "connected" ||
    business.whatsappAutomationStatus === "connecting" ||
    business.whatsappAutomationStatus === "pairing" ||
    business.whatsappAutomationStatus === "error"
      ? business.whatsappAutomationStatus
      : "not_connected";

  const automationStatusLabelMap = {
    not_connected: "Belum terhubung",
    connecting: "Sedang menghubungkan",
    pairing: "Menunggu scan QR",
    connected: "Terhubung",
    error: "Perlu dicek",
  } as const;

  return {
    mode,
    modeLabel: mode === "automation" ? "Otomasi WAHA" : "WhatsApp Dasar",
    automationStatus,
    automationStatusLabel: automationStatusLabelMap[automationStatus],
    connectedAt: business.whatsappAutomationConnectedAt,
    lastError: business.whatsappAutomationLastError ?? null,
    canUseAutomation: mode === "automation" && automationStatus === "connected",
    channelSummary:
      mode === "automation"
        ? automationStatus === "connected"
          ? "Nomor bisnis sudah tersambung ke WAHA dan siap dipakai."
          : "Otomasi WAHA aktif, tetapi nomor bisnis belum sepenuhnya tersambung."
        : "Mode WhatsApp dasar aktif. Pengiriman tetap manual lewat tombol chat.",
    businessPhone: business.phone ?? null,
    dockerRuntime: "WAHA Docker",
    recommendedFlow: [
      "Pilih mode Otomasi WAHA",
      "Hubungkan session WAHA",
      "Scan QR lalu tes koneksi",
    ],
    qrCodeDataUrl: extras?.qrCodeDataUrl ?? null,
  };
}

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
        ...serializeSubscriptionState(existing),
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
      ...serializeSubscriptionState(createdBusiness),
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
      ...serializeSubscriptionState(business),
      whatsapp: serializeWhatsappState(business),
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
  requireOwnerAccess(res);
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
      ...serializeSubscriptionState(updated),
      whatsapp: serializeWhatsappState(updated),
      availablePlans: getPlanCatalog(),
    },
  });
});

businessRouter.get("/whatsapp", async (_req, res) => {
  const businessId = requireBusiness(res);
  requireOwnerAccess(res);
  const [business] = await db.select().from(businesses).where(eq(businesses.id, businessId));
  if (!business) {
    throw notFound("Bisnis tidak ditemukan.");
  }

  let nextStatus = business.whatsappAutomationStatus;
  let lastError = business.whatsappAutomationLastError;

  if (isWahaConfigured() && business.whatsappMode === "automation") {
    try {
      const session = await getWahaSession(businessId);
      nextStatus = session?.status === "WORKING" ? "connected" : session ? "pairing" : "not_connected";
      lastError = null;
      if (nextStatus !== business.whatsappAutomationStatus || lastError !== business.whatsappAutomationLastError) {
        const [updated] = await db
          .update(businesses)
          .set({
            whatsappAutomationStatus: nextStatus,
            whatsappAutomationLastError: lastError,
            whatsappAutomationConnectedAt:
              nextStatus === "connected"
                ? business.whatsappAutomationConnectedAt ?? new Date()
                : business.whatsappAutomationConnectedAt,
            updatedAt: new Date(),
          })
          .where(eq(businesses.id, businessId))
          .returning();
        res.json({ data: serializeWhatsappState(updated) });
        return;
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Gagal mengambil status WAHA.";
      const [updated] = await db
        .update(businesses)
        .set({
          whatsappAutomationStatus: "error",
          whatsappAutomationLastError: message,
          updatedAt: new Date(),
        })
        .where(eq(businesses.id, businessId))
        .returning();
      res.json({ data: serializeWhatsappState(updated) });
      return;
    }
  }

  res.json({ data: serializeWhatsappState(business) });
});

businessRouter.patch("/whatsapp", async (req, res) => {
  const businessId = requireBusiness(res);
  requireOwnerAccess(res);
  const payload = updateWhatsappSchema.parse(req.body);
  const [business] = await db.select().from(businesses).where(eq(businesses.id, businessId));
  if (!business) {
    throw notFound("Bisnis tidak ditemukan.");
  }

  const [updated] = await db
    .update(businesses)
    .set({
      whatsappMode: payload.mode,
      whatsappAutomationStatus: payload.mode === "basic" ? "not_connected" : business.whatsappAutomationStatus,
      whatsappAutomationLastError: null,
      updatedAt: new Date(),
    })
    .where(eq(businesses.id, businessId))
    .returning();

  res.json({ data: serializeWhatsappState(updated) });
});

businessRouter.post("/whatsapp/connect", async (_req, res) => {
  const businessId = requireBusiness(res);
  requireOwnerAccess(res);
  const [business] = await db.select().from(businesses).where(eq(businesses.id, businessId));
  if (!business) {
    throw notFound("Bisnis tidak ditemukan.");
  }

  try {
    await createOrStartWahaSession(businessId);
    const [updated] = await db
      .update(businesses)
      .set({
        whatsappMode: "automation",
        whatsappAutomationStatus: "pairing",
        whatsappAutomationLastError: null,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, businessId))
      .returning();

    res.json({ data: serializeWhatsappState(updated) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal menghubungkan WAHA.";
    const [updated] = await db
      .update(businesses)
      .set({
        whatsappAutomationStatus: "error",
        whatsappAutomationLastError: message,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, businessId))
      .returning();

    res.json({ data: serializeWhatsappState(updated) });
  }
});

businessRouter.get("/whatsapp/qr", async (_req, res) => {
  const businessId = requireBusiness(res);
  requireOwnerAccess(res);
  const [business] = await db.select().from(businesses).where(eq(businesses.id, businessId));
  if (!business) {
    throw notFound("Bisnis tidak ditemukan.");
  }

  try {
    const qr = await getWahaQrCode(businessId);
    const [updated] = await db
      .update(businesses)
      .set({
        whatsappAutomationStatus: "pairing",
        whatsappAutomationLastError: null,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, businessId))
      .returning();

    res.json({ data: serializeWhatsappState(updated, { qrCodeDataUrl: qr.value }) });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal mengambil QR WAHA.";
    const [updated] = await db
      .update(businesses)
      .set({
        whatsappAutomationStatus: "error",
        whatsappAutomationLastError: message,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, businessId))
      .returning();

    res.json({ data: serializeWhatsappState(updated) });
  }
});

businessRouter.post("/whatsapp/disconnect", async (_req, res) => {
  const businessId = requireBusiness(res);
  requireOwnerAccess(res);
  const [business] = await db.select().from(businesses).where(eq(businesses.id, businessId));
  if (!business) {
    throw notFound("Bisnis tidak ditemukan.");
  }

  try {
    await disconnectWahaSession(businessId);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Gagal memutuskan WAHA.";
    const [updated] = await db
      .update(businesses)
      .set({
        whatsappAutomationStatus: "error",
        whatsappAutomationLastError: message,
        updatedAt: new Date(),
      })
      .where(eq(businesses.id, businessId))
      .returning();
    res.json({ data: serializeWhatsappState(updated) });
    return;
  }

  const [updated] = await db
    .update(businesses)
    .set({
      whatsappAutomationStatus: "not_connected",
      whatsappAutomationConnectedAt: null,
      whatsappAutomationLastError: null,
      updatedAt: new Date(),
    })
    .where(eq(businesses.id, businessId))
    .returning();

  res.json({ data: serializeWhatsappState(updated) });
});

businessRouter.post("/whatsapp/send-text", async (req, res) => {
  const businessId = requireBusiness(res);
  requireOwnerAccess(res);
  const payload = sendWhatsappSchema.parse(req.body);
  const [business] = await db.select().from(businesses).where(eq(businesses.id, businessId));
  if (!business) {
    throw notFound("Bisnis tidak ditemukan.");
  }

  if (business.whatsappMode !== "automation") {
    throw badRequest("Aktifkan mode otomasi WAHA dulu dari pengaturan bisnis.");
  }

  await sendWahaText(businessId, payload.phone, payload.message);

  res.json({
    data: {
      ok: true,
      message: "Pesan WAHA berhasil dikirim.",
    },
  });
});

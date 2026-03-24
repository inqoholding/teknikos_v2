import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { adminInboxRequests, businesses } from "../db/app-schema.js";
import { requireBusiness, requireOwnerAccess, requireSession } from "../lib/session.js";
import { eq } from "drizzle-orm";

const publicSupportRequestSchema = z.object({
  type: z.enum(["password_help"]),
  requesterEmail: z.string().email(),
  requesterName: z.string().trim().max(120).optional(),
  requesterPhone: z.string().trim().max(40).optional(),
  message: z.string().trim().max(500).optional(),
});

const businessSupportRequestSchema = z.object({
  type: z.enum(["subscription_upgrade", "subscription_renewal"]),
  targetPlan: z.enum(["Starter", "Pro", "Bisnis"]).optional(),
  message: z.string().trim().max(500).optional(),
});

export const supportRouter = Router();

supportRouter.post("/public", async (req, res) => {
  const payload = publicSupportRequestSchema.parse(req.body);
  const now = new Date();

  const [created] = await db
    .insert(adminInboxRequests)
    .values({
      id: crypto.randomUUID(),
      type: payload.type,
      status: "open",
      source: "public",
      requesterName: payload.requesterName || null,
      requesterEmail: payload.requesterEmail,
      requesterPhone: payload.requesterPhone || null,
      message: payload.message || "User meminta bantuan reset password dari halaman login.",
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  res.status(201).json({ data: created });
});

supportRouter.use(requireSession);

supportRouter.post("/business", async (req, res) => {
  const businessId = requireBusiness(res);
  requireOwnerAccess(res);
  const payload = businessSupportRequestSchema.parse(req.body);
  const [business] = await db.select().from(businesses).where(eq(businesses.id, businessId));
  const now = new Date();

  const [created] = await db
    .insert(adminInboxRequests)
    .values({
      id: crypto.randomUUID(),
      businessId,
      type: payload.type,
      status: "open",
      source: "owner",
      businessName: business?.name ?? null,
      requesterName: res.locals.session?.user.name ?? null,
      requesterEmail: res.locals.session?.user.email ?? null,
      requesterPhone: res.locals.session?.user.phone ?? null,
      currentPlan: business?.plan ?? null,
      targetPlan: payload.targetPlan ?? null,
      message: payload.message || null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();

  res.status(201).json({ data: created });
});

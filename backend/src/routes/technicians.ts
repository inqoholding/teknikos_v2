import { Router } from "express";
import { and, desc, eq, like, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "../db/index.js";
import { jobs, technicians } from "../db/app-schema.js";
import { notFound } from "../lib/errors.js";
import { assertSubscriptionWritable, assertTechnicianLimit } from "../lib/plans.js";
import { getCurrentBusiness, requireBusiness, requireSession } from "../lib/session.js";

const technicianSchema = z.object({
  name: z.string().min(2),
  phone: z.string().min(6),
  specialties: z.array(z.string()).min(1),
  status: z.enum(["Aktif", "Bertugas", "Standby", "Tidak Aktif"]).default("Aktif"),
  rating: z.number().min(0).max(5).default(0),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  lastSeenAt: z.coerce.date().optional().nullable(),
});

export const techniciansRouter = Router();

techniciansRouter.use(requireSession);

techniciansRouter.get("/", async (req, res) => {
  const businessId = requireBusiness(res);
  const q = typeof req.query.q === "string" ? req.query.q : "";
  const filters = [eq(technicians.businessId, businessId)];

  if (q) {
    filters.push(like(technicians.name, `%${q}%`));
  }

  const rows = await db
    .select({
      technician: technicians,
      jobsCompleted: sql<number>`count(case when ${jobs.status} in ('done', 'paid') then 1 end)`,
    })
    .from(technicians)
    .leftJoin(jobs, eq(jobs.technicianId, technicians.id))
    .where(and(...filters))
    .groupBy(technicians.id)
    .orderBy(desc(technicians.createdAt));

  res.json({
    data: rows.map(({ technician, jobsCompleted }) => ({
      id: technician.id,
      name: technician.name,
      phone: technician.phone,
      specialties: technician.specialties,
      status: technician.status,
      rating: technician.rating,
      jobsCompleted,
      latitude: technician.latitude,
      longitude: technician.longitude,
      lastSeenAt: technician.lastSeenAt,
    })),
  });
});

techniciansRouter.post("/", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const payload = technicianSchema.parse(req.body);
  assertSubscriptionWritable(business.subscriptionStatus);
  await assertTechnicianLimit(businessId, business.plan);
  const [created] = await db
    .insert(technicians)
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

techniciansRouter.patch("/:id", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const payload = technicianSchema.partial().parse(req.body);
  assertSubscriptionWritable(business.subscriptionStatus);
  const [updated] = await db
    .update(technicians)
    .set({
      ...payload,
      updatedAt: new Date(),
    })
    .where(and(eq(technicians.id, req.params.id), eq(technicians.businessId, businessId)))
    .returning();

  if (!updated) {
    throw notFound("Teknisi tidak ditemukan.");
  }

  res.json({ data: updated });
});

techniciansRouter.delete("/:id", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  assertSubscriptionWritable(business.subscriptionStatus);
  const [deleted] = await db
    .delete(technicians)
    .where(and(eq(technicians.id, req.params.id), eq(technicians.businessId, businessId)))
    .returning();

  if (!deleted) {
    throw notFound("Teknisi tidak ditemukan.");
  }

  res.json({ data: { success: true } });
});

import { Router } from "express";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { technicians } from "../db/app-schema.js";
import { db } from "../db/index.js";
import { forbidden } from "../lib/errors.js";
import { getSessionUser, isTechnicianRole, requireCurrentTechnician, requireSession } from "../lib/session.js";

const locationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

function serializeTechnicianSelf(technician: typeof technicians.$inferSelect) {
  return {
    id: technician.id,
    userId: technician.userId ?? null,
    name: technician.name,
    phone: technician.phone,
    specialties: technician.specialties,
    status: technician.status,
    attendanceStatus: technician.attendanceStatus,
    rating: technician.rating,
    latitude: technician.latitude ?? null,
    longitude: technician.longitude ?? null,
    lastSeenAt: technician.lastSeenAt ?? null,
    attendanceLatitude: technician.attendanceLatitude ?? null,
    attendanceLongitude: technician.attendanceLongitude ?? null,
    attendanceUpdatedAt: technician.attendanceUpdatedAt ?? null,
  };
}

export const technicianSelfRouter = Router();

technicianSelfRouter.use(requireSession);
technicianSelfRouter.use((_req, res, next) => {
  try {
    const currentUser = getSessionUser(res);
    if (!isTechnicianRole(currentUser.role)) {
      throw forbidden("Endpoint ini hanya untuk akun teknisi.");
    }
    next();
  } catch (error) {
    next(error);
  }
});

technicianSelfRouter.get("/me", async (_req, res) => {
  const technician = await requireCurrentTechnician(res);
  res.json({ data: serializeTechnicianSelf(technician) });
});

technicianSelfRouter.post("/check-in", async (req, res) => {
  const technician = await requireCurrentTechnician(res);
  const payload = locationSchema.parse(req.body);
  const [updated] = await db
    .update(technicians)
    .set({
      status: technician.status === "Bertugas" ? "Bertugas" : "Aktif",
      attendanceStatus: "Sudah Check-in",
      latitude: payload.latitude,
      longitude: payload.longitude,
      attendanceLatitude: payload.latitude,
      attendanceLongitude: payload.longitude,
      lastSeenAt: new Date(),
      attendanceUpdatedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(technicians.id, technician.id))
    .returning();

  res.json({ data: serializeTechnicianSelf(updated) });
});

technicianSelfRouter.post("/check-out", async (req, res) => {
  const technician = await requireCurrentTechnician(res);
  const payload = locationSchema.partial().parse(req.body);
  const [updated] = await db
    .update(technicians)
    .set({
      status: "Tidak Aktif",
      attendanceStatus: "Sudah Check-out",
      latitude: payload.latitude ?? technician.latitude,
      longitude: payload.longitude ?? technician.longitude,
      attendanceLatitude: payload.latitude ?? technician.attendanceLatitude ?? technician.latitude,
      attendanceLongitude: payload.longitude ?? technician.attendanceLongitude ?? technician.longitude,
      lastSeenAt: new Date(),
      attendanceUpdatedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(technicians.id, technician.id))
    .returning();

  res.json({ data: serializeTechnicianSelf(updated) });
});

technicianSelfRouter.patch("/location", async (req, res) => {
  const technician = await requireCurrentTechnician(res);
  const payload = locationSchema.parse(req.body);
  const [updated] = await db
    .update(technicians)
    .set({
      latitude: payload.latitude,
      longitude: payload.longitude,
      attendanceLatitude: payload.latitude,
      attendanceLongitude: payload.longitude,
      lastSeenAt: new Date(),
      attendanceUpdatedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(technicians.id, technician.id))
    .returning();

  res.json({ data: serializeTechnicianSelf(updated) });
});

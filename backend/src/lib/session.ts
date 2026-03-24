import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { and, eq } from "drizzle-orm";
import { businesses, technicians } from "../db/app-schema.js";
import { db } from "../db/index.js";
import { auth } from "./auth.js";
import { forbidden, notFound } from "./errors.js";

export async function requireSession(req: Request, res: Response, next: NextFunction) {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      res.status(401).json({
        error: "UNAUTHORIZED",
        message: "Anda harus login terlebih dahulu.",
      });
      return;
    }

    res.locals.session = session;
    next();
  } catch (error) {
    next(error);
  }
}

export function getSessionUser(res: Response) {
  return (res.locals.session as {
    user: {
      id: string;
      name: string;
      email: string;
      businessId?: string | null;
      role?: string | null;
      phone?: string | null;
    };
  }).user;
}

function normalizePhone(value?: string | null) {
  return (value ?? "").replace(/\D/g, "");
}

export function isStaffRole(role?: string | null) {
  return role === "admin" || role === "moderator";
}

export function isTechnicianRole(role?: string | null) {
  return role === "technician";
}

export function requireStaffRole(res: Response) {
  const currentUser = getSessionUser(res);
  if (!isStaffRole(currentUser.role)) {
    throw forbidden("Akses ini hanya untuk admin atau moderator.");
  }

  return currentUser.role!;
}

export function requireAdminRole(res: Response) {
  const currentUser = getSessionUser(res);
  if (currentUser.role !== "admin") {
    throw forbidden("Akses ini hanya untuk admin.");
  }

  return currentUser;
}

export function requireOwnerAccess(res: Response) {
  const currentUser = getSessionUser(res);
  if (isTechnicianRole(currentUser.role)) {
    throw forbidden("Akses ini hanya untuk owner bisnis.");
  }

  return currentUser;
}

export function requireBusiness(res: Response) {
  const currentUser = getSessionUser(res);
  if (!currentUser.businessId) {
    throw forbidden("Bisnis belum disetup.");
  }
  return currentUser.businessId;
}

export async function getCurrentBusiness(res: Response) {
  const cached = res.locals.currentBusiness as typeof businesses.$inferSelect | undefined;
  if (cached) {
    return cached;
  }

  const businessId = requireBusiness(res);
  const [business] = await db.select().from(businesses).where(eq(businesses.id, businessId));
  if (!business) {
    throw notFound("Bisnis tidak ditemukan.");
  }

  res.locals.currentBusiness = business;
  return business;
}

export async function getCurrentTechnician(res: Response) {
  const cached = res.locals.currentTechnician as typeof technicians.$inferSelect | null | undefined;
  if (cached !== undefined) {
    return cached;
  }

  const currentUser = getSessionUser(res);
  const businessId = requireBusiness(res);
  const phone = normalizePhone(currentUser.phone);

  let technician =
    currentUser.id
      ? (
          await db
            .select()
            .from(technicians)
            .where(and(eq(technicians.businessId, businessId), eq(technicians.userId, currentUser.id)))
        )[0]
      : undefined;

  if (!technician && phone) {
    technician = (
      await db
        .select()
        .from(technicians)
        .where(and(eq(technicians.businessId, businessId), eq(technicians.phone, currentUser.phone ?? "")))
    )[0];

    if (!technician) {
      technician = (
        await db.select().from(technicians).where(eq(technicians.businessId, businessId))
      ).find((item) => normalizePhone(item.phone) === phone);
    }

    if (technician && !technician.userId) {
      const [linked] = await db
        .update(technicians)
        .set({
          userId: currentUser.id,
          updatedAt: new Date(),
        })
        .where(eq(technicians.id, technician.id))
        .returning();

      technician = linked ?? technician;
    }
  }

  res.locals.currentTechnician = technician ?? null;
  return technician ?? null;
}

export async function requireCurrentTechnician(res: Response) {
  const technician = await getCurrentTechnician(res);
  if (!technician) {
    throw notFound("Record teknisi untuk akun ini belum terhubung.");
  }

  return technician;
}

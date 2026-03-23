import type { NextFunction, Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { eq } from "drizzle-orm";
import { businesses } from "../db/app-schema.js";
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

export function isStaffRole(role?: string | null) {
  return role === "admin" || role === "moderator";
}

export function requireStaffRole(res: Response) {
  const currentUser = getSessionUser(res);
  if (!isStaffRole(currentUser.role)) {
    throw forbidden("Akses ini hanya untuk admin atau moderator.");
  }

  return currentUser.role!;
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

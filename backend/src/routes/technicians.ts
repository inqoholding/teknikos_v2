import { Router } from "express";
import { and, desc, eq, like, sql } from "drizzle-orm";
import { z } from "zod";
import { hashPassword } from "better-auth/crypto";
import { account, session, user } from "../db/auth-schema.js";
import { db } from "../db/index.js";
import { jobs, technicians } from "../db/app-schema.js";
import { auth } from "../lib/auth.js";
import { conflict, notFound } from "../lib/errors.js";
import { assertSubscriptionWritable, assertTechnicianLimit } from "../lib/plans.js";
import { getCurrentBusiness, requireBusiness, requireOwnerAccess, requireSession } from "../lib/session.js";
import { emailField, entityIdSchema, optionalTextField, phoneField, shortSearchField, stringArrayField, textField } from "../lib/validation.js";

const technicianSchema = z.object({
  name: textField("Nama teknisi", 2, 120),
  phone: phoneField,
  specialties: stringArrayField("Spesialisasi", 60, 20, 1),
  status: z.enum(["Aktif", "Bertugas", "Standby", "Tidak Aktif"]).default("Aktif"),
  rating: z.number().min(0).max(5).default(0),
  latitude: z.number().optional().nullable(),
  longitude: z.number().optional().nullable(),
  lastSeenAt: z.coerce.date().optional().nullable(),
}).strict();

const provisionTechnicianAccountSchema = z.object({
  email: emailField,
  password: z.string().min(8).optional(),
}).strict();

const updateTechnicianAccountSchema = z.object({
  email: emailField.optional(),
  newPassword: z.string().min(8).optional(),
}).strict();

const resetTechnicianPasswordSchema = z.object({
  newPassword: z.string().min(8).optional(),
}).strict();

const technicianParamsSchema = z.object({
  id: entityIdSchema,
}).strict();

const technicianQuerySchema = z.object({
  q: shortSearchField,
}).strict();

function generateTemporaryPassword() {
  const seed = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `TeknikOS!${seed}`;
}

function serializeTechnician(technician: typeof technicians.$inferSelect, jobsCompleted: number) {
  return {
    id: technician.id,
    userId: technician.userId,
    name: technician.name,
    phone: technician.phone,
    specialties: technician.specialties,
    status: technician.status,
    rating: technician.rating,
    jobsCompleted,
    latitude: technician.latitude,
    longitude: technician.longitude,
    lastSeenAt: technician.lastSeenAt,
    accountEmail: technician.accountEmail,
    accountStatus: technician.accountStatus,
    attendanceStatus: technician.attendanceStatus,
    attendancePhotoUrl: technician.attendancePhotoUrl,
    attendanceNote: technician.attendanceNote,
    attendanceLocationLabel: technician.attendanceLocationLabel,
    attendanceLatitude: technician.attendanceLatitude,
    attendanceLongitude: technician.attendanceLongitude,
    attendanceUpdatedAt: technician.attendanceUpdatedAt,
  };
}

export const techniciansRouter = Router();

techniciansRouter.use(requireSession);
techniciansRouter.use((_req, res, next) => {
  try {
    requireOwnerAccess(res);
    next();
  } catch (error) {
    next(error);
  }
});

techniciansRouter.get("/", async (req, res) => {
  const businessId = requireBusiness(res);
  const { q } = technicianQuerySchema.parse(req.query);
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
    data: rows.map(({ technician, jobsCompleted }) => serializeTechnician(technician, jobsCompleted)),
  });
});

techniciansRouter.post("/", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const payload = technicianSchema.parse(req.body);
  assertSubscriptionWritable(business.subscriptionStatus, business.currentPeriodEndsAt);
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
  const { id } = technicianParamsSchema.parse(req.params);
  const payload = technicianSchema.partial().parse(req.body);
  assertSubscriptionWritable(business.subscriptionStatus, business.currentPeriodEndsAt);
  const [updated] = await db
    .update(technicians)
    .set({
      ...payload,
      updatedAt: new Date(),
    })
    .where(and(eq(technicians.id, id), eq(technicians.businessId, businessId)))
    .returning();

  if (!updated) {
    throw notFound("Teknisi tidak ditemukan.");
  }

  if (updated.userId) {
    await db
      .update(user)
      .set({
        name: updated.name,
        phone: updated.phone,
        updatedAt: new Date(),
      })
      .where(eq(user.id, updated.userId));
  }

  res.json({ data: updated });
});

techniciansRouter.post("/:id/account", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const { id } = technicianParamsSchema.parse(req.params);
  const payload = provisionTechnicianAccountSchema.parse(req.body);
  assertSubscriptionWritable(business.subscriptionStatus, business.currentPeriodEndsAt);

  const [technician] = await db
    .select()
    .from(technicians)
    .where(and(eq(technicians.id, id), eq(technicians.businessId, businessId)));

  if (!technician) {
    throw notFound("Teknisi tidak ditemukan.");
  }

  const normalizedEmail = payload.email.trim().toLowerCase();
  const [emailUser] = await db.select().from(user).where(eq(user.email, normalizedEmail));

  if (technician.userId && (!emailUser || emailUser.id !== technician.userId)) {
    throw conflict("Teknisi ini sudah terhubung ke akun lain. Gunakan reset password untuk memberi akses ulang.");
  }

  let technicianUserId = technician.userId;
  let temporaryPassword: string | null = null;

  if (emailUser) {
    if (emailUser.businessId && emailUser.businessId !== businessId) {
      throw conflict("Email ini sudah dipakai oleh akun bisnis lain.");
    }

    if (emailUser.role && emailUser.role !== "technician") {
      throw conflict("Email ini sudah dipakai oleh akun non-teknisi.");
    }

    const [linkedTechnician] = await db
      .select()
      .from(technicians)
      .where(and(eq(technicians.businessId, businessId), eq(technicians.userId, emailUser.id)));

    if (linkedTechnician && linkedTechnician.id !== technician.id) {
      throw conflict("Email ini sudah terhubung ke teknisi lain.");
    }

    const [credentialAccount] = await db
      .select()
      .from(account)
      .where(eq(account.userId, emailUser.id));

    if (!credentialAccount) {
      throw conflict("Email ini ada di sistem, tetapi belum memiliki login email/password yang bisa dipakai.");
    }

    technicianUserId = emailUser.id;

    await db
      .update(user)
      .set({
        name: technician.name,
        role: "technician",
        businessId,
        phone: technician.phone,
        updatedAt: new Date(),
      })
      .where(eq(user.id, emailUser.id));
  } else {
    temporaryPassword = payload.password || generateTemporaryPassword();
    const signUpResult = await auth.api.signUpEmail({
      body: {
        name: technician.name,
        email: normalizedEmail,
        password: temporaryPassword,
      },
      headers: new Headers(),
    });

    technicianUserId = signUpResult.user.id;

    await db
      .update(user)
      .set({
        name: technician.name,
        role: "technician",
        businessId,
        phone: technician.phone,
        updatedAt: new Date(),
      })
      .where(eq(user.id, technicianUserId));
  }

  await db
    .update(technicians)
    .set({
      userId: technicianUserId,
      accountEmail: normalizedEmail,
      accountStatus: "active",
      updatedAt: new Date(),
    })
    .where(eq(technicians.id, technician.id));

  res.json({
    data: {
      technicianId: technician.id,
      technicianName: technician.name,
      accountEmail: normalizedEmail,
      temporaryPassword,
      message: temporaryPassword
        ? "Akun login teknisi berhasil dibuat."
        : "Akun teknisi berhasil ditautkan ke login yang sudah ada.",
    },
  });
});

techniciansRouter.post("/:id/account/reset-password", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const { id } = technicianParamsSchema.parse(req.params);
  const payload = resetTechnicianPasswordSchema.parse(req.body);
  assertSubscriptionWritable(business.subscriptionStatus, business.currentPeriodEndsAt);

  const [technician] = await db
    .select()
    .from(technicians)
    .where(and(eq(technicians.id, id), eq(technicians.businessId, businessId)));

  if (!technician) {
    throw notFound("Teknisi tidak ditemukan.");
  }

  if (!technician.userId) {
    throw conflict("Teknisi ini belum memiliki akun login.");
  }

  const [credentialAccount] = await db
    .select()
    .from(account)
    .where(eq(account.userId, technician.userId));

  if (!credentialAccount) {
    throw conflict("Akun teknisi belum memiliki login email/password yang bisa direset.");
  }

  const temporaryPassword = payload.newPassword || generateTemporaryPassword();
  const hashedPassword = await hashPassword(temporaryPassword);

  await db
    .update(account)
    .set({
      password: hashedPassword,
      updatedAt: new Date(),
    })
    .where(eq(account.id, credentialAccount.id));

  await db.delete(session).where(eq(session.userId, technician.userId));
  await db
    .update(technicians)
    .set({
      accountStatus: "active",
      updatedAt: new Date(),
    })
    .where(eq(technicians.id, technician.id));

  res.json({
    data: {
      technicianId: technician.id,
      technicianName: technician.name,
      accountEmail: technician.accountEmail,
      temporaryPassword,
      message: "Password akun teknisi berhasil direset.",
    },
  });
});

techniciansRouter.patch("/:id/account", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const { id } = technicianParamsSchema.parse(req.params);
  const payload = updateTechnicianAccountSchema.parse(req.body);
  assertSubscriptionWritable(business.subscriptionStatus, business.currentPeriodEndsAt);

  const [technician] = await db
    .select()
    .from(technicians)
    .where(and(eq(technicians.id, id), eq(technicians.businessId, businessId)));

  if (!technician) {
    throw notFound("Teknisi tidak ditemukan.");
  }

  if (!technician.userId) {
    throw conflict("Teknisi ini belum memiliki akun login. Buat akun login terlebih dahulu.");
  }

  const [technicianUser] = await db.select().from(user).where(eq(user.id, technician.userId));
  if (!technicianUser) {
    throw notFound("User akun teknisi tidak ditemukan.");
  }

  const nextEmail = payload.email?.trim().toLowerCase();
  if (nextEmail && nextEmail !== technicianUser.email) {
    const [emailOwner] = await db.select().from(user).where(eq(user.email, nextEmail));
    if (emailOwner && emailOwner.id !== technician.userId) {
      throw conflict("Email ini sudah dipakai akun lain.");
    }
  }

  if (payload.newPassword) {
    const [credentialAccount] = await db
      .select()
      .from(account)
      .where(eq(account.userId, technician.userId));

    if (!credentialAccount) {
      throw conflict("Akun teknisi belum memiliki login email/password yang bisa diubah.");
    }

    const hashedPassword = await hashPassword(payload.newPassword);
    await db
      .update(account)
      .set({
        password: hashedPassword,
        updatedAt: new Date(),
      })
      .where(eq(account.id, credentialAccount.id));

    await db.delete(session).where(eq(session.userId, technician.userId));
  }

  const resolvedEmail = nextEmail ?? technicianUser.email;

  await db
    .update(user)
    .set({
      email: resolvedEmail,
      name: technician.name,
      phone: technician.phone,
      role: "technician",
      businessId,
      updatedAt: new Date(),
    })
    .where(eq(user.id, technician.userId));

  await db
    .update(technicians)
    .set({
      accountEmail: resolvedEmail,
      accountStatus: "active",
      updatedAt: new Date(),
    })
    .where(eq(technicians.id, technician.id));

  res.json({
    data: {
      technicianId: technician.id,
      technicianName: technician.name,
      accountEmail: resolvedEmail,
      temporaryPassword: payload.newPassword ?? null,
      message:
        payload.newPassword && nextEmail
          ? "Email dan password akun teknisi berhasil diperbarui."
          : payload.newPassword
            ? "Password akun teknisi berhasil diperbarui."
            : "Email akun teknisi berhasil diperbarui.",
    },
  });
});

techniciansRouter.post("/:id/account/force-logout", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const { id } = technicianParamsSchema.parse(req.params);
  assertSubscriptionWritable(business.subscriptionStatus, business.currentPeriodEndsAt);

  const [technician] = await db
    .select()
    .from(technicians)
    .where(and(eq(technicians.id, id), eq(technicians.businessId, businessId)));

  if (!technician) {
    throw notFound("Teknisi tidak ditemukan.");
  }

  if (!technician.userId) {
    throw conflict("Teknisi ini belum memiliki akun login.");
  }

  await db.delete(session).where(eq(session.userId, technician.userId));

  res.json({
    data: {
      technicianId: technician.id,
      technicianName: technician.name,
      accountEmail: technician.accountEmail,
      temporaryPassword: null,
      message: "Semua sesi login teknisi berhasil diputus.",
    },
  });
});

techniciansRouter.post("/:id/account/disable", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const { id } = technicianParamsSchema.parse(req.params);
  assertSubscriptionWritable(business.subscriptionStatus, business.currentPeriodEndsAt);

  const [technician] = await db
    .select()
    .from(technicians)
    .where(and(eq(technicians.id, id), eq(technicians.businessId, businessId)));

  if (!technician) {
    throw notFound("Teknisi tidak ditemukan.");
  }

  if (!technician.userId) {
    throw conflict("Teknisi ini belum memiliki akun login.");
  }

  const [credentialAccount] = await db
    .select()
    .from(account)
    .where(eq(account.userId, technician.userId));

  if (!credentialAccount) {
    throw conflict("Akun teknisi belum memiliki login email/password yang bisa dinonaktifkan.");
  }

  const disabledPasswordHash = await hashPassword(generateTemporaryPassword());

  await db
    .update(account)
    .set({
      password: disabledPasswordHash,
      updatedAt: new Date(),
    })
    .where(eq(account.id, credentialAccount.id));

  await db.delete(session).where(eq(session.userId, technician.userId));
  await db
    .update(technicians)
    .set({
      accountStatus: "disabled",
      updatedAt: new Date(),
    })
    .where(eq(technicians.id, technician.id));

  res.json({
    data: {
      technicianId: technician.id,
      technicianName: technician.name,
      accountEmail: technician.accountEmail,
      temporaryPassword: null,
      message: "Akun teknisi berhasil dinonaktifkan dan semua sesi login diputus.",
    },
  });
});

techniciansRouter.delete("/:id", async (req, res) => {
  const businessId = requireBusiness(res);
  const business = await getCurrentBusiness(res);
  const { id } = technicianParamsSchema.parse(req.params);
  assertSubscriptionWritable(business.subscriptionStatus, business.currentPeriodEndsAt);
  const [deleted] = await db
    .delete(technicians)
    .where(and(eq(technicians.id, id), eq(technicians.businessId, businessId)))
    .returning();

  if (!deleted) {
    throw notFound("Teknisi tidak ditemukan.");
  }

  res.json({ data: { success: true } });
});

import { eq } from "drizzle-orm";
import { auth } from "./lib/auth.js";
import { env } from "./lib/env.js";
import { db } from "./db/index.js";
import {
  businesses,
  contracts,
  customers,
  inventory,
  invoices,
  jobItems,
  jobs,
  technicians,
} from "./db/app-schema.js";
import { user } from "./db/auth-schema.js";

async function ensureStaffUser(input: {
  email: string;
  password: string;
  name: string;
  role: "admin" | "moderator";
}) {
  const existing = await db.select().from(user).where(eq(user.email, input.email));
  let userId = existing[0]?.id;

  if (!userId) {
    const signUpResult = await auth.api.signUpEmail({
      body: {
        name: input.name,
        email: input.email,
        password: input.password,
      },
      headers: new Headers(),
    });

    userId = signUpResult.user.id;
  }

  await db
    .update(user)
    .set({
      role: input.role,
      businessId: null,
      updatedAt: new Date(),
    })
    .where(eq(user.id, userId));
}

async function main() {
  await ensureStaffUser({
    email: env.ADMIN_EMAIL,
    password: env.ADMIN_PASSWORD,
    name: "TeknikOS Admin",
    role: "admin",
  });

  await ensureStaffUser({
    email: env.MODERATOR_EMAIL,
    password: env.MODERATOR_PASSWORD,
    name: "TeknikOS Moderator",
    role: "moderator",
  });

  const existingUser = await db.select().from(user).where(eq(user.email, env.DEMO_OWNER_EMAIL));

  let ownerId = existingUser[0]?.id;

  if (!ownerId) {
    const signUpResult = await auth.api.signUpEmail({
      body: {
        name: "Budi Santoso",
        email: env.DEMO_OWNER_EMAIL,
        password: env.DEMO_OWNER_PASSWORD,
      },
      headers: new Headers(),
    });

    ownerId = signUpResult.user.id;
  }

  const [freshOwner] = await db.select().from(user).where(eq(user.id, ownerId));

  let businessId = freshOwner.businessId;

  if (!businessId) {
    businessId = crypto.randomUUID();
    await db.insert(businesses).values({
      id: businessId,
      ownerUserId: ownerId,
      name: "CV Teknik Makassar",
      slug: "cv-teknik-makassar",
      serviceType: "AC",
      phone: "0812 1234 5678",
      email: "halo@teknikmakassar.id",
      address: "Jl. Urip Sumoharjo No. 55",
      city: "Makassar",
      plan: "Pro",
      subscriptionStatus: "active",
      currentPeriodEndsAt: new Date("2026-04-19T00:00:00+08:00"),
      subscriptionNotes: "Seed business untuk demo owner dashboard.",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await db.update(user).set({ businessId, updatedAt: new Date() }).where(eq(user.id, ownerId));
  }

  const existingJobs = await db.select().from(jobs).where(eq(jobs.businessId, businessId));
  if (existingJobs.length > 0) {
    console.log("Seed skipped: demo data already exists.");
    console.log(`Admin login: ${env.ADMIN_EMAIL} / ${env.ADMIN_PASSWORD}`);
    console.log(`Moderator login: ${env.MODERATOR_EMAIL} / ${env.MODERATOR_PASSWORD}`);
    return;
  }

  const techIds = {
    ardi: crypto.randomUUID(),
    fadli: crypto.randomUUID(),
    rian: crypto.randomUUID(),
  };

  await db.insert(technicians).values([
    {
      id: techIds.ardi,
      businessId,
      name: "Ardiansyah",
      phone: "0812 4444 1212",
      specialties: ["AC Cassette", "VRV", "Freon"],
      status: "Aktif",
      rating: 4.8,
      latitude: -5.147665,
      longitude: 119.432732,
      lastSeenAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: techIds.fadli,
      businessId,
      name: "Fadli",
      phone: "0813 9988 1122",
      specialties: ["Split Wall", "Freon"],
      status: "Bertugas",
      rating: 4.7,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: techIds.rian,
      businessId,
      name: "Rian",
      phone: "0811 7331 882",
      specialties: ["Listrik", "Panel"],
      status: "Standby",
      rating: 4.9,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const customerIds = {
    sinar: crypto.randomUUID(),
    arafah: crypto.randomUUID(),
    lina: crypto.randomUUID(),
  };

  await db.insert(customers).values([
    {
      id: customerIds.sinar,
      businessId,
      name: "PT Sinar Jaya",
      phone: "0812 4455 8899",
      email: "admin@sinarjaya.co.id",
      address: "Jl. Urip Sumoharjo No. 55, Makassar",
      units: ["Cassette Daikin 2PK · 4 unit", "Split Wall Panasonic 1PK · 6 unit"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: customerIds.arafah,
      businessId,
      name: "Klinik Arafah",
      phone: "0813 9988 4455",
      email: "ops@klinikarafah.id",
      address: "Jl. Alauddin, Makassar",
      units: ["Split Wall Gree 1PK · 6 unit"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: customerIds.lina,
      businessId,
      name: "Ibu Lina",
      phone: "0812 7000 2121",
      email: "lina@example.com",
      address: "BTP Blok M, Makassar",
      units: ["Split Wall Panasonic 2PK · 1 unit"],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  const jobIds = {
    j14: crypto.randomUUID(),
    j13: crypto.randomUUID(),
    j12: crypto.randomUUID(),
    j11: crypto.randomUUID(),
  };

  await db.insert(jobs).values([
    {
      id: jobIds.j14,
      businessId,
      number: "JOB-014",
      title: "Cuci besar 4 unit cassette",
      customerId: customerIds.sinar,
      technicianId: techIds.ardi,
      type: "AC",
      scheduleAt: new Date("2026-03-19T09:30:00+08:00"),
      price: 450000,
      status: "on_the_way",
      priority: "Urgent",
      description:
        "Cuci besar 4 unit cassette, cek drain, dan dokumentasi before/after untuk area lobby gedung utama.",
      location: "Jl. Urip Sumoharjo No. 55, Makassar",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: jobIds.j13,
      businessId,
      number: "JOB-013",
      title: "Isi freon R32 2PK",
      customerId: customerIds.lina,
      technicianId: techIds.fadli,
      type: "AC",
      scheduleAt: new Date("2026-03-19T11:00:00+08:00"),
      price: 900000,
      status: "pending",
      priority: "Normal",
      description: "Isi freon dan cek tekanan untuk unit split wall lantai dua.",
      location: "BTP Blok M, Makassar",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: jobIds.j12,
      businessId,
      number: "JOB-012",
      title: "Preventive maintenance",
      customerId: customerIds.arafah,
      technicianId: techIds.rian,
      type: "Maintenance",
      scheduleAt: new Date("2026-03-19T13:00:00+08:00"),
      price: 1200000,
      status: "done",
      priority: "Normal",
      description: "Preventive maintenance untuk enam unit split wall klinik.",
      location: "Jl. Alauddin, Makassar",
      completedAt: new Date("2026-03-19T15:00:00+08:00"),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: jobIds.j11,
      businessId,
      number: "JOB-011",
      title: "Overhaul outdoor unit",
      customerId: customerIds.sinar,
      technicianId: techIds.ardi,
      type: "AC",
      scheduleAt: new Date("2026-03-20T10:00:00+08:00"),
      price: 2400000,
      status: "assigned",
      priority: "Urgent",
      description: "Overhaul outdoor unit rooftop dan cek compressor.",
      location: "Makassar",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  await db.insert(jobItems).values([
    {
      id: crypto.randomUUID(),
      jobId: jobIds.j14,
      kind: "service",
      name: "Cuci besar cassette",
      quantity: 4,
      unitPrice: 112500,
      totalPrice: 450000,
      note: "Include dokumentasi before/after",
    },
    {
      id: crypto.randomUUID(),
      jobId: jobIds.j12,
      kind: "service",
      name: "Preventive maintenance",
      quantity: 6,
      unitPrice: 200000,
      totalPrice: 1200000,
      note: null,
    },
  ]);

  await db.insert(invoices).values([
    {
      id: crypto.randomUUID(),
      businessId,
      customerId: customerIds.sinar,
      jobId: jobIds.j14,
      number: "INV-2026-014",
      total: 450000,
      status: "Sent",
      dueDate: new Date("2026-03-22T00:00:00+08:00"),
      paidAmount: 0,
      createdAt: new Date("2026-03-19T08:00:00+08:00"),
      updatedAt: new Date("2026-03-19T08:00:00+08:00"),
    },
    {
      id: crypto.randomUUID(),
      businessId,
      customerId: customerIds.lina,
      jobId: jobIds.j13,
      number: "INV-2026-013",
      total: 900000,
      status: "Paid",
      dueDate: new Date("2026-03-19T00:00:00+08:00"),
      paidAmount: 900000,
      paymentMethod: "Transfer",
      paidAt: new Date("2026-03-19T12:00:00+08:00"),
      createdAt: new Date("2026-03-19T09:00:00+08:00"),
      updatedAt: new Date("2026-03-19T12:00:00+08:00"),
    },
    {
      id: crypto.randomUUID(),
      businessId,
      customerId: customerIds.sinar,
      jobId: jobIds.j11,
      number: "INV-2026-011",
      total: 2400000,
      status: "Sent",
      dueDate: new Date("2026-03-15T00:00:00+08:00"),
      paidAmount: 0,
      createdAt: new Date("2026-03-10T09:00:00+08:00"),
      updatedAt: new Date("2026-03-10T09:00:00+08:00"),
    },
  ]);

  await db.insert(inventory).values([
    {
      id: crypto.randomUUID(),
      businessId,
      name: "Freon R32 3kg",
      sku: "FR-R32-3",
      category: "Freon",
      stock: 2,
      minStock: 4,
      buyPrice: 340000,
      sellPrice: 450000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      businessId,
      name: "Kapasitor 35uF",
      sku: "KP-35UF",
      category: "Sparepart",
      stock: 0,
      minStock: 3,
      buyPrice: 28000,
      sellPrice: 60000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      businessId,
      name: "Copper tube 1/4",
      sku: "CP-14",
      category: "Consumable",
      stock: 18,
      minStock: 6,
      buyPrice: 70000,
      sellPrice: 120000,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  await db.insert(contracts).values([
    {
      id: crypto.randomUUID(),
      businessId,
      customerId: customerIds.sinar,
      plan: "Bulanan",
      serviceInterval: "Bulanan",
      unitCount: 10,
      value: 4800000,
      nextServiceAt: new Date("2026-04-04T09:00:00+08:00"),
      status: "Aktif",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      businessId,
      customerId: customerIds.arafah,
      plan: "Kuartalan",
      serviceInterval: "Kuartalan",
      unitCount: 6,
      value: 2700000,
      nextServiceAt: new Date("2026-03-26T09:00:00+08:00"),
      status: "Hampir Jatuh Tempo",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: crypto.randomUUID(),
      businessId,
      customerId: customerIds.sinar,
      plan: "Tahunan",
      serviceInterval: "Tahunan",
      unitCount: 18,
      value: 32000000,
      nextServiceAt: new Date("2025-12-30T09:00:00+08:00"),
      status: "Expired",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ]);

  console.log("Demo seed completed.");
  console.log(`Admin login: ${env.ADMIN_EMAIL} / ${env.ADMIN_PASSWORD}`);
  console.log(`Moderator login: ${env.MODERATOR_EMAIL} / ${env.MODERATOR_PASSWORD}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

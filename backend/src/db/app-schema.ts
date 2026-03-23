import { relations } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema.js";

export const businesses = sqliteTable("businesses", {
  id: text("id").primaryKey(),
  ownerUserId: text("owner_user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  serviceType: text("service_type").notNull().default("AC"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  plan: text("plan").notNull().default("Pro"),
  subscriptionStatus: text("subscription_status").notNull().default("trialing"),
  trialEndsAt: integer("trial_ends_at", { mode: "timestamp" }),
  currentPeriodEndsAt: integer("current_period_ends_at", { mode: "timestamp" }),
  subscriptionNotes: text("subscription_notes"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const technicians = sqliteTable("technicians", {
  id: text("id").primaryKey(),
  businessId: text("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  specialties: text("specialties", { mode: "json" }).$type<string[]>().notNull(),
  status: text("status").notNull().default("Aktif"),
  rating: real("rating").notNull().default(0),
  latitude: real("latitude"),
  longitude: real("longitude"),
  lastSeenAt: integer("last_seen_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  businessId: text("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  units: text("units", { mode: "json" }).$type<string[]>().notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  businessId: text("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  number: text("number").notNull().unique(),
  title: text("title").notNull(),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  technicianId: text("technician_id").references(() => technicians.id, {
    onDelete: "set null",
  }),
  assignedTechnicianIds: text("assigned_technician_ids", { mode: "json" }).$type<string[]>(),
  type: text("type").notNull(),
  scheduleAt: integer("schedule_at", { mode: "timestamp" }).notNull(),
  price: integer("price").notNull(),
  status: text("status").notNull().default("pending"),
  priority: text("priority").notNull().default("Normal"),
  description: text("description").notNull().default(""),
  location: text("location").notNull(),
  beforePhotoUrl: text("before_photo_url"),
  afterPhotoUrl: text("after_photo_url"),
  cancelReason: text("cancel_reason"),
  completedAt: integer("completed_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const jobItems = sqliteTable("job_items", {
  id: text("id").primaryKey(),
  jobId: text("job_id")
    .notNull()
    .references(() => jobs.id, { onDelete: "cascade" }),
  inventoryId: text("inventory_id").references(() => inventory.id, { onDelete: "set null" }),
  kind: text("kind").notNull().default("service"),
  name: text("name").notNull(),
  quantity: integer("quantity").notNull().default(1),
  unitPrice: integer("unit_price").notNull().default(0),
  totalPrice: integer("total_price").notNull().default(0),
  note: text("note"),
});

export const invoices = sqliteTable("invoices", {
  id: text("id").primaryKey(),
  businessId: text("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  jobId: text("job_id").references(() => jobs.id, { onDelete: "set null" }),
  number: text("number").notNull().unique(),
  total: integer("total").notNull(),
  status: text("status").notNull().default("Draft"),
  dueDate: integer("due_date", { mode: "timestamp" }).notNull(),
  paidAmount: integer("paid_amount").notNull().default(0),
  paymentMethod: text("payment_method"),
  paidAt: integer("paid_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const contracts = sqliteTable("contracts", {
  id: text("id").primaryKey(),
  businessId: text("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  customerId: text("customer_id")
    .notNull()
    .references(() => customers.id, { onDelete: "cascade" }),
  plan: text("plan").notNull(),
  serviceInterval: text("service_interval").notNull().default("Bulanan"),
  unitCount: integer("unit_count").notNull().default(1),
  value: integer("value").notNull(),
  nextServiceAt: integer("next_service_at", { mode: "timestamp" }).notNull(),
  status: text("status").notNull().default("Aktif"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const inventory = sqliteTable("inventory", {
  id: text("id").primaryKey(),
  businessId: text("business_id")
    .notNull()
    .references(() => businesses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  category: text("category").notNull(),
  stock: integer("stock").notNull().default(0),
  minStock: integer("min_stock").notNull().default(0),
  buyPrice: integer("buy_price").notNull().default(0),
  sellPrice: integer("sell_price").notNull().default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .$defaultFn(() => new Date())
    .notNull(),
});

export const businessesRelations = relations(businesses, ({ many, one }) => ({
  owner: one(user, {
    fields: [businesses.ownerUserId],
    references: [user.id],
  }),
  technicians: many(technicians),
  customers: many(customers),
  jobs: many(jobs),
  invoices: many(invoices),
  contracts: many(contracts),
  inventory: many(inventory),
}));

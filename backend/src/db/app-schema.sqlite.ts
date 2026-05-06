import { relations, sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { user } from "./auth-schema.sqlite.js";

const timestamp = (name: string) => integer(name, { mode: "timestamp" });
const jsonText = <T>(name: string) => text(name, { mode: "json" }).$type<T>();

export const businesses = sqliteTable("businesses", {
  id: text("id").primaryKey(),
  ownerUserId: text("owner_user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  serviceType: text("service_type").notNull().default("AC"),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  city: text("city"),
  plan: text("plan").notNull().default("Starter"),
  subscriptionStatus: text("subscription_status").notNull().default("trialing"),
  trialEndsAt: timestamp("trial_ends_at"),
  currentPeriodEndsAt: timestamp("current_period_ends_at"),
  subscriptionNotes: text("subscription_notes"),
  whatsappMode: text("whatsapp_mode").notNull().default("basic"),
  whatsappAutomationStatus: text("whatsapp_automation_status").notNull().default("not_connected"),
  whatsappAutomationConnectedAt: timestamp("whatsapp_automation_connected_at"),
  whatsappAutomationLastError: text("whatsapp_automation_last_error"),
  createdAt: timestamp("created_at").default(sql`(unixepoch())`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`(unixepoch())`).notNull(),
});

export const adminInboxRequests = sqliteTable("admin_inbox_requests", {
  id: text("id").primaryKey(),
  businessId: text("business_id").references(() => businesses.id, { onDelete: "set null" }),
  type: text("type").notNull(),
  status: text("status").notNull().default("open"),
  source: text("source").notNull().default("app"),
  businessName: text("business_name"),
  requesterName: text("requester_name"),
  requesterEmail: text("requester_email"),
  requesterPhone: text("requester_phone"),
  currentPlan: text("current_plan"),
  targetPlan: text("target_plan"),
  message: text("message"),
  createdAt: timestamp("created_at").default(sql`(unixepoch())`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`(unixepoch())`).notNull(),
});

export const technicians = sqliteTable("technicians", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }).unique(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  specialties: jsonText<string[]>("specialties").notNull(),
  status: text("status").notNull().default("Aktif"),
  rating: real("rating").notNull().default(0),
  latitude: real("latitude"),
  longitude: real("longitude"),
  lastSeenAt: timestamp("last_seen_at"),
  accountEmail: text("account_email"),
  accountStatus: text("account_status").notNull().default("not_created"),
  attendanceStatus: text("attendance_status").notNull().default("Belum Check-in"),
  attendancePhotoUrl: text("attendance_photo_url"),
  attendanceNote: text("attendance_note"),
  attendanceType: text("attendance_type").notNull().default("harian"),
  attendanceJobId: text("attendance_job_id"),
  attendanceLocationLabel: text("attendance_location_label"),
  attendanceLatitude: real("attendance_latitude"),
  attendanceLongitude: real("attendance_longitude"),
  attendanceUpdatedAt: timestamp("attendance_updated_at"),
  createdAt: timestamp("created_at").default(sql`(unixepoch())`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`(unixepoch())`).notNull(),
});

export const customers = sqliteTable("customers", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email"),
  address: text("address").notNull(),
  units: jsonText<string[]>("units").notNull(),
  createdAt: timestamp("created_at").default(sql`(unixepoch())`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`(unixepoch())`).notNull(),
});

export const jobs = sqliteTable("jobs", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  number: text("number").notNull().unique(),
  title: text("title").notNull(),
  customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  technicianId: text("technician_id").references(() => technicians.id, { onDelete: "set null" }),
  assignedTechnicianIds: jsonText<string[]>("assigned_technician_ids"),
  type: text("type").notNull(),
  scheduleAt: timestamp("schedule_at").notNull(),
  deadlineAt: timestamp("deadline_at"),
  price: integer("price").notNull(),
  status: text("status").notNull().default("pending"),
  priority: text("priority").notNull().default("Normal"),
  description: text("description").notNull().default(""),
  location: text("location").notNull(),
  beforePhotoUrl: text("before_photo_url"),
  afterPhotoUrl: text("after_photo_url"),
  cancelReason: text("cancel_reason"),
  completedAt: timestamp("completed_at"),
  completedLatitude: real("completed_latitude"),
  completedLongitude: real("completed_longitude"),
  createdAt: timestamp("created_at").default(sql`(unixepoch())`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`(unixepoch())`).notNull(),
});

export const inventory = sqliteTable("inventory", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  sku: text("sku").notNull().unique(),
  category: text("category").notNull(),
  stock: integer("stock").notNull().default(0),
  minStock: integer("min_stock").notNull().default(0),
  buyPrice: integer("buy_price").notNull().default(0),
  sellPrice: integer("sell_price").notNull().default(0),
  createdAt: timestamp("created_at").default(sql`(unixepoch())`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`(unixepoch())`).notNull(),
});

export const jobItems = sqliteTable("job_items", {
  id: text("id").primaryKey(),
  jobId: text("job_id").notNull().references(() => jobs.id, { onDelete: "cascade" }),
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
  businessId: text("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  jobId: text("job_id").references(() => jobs.id, { onDelete: "set null" }),
  number: text("number").notNull().unique(),
  total: integer("total").notNull(),
  status: text("status").notNull().default("Draft"),
  dueDate: timestamp("due_date").notNull(),
  paidAmount: integer("paid_amount").notNull().default(0),
  paymentMethod: text("payment_method"),
  paidAt: timestamp("paid_at"),
  createdAt: timestamp("created_at").default(sql`(unixepoch())`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`(unixepoch())`).notNull(),
});

export const contracts = sqliteTable("contracts", {
  id: text("id").primaryKey(),
  businessId: text("business_id").notNull().references(() => businesses.id, { onDelete: "cascade" }),
  customerId: text("customer_id").notNull().references(() => customers.id, { onDelete: "cascade" }),
  plan: text("plan").notNull(),
  serviceInterval: text("service_interval").notNull().default("Bulanan"),
  unitCount: integer("unit_count").notNull().default(1),
  value: integer("value").notNull(),
  nextServiceAt: timestamp("next_service_at").notNull(),
  status: text("status").notNull().default("Aktif"),
  createdAt: timestamp("created_at").default(sql`(unixepoch())`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`(unixepoch())`).notNull(),
});

export const businessesRelations = relations(businesses, ({ many, one }) => ({
  owner: one(user, {
    fields: [businesses.ownerUserId],
    references: [user.id],
  }),
  adminInboxRequests: many(adminInboxRequests),
  technicians: many(technicians),
  customers: many(customers),
  jobs: many(jobs),
  invoices: many(invoices),
  contracts: many(contracts),
  inventory: many(inventory),
}));


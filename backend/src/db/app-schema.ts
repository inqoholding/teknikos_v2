import { env } from "../lib/env.js";
import { detectDatabaseDialect } from "./runtime.js";
import * as pgSchema from "./app-schema.pg.js";
import * as sqliteSchema from "./app-schema.sqlite.js";

const schema = detectDatabaseDialect(env.DATABASE_URL) === "sqlite" ? sqliteSchema : pgSchema;

export const businesses = schema.businesses as typeof sqliteSchema.businesses;
export const adminInboxRequests = schema.adminInboxRequests as typeof sqliteSchema.adminInboxRequests;
export const technicians = schema.technicians as typeof sqliteSchema.technicians;
export const customers = schema.customers as typeof sqliteSchema.customers;
export const jobs = schema.jobs as typeof sqliteSchema.jobs;
export const inventory = schema.inventory as typeof sqliteSchema.inventory;
export const jobItems = schema.jobItems as typeof sqliteSchema.jobItems;
export const invoices = schema.invoices as typeof sqliteSchema.invoices;
export const contracts = schema.contracts as typeof sqliteSchema.contracts;
export const businessesRelations = schema.businessesRelations as typeof sqliteSchema.businessesRelations;

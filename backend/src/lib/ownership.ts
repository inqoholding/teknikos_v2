import { and, eq } from "drizzle-orm";
import { customers, inventory, invoices, jobs, technicians } from "../db/app-schema.js";
import { db } from "../db/index.js";
import { badRequest, notFound } from "./errors.js";

export async function requireCustomerForBusiness(customerId: string, businessId: string) {
  const [customer] = await db
    .select()
    .from(customers)
    .where(and(eq(customers.id, customerId), eq(customers.businessId, businessId)));

  if (!customer) {
    throw badRequest("Pelanggan tidak valid untuk bisnis ini.");
  }

  return customer;
}

export async function requireTechnicianForBusiness(technicianId: string, businessId: string) {
  const [technician] = await db
    .select()
    .from(technicians)
    .where(and(eq(technicians.id, technicianId), eq(technicians.businessId, businessId)));

  if (!technician) {
    throw badRequest("Teknisi tidak valid untuk bisnis ini.");
  }

  return technician;
}

export async function requireJobForBusiness(jobId: string, businessId: string) {
  const [job] = await db
    .select()
    .from(jobs)
    .where(and(eq(jobs.id, jobId), eq(jobs.businessId, businessId)));

  if (!job) {
    throw notFound("Job tidak ditemukan.");
  }

  return job;
}

export async function requireInvoiceForBusiness(invoiceId: string, businessId: string) {
  const [invoice] = await db
    .select()
    .from(invoices)
    .where(and(eq(invoices.id, invoiceId), eq(invoices.businessId, businessId)));

  if (!invoice) {
    throw notFound("Invoice tidak ditemukan.");
  }

  return invoice;
}

export async function requireInventoryForBusiness(inventoryId: string, businessId: string) {
  const [item] = await db
    .select()
    .from(inventory)
    .where(and(eq(inventory.id, inventoryId), eq(inventory.businessId, businessId)));

  if (!item) {
    throw badRequest("Barang inventori tidak valid untuk bisnis ini.");
  }

  return item;
}

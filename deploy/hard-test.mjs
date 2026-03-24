import fs from "node:fs";

const baseUrl = process.argv[2] || "http://127.0.0.1:3301";
const envFile = process.argv[3] || "/var/www/teknikos/backend/.env";

const env = Object.fromEntries(
  fs
    .readFileSync(envFile, "utf8")
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith("#") && line.includes("="))
    .map((line) => {
      const index = line.indexOf("=");
      return [line.slice(0, index), line.slice(index + 1)];
    }),
);

const CSRF_HEADER_NAME = "x-teknikos-csrf";
const CSRF_HEADER_VALUE = "1";

function createClient(label) {
  let cookie = "";

  return {
    async request(path, init = {}) {
      const headers = new Headers(init.headers || {});
      if (!headers.has("Content-Type") && init.body) {
        headers.set("Content-Type", "application/json");
      }
      const method = (init.method || "GET").toUpperCase();
      if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
        headers.set(CSRF_HEADER_NAME, CSRF_HEADER_VALUE);
      }
      if (cookie) {
        headers.set("Cookie", cookie);
      }

      const response = await fetch(`${baseUrl}${path}`, { ...init, headers });
      const setCookie = response.headers.get("set-cookie");
      if (setCookie) {
        cookie = setCookie.split(",").map((part) => part.split(";")[0].trim()).join("; ");
      }

      const text = await response.text();
      let json = null;
      try {
        json = text ? JSON.parse(text) : null;
      } catch {
        json = null;
      }

      if (!response.ok) {
        throw new Error(`${label} ${init.method || "GET"} ${path} failed: ${response.status} ${text}`);
      }

      return json;
    },
  };
}

async function login(client, email, password) {
  const payload = { email, password };
  await client.request("/api/auth/sign-in/email", {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return client.request("/api/auth/get-session");
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function logPass(message) {
  console.log(`PASS ${message}`);
}

async function main() {
  const owner = createClient("owner");
  const admin = createClient("admin");
  const stamp = Date.now();
  const qaSuffix = `QA-${stamp}`;

  const ownerSession = await login(owner, env.DEMO_OWNER_EMAIL, env.DEMO_OWNER_PASSWORD);
  assert(ownerSession?.user?.email === env.DEMO_OWNER_EMAIL, "Owner session mismatch.");
  logPass("owner login");

  const adminSession = await login(admin, env.ADMIN_EMAIL, env.ADMIN_PASSWORD);
  assert(adminSession?.user?.email === env.ADMIN_EMAIL, "Admin session mismatch.");
  logPass("admin login");

  const business = await owner.request("/api/business/me");
  const dashboard = await owner.request("/api/dashboard/stats");
  const jobs = await owner.request("/api/jobs");
  const technicians = await owner.request("/api/technicians");
  const customers = await owner.request("/api/customers");
  const invoices = await owner.request("/api/invoices");
  const inventory = await owner.request("/api/inventory");
  const contracts = await owner.request("/api/contracts");

  assert(business?.data?.id, "Business missing.");
  assert(Array.isArray(dashboard?.data?.opsQueues), "Dashboard opsQueues missing.");
  assert(Array.isArray(jobs?.data), "Jobs list missing.");
  assert(Array.isArray(technicians?.data), "Technicians list missing.");
  assert(Array.isArray(customers?.data), "Customers list missing.");
  assert(Array.isArray(invoices?.data), "Invoices list missing.");
  assert(Array.isArray(inventory?.data), "Inventory list missing.");
  assert(Array.isArray(contracts?.data), "Contracts list missing.");
  logPass("owner read endpoints");

  const createdCustomer = await owner.request("/api/customers", {
    method: "POST",
    body: JSON.stringify({
      name: `Pelanggan ${qaSuffix}`,
      phone: "081234567890",
      email: `qa-${stamp}@example.com`,
      address: "Jl. QA TeknikOS No. 1, Makassar",
      units: ["Pompa air 2 unit", "Panel listrik 1 unit"],
    }),
  });
  assert(createdCustomer?.data?.id, "Customer create failed.");
  logPass("create customer");

  const updatedCustomer = await owner.request(`/api/customers/${createdCustomer.data.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      address: "Jl. QA TeknikOS No. 2, Makassar",
      units: ["Pompa air 3 unit"],
    }),
  });
  assert(updatedCustomer?.data?.address?.includes("No. 2"), "Customer patch failed.");
  logPass("update customer");

  const createdTechnician = await owner.request("/api/technicians", {
    method: "POST",
    body: JSON.stringify({
      name: `Teknisi ${qaSuffix}`,
      phone: "081298765432",
      specialties: ["Pompa", "Listrik"],
      status: "Aktif",
      rating: 4.5,
    }),
  });
  assert(createdTechnician?.data?.id, "Technician create failed.");
  logPass("create technician");

  const updatedTechnician = await owner.request(`/api/technicians/${createdTechnician.data.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "Standby",
      specialties: ["Pompa", "Listrik", "Maintenance"],
    }),
  });
  assert(updatedTechnician?.data?.status === "Standby", "Technician patch failed.");
  logPass("update technician");

  const createdInventory = await owner.request("/api/inventory", {
    method: "POST",
    body: JSON.stringify({
      name: `Kapasitor ${qaSuffix}`,
      sku: `SKU-${stamp}`,
      category: "Sparepart",
      stock: 10,
      minStock: 2,
      buyPrice: 50000,
      sellPrice: 75000,
    }),
  });
  assert(createdInventory?.data?.id, "Inventory create failed.");
  logPass("create inventory");

  const adjustedInventory = await owner.request(`/api/inventory/${createdInventory.data.id}/adjust-stock`, {
    method: "PATCH",
    body: JSON.stringify({ delta: -3 }),
  });
  assert(adjustedInventory?.data?.stock === 7, "Inventory adjust failed.");
  logPass("adjust inventory");

  const createdJob = await owner.request("/api/jobs", {
    method: "POST",
    body: JSON.stringify({
      title: `Service Lapangan ${qaSuffix}`,
      customerId: createdCustomer.data.id,
      technicianId: createdTechnician.data.id,
      technicianIds: [createdTechnician.data.id],
      type: "Maintenance",
      scheduleAt: new Date(Date.now() + 86_400_000).toISOString(),
      price: 250000,
      status: "assigned",
      priority: "Normal",
      description: "Job QA untuk verifikasi create dan update status.",
      location: "Jl. Uji Coba API No. 3, Makassar",
      items: [],
    }),
  });
  assert(createdJob?.data?.id, "Job create failed.");
  logPass("create job");

  const progressedJob = await owner.request(`/api/jobs/${createdJob.data.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "on_the_way",
      technicianIds: [createdTechnician.data.id],
      items: [
        {
          inventoryId: createdInventory.data.id,
          kind: "sparepart",
          name: `Kapasitor ${qaSuffix}`,
          quantity: 1,
          unitPrice: 75000,
          note: "Dipakai saat QA",
        },
      ],
      price: 75000,
    }),
  });
  assert(progressedJob?.data?.status === "on_the_way", "Job patch to on_the_way failed.");
  logPass("update job status and items");

  const detailedJob = await owner.request(`/api/jobs/${createdJob.data.id}`);
  assert(detailedJob?.data?.items?.length === 1, "Job detail items missing after update.");
  logPass("job detail");

  const createdInvoice = await owner.request("/api/invoices", {
    method: "POST",
    body: JSON.stringify({
      customerId: createdCustomer.data.id,
      jobId: createdJob.data.id,
      total: 250000,
      status: "Sent",
      dueDate: new Date(Date.now() + 3 * 86_400_000).toISOString(),
      paidAmount: 0,
    }),
  });
  assert(createdInvoice?.data?.id, "Invoice create failed.");
  logPass("create invoice");

  const updatedInvoice = await owner.request(`/api/invoices/${createdInvoice.data.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      status: "Paid",
      paidAmount: 250000,
      paymentMethod: "Transfer",
    }),
  });
  assert(updatedInvoice?.data?.status === "Paid", "Invoice patch failed.");
  logPass("update invoice");

  const createdContract = await owner.request("/api/contracts", {
    method: "POST",
    body: JSON.stringify({
      customerId: createdCustomer.data.id,
      plan: "Maintenance QA",
      serviceInterval: "Bulanan",
      unitCount: 2,
      value: 500000,
      nextServiceAt: new Date(Date.now() + 14 * 86_400_000).toISOString(),
    }),
  });
  assert(createdContract?.data?.id, "Contract create failed.");
  logPass("create contract");

  const customerDetail = await owner.request(`/api/customers/${createdCustomer.data.id}`);
  assert(customerDetail?.data?.contracts?.length >= 1, "Customer detail contracts missing.");
  logPass("customer detail");

  const subscriptions = await admin.request("/api/admin/subscriptions");
  const ownerBusiness = subscriptions?.data?.find((row) => row.id === business.data.id);
  assert(ownerBusiness?.id, "Owner business missing from admin subscriptions.");
  logPass("admin subscriptions");

  const originalNotes = ownerBusiness.subscriptionNotes ?? "";
  const updatedSubscription = await admin.request(`/api/admin/subscriptions/${ownerBusiness.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      plan: ownerBusiness.plan,
      subscriptionStatus: ownerBusiness.subscriptionStatus,
      subscriptionNotes: `QA check ${qaSuffix}`,
    }),
  });
  assert(updatedSubscription?.data?.subscriptionNotes?.includes(qaSuffix), "Admin subscription patch failed.");
  logPass("admin update subscription");

  await admin.request(`/api/admin/subscriptions/${ownerBusiness.id}`, {
    method: "PATCH",
    body: JSON.stringify({
      plan: ownerBusiness.plan,
      subscriptionStatus: ownerBusiness.subscriptionStatus,
      subscriptionNotes: originalNotes,
    }),
  });
  logPass("admin restore subscription notes");

  console.log("Hard test completed.");
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});

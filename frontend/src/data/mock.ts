export type JobStatus =
  | "pending"
  | "assigned"
  | "on_the_way"
  | "in_progress"
  | "done"
  | "paid"
  | "cancelled";

export interface Job {
  id: string;
  number: string;
  title: string;
  customerId: string;
  customer: string;
  technicianId: string;
  technician: string;
  type: string;
  schedule: string;
  price: string;
  status: JobStatus;
  priority?: "Normal" | "Urgent";
  description: string;
  location: string;
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  specialties: string[];
  status: "Aktif" | "Bertugas" | "Standby" | "Tidak Aktif";
  rating: number;
  jobsCompleted: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  units: string[];
  totalJobs: number;
  lastService: string;
  contract: string;
}

export interface Invoice {
  id: string;
  number: string;
  customer: string;
  job: string;
  total: string;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  dueDate: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  stock: number;
  minStock: number;
  buyPrice: string;
  sellPrice: string;
  status: "Aman" | "Rendah" | "Habis";
}

export interface Contract {
  id: string;
  customer: string;
  plan: string;
  value: string;
  nextService: string;
  status: "Aktif" | "Hampir Jatuh Tempo" | "Expired";
}

export const business = {
  name: "CV Teknik Makassar",
  owner: "Budi Santoso",
  location: "Makassar HQ",
};

export const dashboardStats = [
  { label: "Job Hari Ini", value: "14", hint: "+3 dari kemarin", tone: "success" as const },
  { label: "Job Aktif", value: "6", hint: "2 prioritas urgent", tone: "warning" as const },
  { label: "Teknisi Aktif", value: "4", hint: "1 teknisi standby", tone: "default" as const },
  { label: "Revenue Bulan Ini", value: "Rp18,5 jt", hint: "Naik 18% MoM", tone: "success" as const },
];

export const revenueBars = [
  { label: "Sen", value: 42 },
  { label: "Sel", value: 58 },
  { label: "Rab", value: 46 },
  { label: "Kam", value: 78 },
  { label: "Jum", value: 64 },
  { label: "Sab", value: 52 },
  { label: "Min", value: 36 },
];

export const statusBreakdown = [
  { label: "Pending", value: 3, color: "var(--amber-default)" },
  { label: "On the way", value: 4, color: "#2b7bbb" },
  { label: "Done", value: 5, color: "var(--green-default)" },
  { label: "Paid", value: 2, color: "#beb9ac" },
];

export const technicians: Technician[] = [
  {
    id: "tech-1",
    name: "Ardiansyah",
    phone: "0812 4444 1212",
    specialties: ["AC Cassette", "VRV", "Freon"],
    status: "Aktif",
    rating: 4.8,
    jobsCompleted: 124,
  },
  {
    id: "tech-2",
    name: "Fadli",
    phone: "0813 9988 1122",
    specialties: ["Split Wall", "Freon"],
    status: "Bertugas",
    rating: 4.7,
    jobsCompleted: 98,
  },
  {
    id: "tech-3",
    name: "Rian",
    phone: "0811 7331 882",
    specialties: ["Listrik", "Panel"],
    status: "Standby",
    rating: 4.9,
    jobsCompleted: 147,
  },
];

export const customers: Customer[] = [
  {
    id: "customer-1",
    name: "PT Sinar Jaya",
    phone: "0812 4455 8899",
    email: "admin@sinarjaya.co.id",
    address: "Jl. Urip Sumoharjo No. 55, Makassar",
    units: ["Cassette Daikin 2PK · 4 unit", "Split Wall Panasonic 1PK · 6 unit"],
    totalJobs: 18,
    lastService: "Hari ini",
    contract: "Aktif · Next 04 Apr 2026",
  },
  {
    id: "customer-2",
    name: "Klinik Arafah",
    phone: "0813 9988 4455",
    email: "ops@klinikarafah.id",
    address: "Jl. Alauddin, Makassar",
    units: ["Split Wall Gree 1PK · 6 unit"],
    totalJobs: 9,
    lastService: "17 Mar 2026",
    contract: "Hampir jatuh tempo",
  },
  {
    id: "customer-3",
    name: "Ibu Lina",
    phone: "0812 7000 2121",
    email: "lina@example.com",
    address: "BTP Blok M, Makassar",
    units: ["Split Wall Panasonic 2PK · 1 unit"],
    totalJobs: 4,
    lastService: "14 Mar 2026",
    contract: "Tidak ada",
  },
];

export const jobs: Job[] = [
  {
    id: "job-014",
    number: "JOB-014",
    title: "Cuci besar 4 unit cassette",
    customerId: "customer-1",
    customer: "PT Sinar Jaya",
    technicianId: "tech-1",
    technician: "Ardiansyah",
    type: "AC",
    schedule: "19 Mar 2026 · 09:30 WIB",
    price: "Rp450rb",
    status: "on_the_way",
    priority: "Urgent",
    description:
      "Cuci besar 4 unit cassette, cek drain, dan dokumentasi before/after untuk area lobby gedung utama.",
    location: "Jl. Urip Sumoharjo No. 55, Makassar",
  },
  {
    id: "job-013",
    number: "JOB-013",
    title: "Isi freon R32 2PK",
    customerId: "customer-3",
    customer: "Ibu Lina",
    technicianId: "tech-2",
    technician: "Fadli",
    type: "AC",
    schedule: "19 Mar 2026 · 11:00 WIB",
    price: "Rp900rb",
    status: "pending",
    priority: "Normal",
    description: "Isi freon dan cek tekanan untuk unit split wall lantai dua.",
    location: "BTP Blok M, Makassar",
  },
  {
    id: "job-012",
    number: "JOB-012",
    title: "Preventive maintenance",
    customerId: "customer-2",
    customer: "Klinik Arafah",
    technicianId: "tech-3",
    technician: "Rian",
    type: "Maintenance",
    schedule: "19 Mar 2026 · 13:00 WIB",
    price: "Rp1,2jt",
    status: "done",
    priority: "Normal",
    description: "Preventive maintenance untuk enam unit split wall klinik.",
    location: "Jl. Alauddin, Makassar",
  },
  {
    id: "job-011",
    number: "JOB-011",
    title: "Overhaul outdoor unit",
    customerId: "customer-1",
    customer: "PT Sinar Jaya",
    technicianId: "tech-1",
    technician: "Ardiansyah",
    type: "AC",
    schedule: "20 Mar 2026 · 10:00 WIB",
    price: "Rp2,4jt",
    status: "assigned",
    priority: "Urgent",
    description: "Overhaul outdoor unit rooftop dan cek compressor.",
    location: "Makassar",
  },
];

export const invoices: Invoice[] = [
  { id: "invoice-1", number: "INV-2026-014", customer: "PT Sinar Jaya", job: "JOB-014", total: "Rp450rb", status: "Sent", dueDate: "22 Mar 2026" },
  { id: "invoice-2", number: "INV-2026-013", customer: "Ibu Lina", job: "JOB-013", total: "Rp900rb", status: "Paid", dueDate: "19 Mar 2026" },
  { id: "invoice-3", number: "INV-2026-011", customer: "Hotel Marannu", job: "JOB-011", total: "Rp2,4jt", status: "Overdue", dueDate: "15 Mar 2026" },
];

export const inventory: InventoryItem[] = [
  { id: "item-1", name: "Freon R32 3kg", sku: "FR-R32-3", category: "Freon", stock: 2, minStock: 4, buyPrice: "Rp340rb", sellPrice: "Rp450rb", status: "Rendah" },
  { id: "item-2", name: "Kapasitor 35uF", sku: "KP-35UF", category: "Sparepart", stock: 0, minStock: 3, buyPrice: "Rp28rb", sellPrice: "Rp60rb", status: "Habis" },
  { id: "item-3", name: "Copper tube 1/4", sku: "CP-14", category: "Consumable", stock: 18, minStock: 6, buyPrice: "Rp70rb", sellPrice: "Rp120rb", status: "Aman" },
];

export const contracts: Contract[] = [
  { id: "contract-1", customer: "PT Sinar Jaya", plan: "Bulanan · 10 unit", value: "Rp4,8jt", nextService: "04 Apr 2026", status: "Aktif" },
  { id: "contract-2", customer: "Klinik Arafah", plan: "Kuartalan · 6 unit", value: "Rp2,7jt", nextService: "26 Mar 2026", status: "Hampir Jatuh Tempo" },
  { id: "contract-3", customer: "Hotel Marannu", plan: "Tahunan · 18 unit", value: "Rp32jt", nextService: "Expired", status: "Expired" },
];

export const settings = {
  businessName: business.name,
  whatsapp: "0812 4567 8890",
  address: "Jl. Veteran No. 18, Makassar Selatan, Sulawesi Selatan",
};

export const appNav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/jobs", label: "Job Order" },
  { to: "/technicians", label: "Teknisi" },
  { to: "/customers", label: "Pelanggan" },
  { to: "/invoices", label: "Invoice" },
  { to: "/inventory", label: "Inventori" },
  { to: "/contracts", label: "Kontrak" },
  { to: "/settings", label: "Pengaturan" },
];

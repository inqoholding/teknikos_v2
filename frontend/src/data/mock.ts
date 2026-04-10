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
  attendanceType?: "Harian" | "Lokasi Job";
  attendanceLocationLabel?: string;
  lastCheckIn?: string;
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
  city: "Makassar",
  plan: "Pro",
  subscriptionStatusLabel: "Aktif",
};

export const dashboardStats = [
  { label: "Job Hari Ini", value: "14", hint: "+3 dari kemarin", tone: "success" as const },
  { label: "Job Aktif", value: "6", hint: "2 prioritas urgent", tone: "warning" as const },
  { label: "Teknisi Aktif", value: "4", hint: "1 teknisi standby", tone: "default" as const },
  { label: "Revenue Bulan Ini", value: "Rp18.500.000", hint: "Naik 18% MoM", tone: "success" as const },
];

export const revenueBars = [
  { label: "Sen", value: 420_000 },
  { label: "Sel", value: 580_000 },
  { label: "Rab", value: 460_000 },
  { label: "Kam", value: 780_000 },
  { label: "Jum", value: 640_000 },
  { label: "Sab", value: 520_000 },
  { label: "Min", value: 360_000 },
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
    attendanceType: "Harian",
    attendanceLocationLabel: "Workshop Pusat · Makassar",
    lastCheckIn: "08:15",
  },
  {
    id: "tech-2",
    name: "Fadli",
    phone: "0813 9988 1122",
    specialties: ["CCTV", "Access Control", "IT"],
    status: "Bertugas",
    rating: 4.7,
    jobsCompleted: 98,
    attendanceType: "Lokasi Job",
    attendanceLocationLabel: "Bank BCA KCP Pettarani (JOB-015)",
    lastCheckIn: "09:45",
  },
  {
    id: "tech-3",
    name: "Rian",
    phone: "0811 7331 882",
    specialties: ["Listrik 3 Phase", "Panel", "Genset"],
    status: "Standby",
    rating: 4.9,
    jobsCompleted: 147,
    attendanceType: "Harian",
    attendanceLocationLabel: "Workshop Pusat · Makassar",
    lastCheckIn: "08:30",
  },
  {
    id: "tech-4",
    name: "Reza",
    phone: "0812 3333 4444",
    specialties: ["Mesin Cuci", "Pompa Air", "Water Heater"],
    status: "Aktif",
    rating: 4.6,
    jobsCompleted: 85,
    attendanceType: "Lokasi Job",
    attendanceLocationLabel: "Laundry Bersih Wangi (JOB-017)",
    lastCheckIn: "10:15",
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
    name: "Bank BCA KCP Pettarani",
    phone: "0811 2233 4455",
    email: "ops@bca-makassar.id",
    address: "Jl. AP Pettarani, Makassar",
    units: ["CCTV Hikvision IP Camera · 16 titik", "DVR 32 Channel · 1 unit"],
    totalJobs: 5,
    lastService: "12 Mar 2026",
    contract: "Aktif · Next 12 Jun 2026",
  },
  {
    id: "customer-3",
    name: "Laundry Bersih Wangi",
    phone: "0812 7000 2121",
    email: "admin@bersihwangi.com",
    address: "BTP Blok M, Makassar",
    units: ["Mesin Cuci LG Front Load 15kg · 4 unit", "Dryer SpeedQueen · 2 unit"],
    totalJobs: 8,
    lastService: "Hari ini",
    contract: "Tidak ada",
  },
  {
    id: "customer-4",
    name: "Bapak Hendra (Rumah)",
    phone: "0821 5566 7788",
    email: "hendra@gmail.com",
    address: "CitraLand Celebes Cluster A No 12",
    units: ["Panel Listrik Induk", "Water Heater Ariston"],
    totalJobs: 2,
    lastService: "19 Mar 2026",
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
    schedule: "Hari ini · 09:30 WIB",
    price: "Rp600.000",
    status: "in_progress",
    priority: "Normal",
    description: "Cuci besar 4 unit cassette, cek drain, dan dokumentasi before/after untuk area lobby gedung utama.",
    location: "Jl. Urip Sumoharjo No. 55, Makassar",
  },
  {
    id: "job-015",
    number: "JOB-015",
    title: "Instalasi 4 titik CCTV tambahan",
    customerId: "customer-2",
    customer: "Bank BCA KCP Pettarani",
    technicianId: "tech-2",
    technician: "Fadli",
    type: "CCTV",
    schedule: "Hari ini · 11:00 WIB",
    price: "Rp3.200.000",
    status: "on_the_way",
    priority: "Urgent",
    description: "Tarikan kabel LAN Belden dan instalasi 4 IP Camera baru di area parkir belakang.",
    location: "Jl. AP Pettarani, Makassar",
  },
  {
    id: "job-016",
    number: "JOB-016",
    title: "Troubleshooting korsleting MCB",
    customerId: "customer-4",
    customer: "Bapak Hendra (Rumah)",
    technicianId: "tech-3",
    technician: "Rian",
    type: "Listrik",
    schedule: "Hari ini · 13:00 WIB",
    price: "Menunggu estimasi",
    status: "assigned",
    priority: "Urgent",
    description: "MCB sering trip saat menyalakan pompa air dan AC bersamaan. Perlu pengecekan panel induk.",
    location: "CitraLand Celebes Cluster A No 12",
  },
  {
    id: "job-017",
    number: "JOB-017",
    title: "Servis Modul Papan Mesin Cuci LG",
    customerId: "customer-3",
    customer: "Laundry Bersih Wangi",
    technicianId: "tech-4",
    technician: "Reza",
    type: "Elektronik",
    schedule: "Hari ini · 14:00 WIB",
    price: "Rp850.000",
    status: "pending",
    priority: "Normal",
    description: "Error code LE di mesin LG Front Load 15kg. Siapkan sparepart dinamo atau modul sensor.",
    location: "BTP Blok M, Makassar",
  },
  {
    id: "job-012",
    number: "JOB-012",
    title: "Preventive maintenance Kontrak",
    customerId: "customer-2",
    customer: "Bank BCA KCP Pettarani",
    technicianId: "tech-2",
    technician: "Fadli",
    type: "Maintenance",
    schedule: "Kemarin · 15:00 WIB",
    price: "Rp2.500.000",
    status: "done",
    priority: "Normal",
    description: "Pengecekan rutin bulanan jaringan data dan NVR CCTV.",
    location: "Jl. AP Pettarani, Makassar",
  },
  {
    id: "job-011",
    number: "JOB-011",
    title: "Bongkar pasang AC Split Wall",
    customerId: "customer-1",
    customer: "PT Sinar Jaya",
    technicianId: "tech-1",
    technician: "Ardiansyah",
    type: "AC",
    schedule: "Lusa · 10:00 WIB",
    price: "Rp450.000",
    status: "paid",
    priority: "Normal",
    description: "Pemindahan unit outdoor ke lantai atas karena renovasi bangunan lama.",
    location: "Jl. Urip Sumoharjo, Makassar",
  },
];

export const invoices: Invoice[] = [
  { id: "invoice-1", number: "INV-2026-015", customer: "Bank BCA KCP Pettarani", job: "JOB-015", total: "Rp3.200.000", status: "Draft", dueDate: "30 Hari" },
  { id: "invoice-2", number: "INV-2026-012", customer: "Bank BCA KCP Pettarani", job: "JOB-012", total: "Rp2.500.000", status: "Sent", dueDate: "Termin 14 Hari" },
  { id: "invoice-3", number: "INV-2026-011", customer: "PT Sinar Jaya", job: "JOB-011", total: "Rp450.000", status: "Paid", dueDate: "Lunas" },
  { id: "invoice-4", number: "INV-2026-010", customer: "Laundry Bersih Wangi", job: "JOB-010", total: "Rp1.400.000", status: "Overdue", dueDate: "5 Hari Lewat" },
];

export const inventory: InventoryItem[] = [
  { id: "item-1", name: "Kabel UTP Belden Cat6", sku: "BLD-C6", category: "Kabel & Jaringan", stock: 2, minStock: 5, buyPrice: "Rp1.800.000/roll", sellPrice: "Rp15.000/m", status: "Rendah" },
  { id: "item-2", name: "Modul PCB Mesin Cuci LG", sku: "LG-PCB-15", category: "Sparepart", stock: 0, minStock: 2, buyPrice: "Rp400.000", sellPrice: "Rp750.000", status: "Habis" },
  { id: "item-3", name: "Freon R32 3kg Tabung", sku: "FR-R32-3", category: "Consumable", stock: 4, minStock: 3, buyPrice: "Rp340.000", sellPrice: "Rp450.000", status: "Aman" },
  { id: "item-4", name: "MCB Schneider 1 Phase 10A", sku: "SCH-1P10", category: "Kelistrikan", stock: 24, minStock: 10, buyPrice: "Rp45.000", sellPrice: "Rp75.000", status: "Aman" },
];

export const contracts: Contract[] = [
  { id: "contract-1", customer: "PT Sinar Jaya", plan: "AC Bulanan · 10 unit", value: "Rp4.800.000", nextService: "Bulan Depan", status: "Aktif" },
  { id: "contract-2", customer: "Bank BCA KCP Pettarani", plan: "IT & CCTV Kuartalan", value: "Rp6.000.000", nextService: "Minggu Depan", status: "Hampir Jatuh Tempo" },
  { id: "contract-3", customer: "Hotel Marannu", plan: "Genset & Chiller Tahunan", value: "Rp45.000.000", nextService: "Kadaluarsa", status: "Expired" },
];

export const settings = {
  businessName: business.name,
  whatsapp: "0812 4567 8890",
  address: "Jl. Veteran No. 18, Makassar Selatan, Sulawesi Selatan",
};

export const appNav = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/jobs", label: "Pesanan Kerja" },
  { to: "/technicians", label: "Teknisi" },
  { to: "/customers", label: "Pelanggan" },
  { to: "/invoices", label: "Tagihan" },
  { to: "/inventory", label: "Stok Suku Cadang" },
  { to: "/contracts", label: "Kontrak" },
  { to: "/settings", label: "Pengaturan" },
];

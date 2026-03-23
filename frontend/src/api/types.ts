export interface SessionPayload {
  session: {
    id: string;
    userId: string;
    expiresAt: string;
    createdAt: string;
    updatedAt: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
    role?: string | null;
    businessId?: string | null;
    phone?: string | null;
  };
}

export interface Business {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  serviceType: string;
  plan: string;
  subscriptionStatus?:
    | "pending_payment"
    | "paid"
    | "active"
    | "trialing"
    | "past_due"
    | "paused"
    | "cancelled";
  subscriptionStatusLabel?: string;
  trialEndsAt?: string | null;
  currentPeriodEndsAt?: string | null;
  subscriptionNotes?: string | null;
  entitlements?: {
    key: "Starter" | "Pro" | "Bisnis";
    label: string;
    maxTechnicians: number;
    maxMonthlyJobs: number;
    inventoryEnabled: boolean;
    contractsEnabled: boolean;
    multiTechnicianEnabled: boolean;
    advancedDashboardEnabled: boolean;
    adminReviewPriority: "standard" | "priority";
    highlights: string[];
  };
  availablePlans?: Array<Business["entitlements"]>;
  owner?: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  };
}

export interface DashboardStatPayload {
  todayJobs: number;
  activeJobs: number;
  doneToday: number;
  activeTechnicians: number;
  totalCustomers: number;
  activeContracts: number;
  monthlyRevenue: number;
  monthlyRevenueLabel: string;
  lowStockCount: number;
  lowStockItems: Array<{ id: string; name: string; stock: number; minStock: number }>;
  recentJobs: Array<{
    id: string;
    number: string;
    title: string;
    schedule: string;
    status: string;
    price: string;
  }>;
  revenueBars: Array<{ label: string; value: number; valueLabel: string }>;
  statusBreakdown: Array<{ label: string; value: number }>;
  opsQueues: Array<{
    id: string;
    label: string;
    count: number;
    description: string;
    href: string;
    tone: "success" | "warning" | "info" | "neutral" | "danger";
    amountLabel?: string;
  }>;
  dispatchToday: Array<{
    id: string;
    number: string;
    title: string;
    customer: string;
    technicians: string[];
    schedule: string;
    location: string;
    status: string;
    priority: "Normal" | "Urgent";
  }>;
  business: Business | null;
}

export interface JobListItem {
  id: string;
  number: string;
  title: string;
  customerId: string;
  customer: string;
  technicianId: string;
  technicianIds: string[];
  technician: string;
  technicians: string[];
  type: string;
  schedule: string;
  price: string;
  status: string;
  priority: "Normal" | "Urgent";
  description: string;
  location: string;
  createdAt?: string;
  updatedAt?: string;
  completedAt?: string | null;
  cancelReason?: string | null;
}

export interface JobDetail extends JobListItem {
  beforePhotoUrl?: string | null;
  afterPhotoUrl?: string | null;
  items: Array<{
    id: string;
    inventoryId?: string | null;
    name: string;
    kind: "service" | "sparepart";
    quantity: number;
    unitPrice: number;
    totalPrice: number;
    unitPriceLabel: string;
    totalPriceLabel: string;
    note?: string | null;
  }>;
  invoice: {
    id: string;
    number: string;
    status: string;
    totalLabel: string;
    dueDateLabel: string;
  } | null;
}

export interface Technician {
  id: string;
  name: string;
  phone: string;
  specialties: string[];
  status: "Aktif" | "Bertugas" | "Standby" | "Tidak Aktif";
  rating: number;
  jobsCompleted: number;
  latitude?: number | null;
  longitude?: number | null;
  lastSeenAt?: string | null;
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
  health: "Aktif" | "Kontrak Aktif" | "Perlu Follow Up" | "Butuh Billing" | "Dormant";
  nextAction: string;
  openInvoices: number;
  balanceDue: string;
}

export interface CustomerDetail extends Omit<Customer, "contract"> {
  jobHistory: Array<{
    id: string;
    number: string;
    title: string;
    status: string;
    schedule: string;
    price: string;
  }>;
  contracts: Array<{
    id: string;
    plan: string;
    value: string;
    nextService: string;
    status: string;
  }>;
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
  buyPriceValue: number;
  buyPrice: string;
  sellPriceValue: number;
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

export interface ApiErrorPayload {
  error?: string;
  message?: string;
  details?: unknown;
  status?: number;
}

export interface AdminClientSubscription {
  id: string;
  name: string;
  slug: string;
  city: string;
  serviceType: string;
  plan: "Starter" | "Pro" | "Bisnis";
  subscriptionStatus:
    | "pending_payment"
    | "paid"
    | "active"
    | "trialing"
    | "past_due"
    | "paused"
    | "cancelled";
  subscriptionStatusLabel: string;
  trialEndsAt?: string | null;
  trialEndsAtLabel?: string;
  currentPeriodEndsAt?: string | null;
  currentPeriodEndsAtLabel?: string;
  subscriptionNotes: string;
  createdAtLabel: string;
  owner: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
  } | null;
  counts: {
    technicians: number;
    customers: number;
    inventoryItems: number;
    contracts: number;
    activeJobs: number;
  };
  planDetails: {
    plan: "Starter" | "Pro" | "Bisnis";
    subscriptionStatus:
      | "pending_payment"
      | "paid"
      | "active"
      | "trialing"
      | "past_due"
      | "paused"
      | "cancelled";
    subscriptionStatusLabel: string;
    entitlements: NonNullable<Business["entitlements"]>;
  };
}

export interface AdminResetPasswordResult {
  businessId: string;
  ownerEmail: string;
  temporaryPassword: string;
  message: string;
}

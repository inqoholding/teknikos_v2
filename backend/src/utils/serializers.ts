export function formatRupiahCompact(value: number) {
  const formatter = new Intl.NumberFormat("id-ID", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  });

  if (Math.abs(value) >= 1_000_000) {
    return `Rp${formatter.format(value / 1_000_000)}jt`;
  }

  if (Math.abs(value) >= 1_000) {
    return `Rp${formatter.format(value / 1_000)}rb`;
  }

  return `Rp${formatter.format(value)}`;
}

export function formatDateShort(value: Date | string | number | null | undefined) {
  if (!value) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Makassar",
  })
    .format(new Date(value))
    .replace(/\./g, "");
}

export function formatSchedule(value: Date | string | number) {
  const time = new Intl.DateTimeFormat("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Makassar",
  })
    .format(new Date(value))
    .replace(".", ":");

  return `${formatDateShort(value)} · ${time} WITA`;
}

export function inventoryStatus(stock: number, minStock: number) {
  if (stock <= 0) return "Habis";
  if (stock <= minStock) return "Rendah";
  return "Aman";
}

export function contractStatus(nextServiceAt: Date | string | number, currentStatus?: string | null) {
  if (currentStatus === "Expired") return "Expired";
  const now = Date.now();
  const target = new Date(nextServiceAt).getTime();
  if (target < now) return "Expired";
  if (target - now <= 7 * 24 * 60 * 60 * 1000) return "Hampir Jatuh Tempo";
  return "Aktif";
}

export function invoiceStatus(status: string, dueDate: Date | string | number, paidAt?: Date | string | number | null) {
  if (status === "Paid" || paidAt) return "Paid";
  if (status === "Draft" || status === "Sent") {
    return new Date(dueDate).getTime() < Date.now() && status !== "Draft" ? "Overdue" : status;
  }
  return status;
}

export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

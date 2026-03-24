type MaybeText = string | null | undefined;

export const WAHA_TEST_MESSAGE = ".";

function normalizePhoneNumber(phone?: MaybeText) {
  if (!phone) return null;
  const digits = phone.replace(/[^\d]/g, "");
  if (!digits) return null;
  if (digits.startsWith("62")) return digits;
  if (digits.startsWith("0")) return `62${digits.slice(1)}`;
  if (digits.startsWith("8")) return `62${digits}`;
  return digits;
}

export function buildWhatsAppLink(phone: MaybeText, lines: string[]) {
  const normalized = normalizePhoneNumber(phone);
  if (!normalized) return null;
  return `https://wa.me/${normalized}?text=${encodeURIComponent(lines.join("\n"))}`;
}

export function buildInvoiceMessage(input: {
  businessName?: MaybeText;
  customerName: string;
  invoiceNumber: string;
  total: string;
  dueDate: string;
  status: string;
  jobLabel?: MaybeText;
}) {
  return [
    `Halo ${input.customerName},`,
    `Ini info invoice dari ${input.businessName ?? "TeknikOS"}.`,
    "",
    `Nomor invoice: ${input.invoiceNumber}`,
    `Pekerjaan: ${input.jobLabel ?? "-"}`,
    `Total tagihan: ${input.total}`,
    `Status: ${input.status}`,
    `Jatuh tempo: ${input.dueDate}`,
    "",
    "Silakan dibantu cek. Jika sudah transfer atau ada pertanyaan, boleh balas pesan ini ya.",
  ];
}

export function buildJobProgressMessage(input: {
  businessName?: MaybeText;
  customerName: string;
  jobNumber: string;
  jobTitle: string;
  status: string;
  schedule: string;
  location: string;
  technicians: string[];
}) {
  return [
    `Halo ${input.customerName},`,
    `Berikut update pekerjaan dari ${input.businessName ?? "TeknikOS"}.`,
    "",
    `Job: ${input.jobNumber} · ${input.jobTitle}`,
    `Status saat ini: ${input.status}`,
    `Jadwal: ${input.schedule}`,
    `Lokasi: ${input.location}`,
    `Teknisi: ${input.technicians.length > 0 ? input.technicians.join(", ") : "Sedang disiapkan"}`,
    "",
    "Jika ada perubahan akses lokasi atau kebutuhan tambahan, boleh balas pesan ini ya.",
  ];
}

export function buildTechnicianTaskMessage(input: {
  businessName?: MaybeText;
  technicianName: string;
  jobNumber: string;
  jobTitle: string;
  status: string;
  schedule: string;
  location: string;
  customerName: string;
}) {
  return [
    `Halo ${input.technicianName},`,
    `Reminder tugas dari ${input.businessName ?? "TeknikOS"}.`,
    "",
    `Job: ${input.jobNumber} · ${input.jobTitle}`,
    `Pelanggan: ${input.customerName}`,
    `Status target: ${input.status}`,
    `Jadwal: ${input.schedule}`,
    `Lokasi: ${input.location}`,
    "",
    "Mohon cek detail job di dashboard dan konfirmasi jika ada kendala di lapangan.",
  ];
}

export function buildCustomerFollowUpMessage(input: {
  businessName?: MaybeText;
  customerName: string;
  address?: MaybeText;
  lastService?: MaybeText;
  nextAction?: MaybeText;
}) {
  return [
    `Halo ${input.customerName},`,
    `Salam dari ${input.businessName ?? "TeknikOS"}.`,
    "",
    `Kami ingin follow up kebutuhan servis Anda${input.address ? ` di ${input.address}` : ""}.`,
    `Servis terakhir: ${input.lastService ?? "-"}`,
    `Tindak lanjut yang kami siapkan: ${input.nextAction ?? "Silakan balas pesan ini jika ingin dijadwalkan."}`,
    "",
    "Jika ingin kami jadwalkan kunjungan atau pengecekan unit, cukup balas pesan ini ya.",
  ];
}

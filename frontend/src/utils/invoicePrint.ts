import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import type { Business, Invoice, JobDetail } from "../api/types";

export type InvoicePrintInput = {
  business?: Business | null;
  invoice: Pick<Invoice, "number" | "customer" | "job" | "total" | "status" | "dueDate">;
  job?:
    | Pick<JobDetail, "number" | "title" | "location" | "schedule" | "items">
    | {
        number: string;
        title: string;
        location: string;
        schedule: string;
        items?: Array<{
          name: string;
          kind: "service" | "sparepart";
          quantity: number;
          unitPriceLabel: string;
          totalPriceLabel: string;
        }>;
      }
    | null;
};

function buildInvoiceDocument(input: InvoicePrintInput) {
  const { business, invoice, job } = input;
  const doc = new jsPDF({
    unit: "pt",
    format: "a4",
  });
  const pageWidth = doc.internal.pageSize.getWidth();
  const rightEdge = pageWidth - 40;

  doc.setFillColor(22, 91, 71);
  doc.roundedRect(32, 28, pageWidth - 64, 108, 18, 18, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(25);
  doc.setTextColor(255, 255, 255);
  doc.text(business?.name ?? "Coreveta", 48, 62);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`${business?.address ?? "-"}`, 48, 84);
  doc.text(`${business?.phone ?? "-"}  •  ${business?.email ?? "-"}`, 48, 100);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("INVOICE", rightEdge, 58, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Nomor: ${invoice.number}`, rightEdge, 80, { align: "right" });
  doc.text(`Status: ${invoice.status}`, rightEdge, 96, { align: "right" });
  doc.text(`Jatuh tempo: ${invoice.dueDate}`, rightEdge, 112, { align: "right" });

  doc.setDrawColor(222, 229, 226);
  doc.setFillColor(249, 250, 248);
  doc.roundedRect(40, 156, 244, 104, 14, 14, "FD");
  doc.roundedRect(300, 156, 255, 104, 14, 14, "FD");

  doc.setFont("helvetica", "bold");
  doc.setTextColor(22, 91, 71);
  doc.text("Tagihan Untuk", 54, 178);
  doc.text("Ringkasan Job", 314, 178);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(75, 85, 99);
  doc.text(doc.splitTextToSize(invoice.customer, 210), 54, 198);
  doc.text(doc.splitTextToSize(job?.location ?? "-", 210), 54, 230);
  doc.text(doc.splitTextToSize(`${job?.number ?? invoice.job}`, 210), 314, 198);
  doc.text(doc.splitTextToSize(`${job?.title ?? "-"}`, 210), 314, 214);
  doc.text(doc.splitTextToSize(`${job?.schedule ?? "-"}`, 210), 314, 246);

  const rows =
    job?.items?.length
      ? job.items.map((item) => [
          item.name,
          item.kind === "service" ? "Jasa" : "Sparepart",
          String(item.quantity),
          item.unitPriceLabel,
          item.totalPriceLabel,
        ])
      : [[job?.title ?? invoice.job, "Jasa", "1", invoice.total, invoice.total]];

  autoTable(doc, {
    startY: 286,
    head: [["Item", "Tipe", "Qty", "Harga", "Total"]],
    body: rows,
    theme: "striped",
    headStyles: {
      fillColor: [22, 91, 71],
      halign: "left",
      valign: "middle",
      fontSize: 10,
      cellPadding: 10,
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    styles: {
      fontSize: 10.5,
      cellPadding: 10,
      textColor: [31, 41, 55],
      lineColor: [226, 232, 240],
      lineWidth: 0.6,
    },
    alternateRowStyles: {
      fillColor: [247, 250, 248],
    },
  });

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 420;
  doc.setFillColor(241, 247, 244);
  doc.roundedRect(334, finalY + 20, 210, 96, 14, 14, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(75, 85, 99);
  doc.text("Subtotal", 352, finalY + 48);
  doc.text(invoice.total, 526, finalY + 48, { align: "right" });
  doc.text("PPN", 352, finalY + 68);
  doc.text("Rp0", 526, finalY + 68, { align: "right" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(22, 91, 71);
  doc.text("Total Tagihan", 352, finalY + 98);
  doc.text(invoice.total, 526, finalY + 98, { align: "right" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(107, 114, 128);
  doc.text("Invoice dibuat dari Coreveta. Pembayaran invoice dipisahkan dari status operasional job.", 40, 780);

  return doc;
}

export function buildInvoicePdfFileName(invoiceNumber: string) {
  return `${invoiceNumber}.pdf`;
}

export function downloadInvoicePdf(input: InvoicePrintInput) {
  const doc = buildInvoiceDocument(input);
  const blob = doc.output("blob");
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = buildInvoicePdfFileName(input.invoice.number);
  anchor.rel = "noopener";
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 4000);
}

export function openInvoicePdfPreview(input: InvoicePrintInput) {
  const doc = buildInvoiceDocument(input);
  const url = URL.createObjectURL(doc.output("blob"));
  window.open(url, "_blank", "noopener,noreferrer");
  window.setTimeout(() => URL.revokeObjectURL(url), 15000);
}

export function printInvoice(input: InvoicePrintInput) {
  downloadInvoicePdf(input);
}

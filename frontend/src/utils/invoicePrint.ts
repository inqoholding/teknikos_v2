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

  // Header Background Rect
  doc.setFillColor(15, 23, 42); // #0F172A (Slate 900)
  doc.rect(0, 0, pageWidth, 120, "F");

  // Accent Line
  doc.setFillColor(79, 70, 229); // #4F46E5 (Indigo)
  doc.rect(0, 115, pageWidth, 5, "F");

  // Header Left (Logo & Info)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.setTextColor(255, 255, 255); 
  doc.text(business?.name?.toUpperCase() ?? "COREVETA", 40, 50);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(`${business?.address ?? "-"}`, 40, 72);
  doc.text(`${business?.phone ?? "-"}  •  ${business?.email ?? "-"}`, 40, 88);

  // Header Right (Title & No)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(40);
  doc.setTextColor(255, 255, 255); 
  doc.text("INVOICE", rightEdge, 55, { align: "right" });
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(148, 163, 184); // Slate 400
  doc.text(`#${invoice.number}`, rightEdge, 78, { align: "right" });

  // DETAILS ROW
  const detailsY = 170;

  // Bill To (Left)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139); // Slate 500
  doc.text("DITAGIHKAN KEPADA", 40, detailsY);
  
  doc.setFontSize(16);
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.text(doc.splitTextToSize(invoice.customer, 250), 40, detailsY + 20);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text(doc.splitTextToSize(job?.location ?? "-", 250), 40, detailsY + 40);

  // Meta Box (Right)
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.roundedRect(rightEdge - 280, detailsY - 15, 280, 80, 6, 6, "FD");

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("TANGGAL TERBIT", rightEdge - 260, detailsY);
  doc.text("JATUH TEMPO", rightEdge - 120, detailsY);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text(invoice.dueDate, rightEdge - 260, detailsY + 16);
  doc.text(invoice.dueDate, rightEdge - 120, detailsY + 16);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("ID PEKERJAAN", rightEdge - 260, detailsY + 40);
  doc.text("TEKNISI", rightEdge - 120, detailsY + 40);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(`${job?.number ?? invoice.job}`, rightEdge - 260, detailsY + 56);
  doc.text("Berbasis Tim", rightEdge - 120, detailsY + 56);

  // TABLE
  const rows =
    job?.items?.length
      ? job.items.map((item) => [
          item.name,
          String(item.quantity),
          item.unitPriceLabel,
          item.totalPriceLabel,
        ])
      : [[job?.title ?? invoice.job, "1", invoice.total, invoice.total]];

  autoTable(doc, {
    startY: 280,
    head: [["Deskripsi Layanan & Barang", "Qty", "Harga Satuan", "Total"]],
    body: rows,
    theme: "plain",
    headStyles: {
      fillColor: [248, 250, 252], // Slate 50
      textColor: [100, 116, 139], // Slate 500
      fontStyle: "bold",
      fontSize: 10,
      cellPadding: { top: 12, right: 16, bottom: 12, left: 16 },
    },
    styles: {
      fontSize: 11,
      cellPadding: { top: 14, right: 16, bottom: 14, left: 16 },
      textColor: [15, 23, 42], // Slate 900
      fontStyle: "normal",
      lineColor: [226, 232, 240], // Slate 200
      lineWidth: { bottom: 1 },
    },
    columnStyles: {
      1: { halign: "center", cellWidth: 50 },
      2: { halign: "right", cellWidth: 100 },
      3: { halign: "right", fontStyle: "bold", cellWidth: 100 },
    },
  });

  const finalY = (doc as jsPDF & { lastAutoTable?: { finalY?: number } }).lastAutoTable?.finalY ?? 400;

  // TOTALS
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(rightEdge - 250, finalY + 30, 250, 80, 8, 8, "FD");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.setTextColor(51, 65, 85);
  doc.text("Subtotal", rightEdge - 230, finalY + 55, { align: "left" });
  doc.text(invoice.total, rightEdge - 20, finalY + 55, { align: "right" });

  doc.setLineWidth(1.5);
  doc.setDrawColor(15, 23, 42);
  doc.line(rightEdge - 230, finalY + 70, rightEdge - 20, finalY + 70);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(79, 70, 229); // #4F46E5
  doc.text("Total Tagihan", rightEdge - 230, finalY + 95);
  doc.text(invoice.total, rightEdge - 20, finalY + 95, { align: "right" });

  // FOOTER Notes
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.setTextColor(26, 26, 24);
  doc.text("Catatan & Garansi", 40, finalY + 30);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 90, 86);
  doc.text(doc.splitTextToSize("• Garansi sparepart & perbaikan berlaku 30 hari sejak tanggal invoice.\n• Jadwal servis rutin selanjutnya akan kami ingatkan kembali secara otomatis.\n\nTerima kasih atas kepercayaannya!", 250), 40, finalY + 45);

  // Status Box
  const statusColors = invoice.status === "Paid" ? [225, 245, 238] : [250, 238, 218];
  const statusBorder = invoice.status === "Paid" ? [29, 158, 117] : [239, 159, 39];
  const statusTextC = invoice.status === "Paid" ? [15, 110, 86] : [124, 74, 3];
  
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(154, 154, 148);
  doc.text("STATUS", rightEdge, finalY + 110, { align: "right" });

  doc.setFillColor(statusColors[0], statusColors[1], statusColors[2]);
  doc.setDrawColor(statusBorder[0], statusBorder[1], statusBorder[2]);
  doc.setLineWidth(1);
  doc.roundedRect(rightEdge - 100, finalY + 118, 100, 24, 4, 4, "FD");
  
  doc.setTextColor(statusTextC[0], statusTextC[1], statusTextC[2]);
  doc.setFontSize(11);
  doc.text(invoice.status === "Paid" ? "LUNAS (Paid)" : invoice.status.toUpperCase(), rightEdge - 50, finalY + 134, { align: "center", baseline: "middle" });

  // Watermark
  doc.setDrawColor(229, 229, 229);
  doc.setLineDashPattern([3, 3], 0);
  doc.line(40, finalY + 160, rightEdge, finalY + 160);
  doc.setLineDashPattern([], 0);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(154, 154, 148);
  doc.text("Dibuat otomatis oleh Sistem Coreveta", rightEdge, finalY + 183, { align: "right" });
  doc.text("coreveta.com", rightEdge, finalY + 195, { align: "right" });

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

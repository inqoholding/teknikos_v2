import { FormEvent, useState } from "react";
import { getErrorMessage } from "../api/client";
import {
  useBusinessQuery,
  useCreateInvoiceMutation,
  useCustomersQuery,
  useInvoicesQuery,
  useJobsQuery,
  useUpdateInvoiceMutation,
} from "../api/hooks";
import type { Business, Customer, Invoice, JobListItem } from "../api/types";
import { PageError, PageLoader } from "../components/PageState";
import { Badge, EmptyAction, SectionCard } from "../components/UI";
import { printInvoice } from "../utils/invoicePrint";
import { buildInvoiceMessage, buildWhatsAppLink } from "../utils/whatsapp";

function defaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  date.setHours(17, 0, 0, 0);
  return date.toISOString().slice(0, 16);
}

export default function InvoicesPage() {
  const [status, setStatus] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [jobId, setJobId] = useState("");
  const [total, setTotal] = useState("0");
  const [invoiceStatus, setInvoiceStatus] = useState<"Draft" | "Sent" | "Paid">("Draft");
  const [dueDate, setDueDate] = useState(defaultDueDate);
  const invoicesQuery = useInvoicesQuery(status ? { status } : undefined);
  const customersQuery = useCustomersQuery();
  const jobsQuery = useJobsQuery();
  const businessQuery = useBusinessQuery();
  const createInvoiceMutation = useCreateInvoiceMutation();

  if (invoicesQuery.isLoading) {
    return <PageLoader title="Memuat invoice..." />;
  }

  if (invoicesQuery.error || !invoicesQuery.data) {
    return <PageError message={getErrorMessage(invoicesQuery.error)} />;
  }

  const invoices = invoicesQuery.data;
  const customers = customersQuery.data ?? [];
  const jobs = jobsQuery.data ?? [];
  const selectedJob = jobs.find((item) => item.id === jobId);

  async function handleCreateInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const resolvedCustomerId = customerId || selectedJob?.customerId || "";
    await createInvoiceMutation.mutateAsync({
      customerId: resolvedCustomerId,
      jobId: jobId || null,
      total: Number(total),
      status: invoiceStatus,
      dueDate,
      paidAmount: invoiceStatus === "Paid" ? Number(total) : 0,
      paidAt: invoiceStatus === "Paid" ? new Date().toISOString() : null,
    });
    setCustomerId("");
    setJobId("");
    setTotal("0");
    setInvoiceStatus("Draft");
    setDueDate(defaultDueDate());
    setShowCreate(false);
  }

  return (
    <div className="page-stack">
      <div className="toolbar">
        <select className="field-like" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Status: semua</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Paid">Paid</option>
        </select>
        <input className="toolbar__search" placeholder="Invoice, pelanggan, dan aksi PDF" readOnly />
        <div className="toolbar__actions">
          <EmptyAction primary onClick={() => setShowCreate((current) => !current)}>
            {showCreate ? "Tutup Form" : "Buat Invoice"}
          </EmptyAction>
        </div>
      </div>

      {showCreate ? (
        <SectionCard title="Invoice Manual" description="Bisa dibuat dari job atau langsung untuk pelanggan.">
          <form className="action-stack" onSubmit={handleCreateInvoice}>
            <div className="field-grid">
              <label className="field">
                <span>Job terkait</span>
                <select
                  value={jobId}
                  onChange={(event) => {
                    const nextJobId = event.target.value;
                    setJobId(nextJobId);
                    const nextJob = jobs.find((item) => item.id === nextJobId);
                    if (nextJob) {
                      setCustomerId(nextJob.customerId);
                      setTotal(nextJob.price.replace(/[^\d]/g, ""));
                    }
                  }}
                >
                  <option value="">Tanpa job</option>
                  {jobs.map((job) => (
                    <option key={job.id} value={job.id}>
                      {job.number} · {job.title}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Pelanggan</span>
                <select value={customerId} onChange={(event) => setCustomerId(event.target.value)} required>
                  <option value="">Pilih pelanggan</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.name}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>Total</span>
                <input type="number" min="0" value={total} onChange={(event) => setTotal(event.target.value)} required />
              </label>
              <label className="field">
                <span>Status</span>
                <select value={invoiceStatus} onChange={(event) => setInvoiceStatus(event.target.value as "Draft" | "Sent" | "Paid")}>
                  <option value="Draft">Draft</option>
                  <option value="Sent">Sent</option>
                  <option value="Paid">Paid</option>
                </select>
              </label>
            </div>
            <label className="field">
              <span>Jatuh tempo</span>
              <input type="datetime-local" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required />
            </label>
            {selectedJob ? <p className="form-helper">Invoice akan terhubung ke {selectedJob.number} milik {selectedJob.customer}.</p> : null}
            {createInvoiceMutation.error ? <p className="form-error">{getErrorMessage(createInvoiceMutation.error)}</p> : null}
            <div className="button-row button-row--left">
              <EmptyAction onClick={() => setShowCreate(false)}>Batal</EmptyAction>
              <EmptyAction primary type="submit" disabled={createInvoiceMutation.isPending || !customerId}>
                {createInvoiceMutation.isPending ? "Menyimpan..." : "Simpan Invoice"}
              </EmptyAction>
            </div>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard title="Daftar Invoice">
        <div className="table-card">
          <div className="data-table data-table--head">
            <span>Invoice#</span>
            <span>Pelanggan</span>
            <span>Job</span>
            <span>Total</span>
            <span>Status</span>
            <span>Jatuh Tempo</span>
            <span>Aksi</span>
          </div>
          {invoices.map((invoice) => (
            <InvoiceRow
              key={invoice.id}
              invoice={invoice}
              business={businessQuery.data}
              customer={customers.find((item) => item.name === invoice.customer) ?? null}
              job={jobs.find((item) => item.number === invoice.job) ?? null}
            />
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

function InvoiceRow({
  invoice,
  business,
  customer,
  job,
}: {
  invoice: Invoice;
  business?: Business | null;
  customer?: Customer | null;
  job?: JobListItem | null;
}) {
  const updateInvoiceMutation = useUpdateInvoiceMutation(invoice.id);
  const invoiceWhatsappLink = buildWhatsAppLink(
    customer?.phone,
    buildInvoiceMessage({
      businessName: business?.name,
      customerName: invoice.customer,
      invoiceNumber: invoice.number,
      total: invoice.total,
      dueDate: invoice.dueDate,
      status: invoice.status,
      jobLabel: job?.title ?? invoice.job,
    }),
  );

  async function handleMarkPaid() {
    await updateInvoiceMutation.mutateAsync({
      status: "Paid",
      paidAt: new Date().toISOString(),
      paidAmount: Number(invoice.total.replace(/[^\d]/g, "")),
    });
  }

  function handlePrint() {
    printInvoice({
      business,
      invoice,
      job: job
        ? {
            number: job.number,
            title: job.title,
            location: job.location,
            schedule: job.schedule,
            items: [],
          }
        : null,
    });
  }

  return (
    <div className="data-table">
      <span className="mono">{invoice.number}</span>
      <span>{invoice.customer}</span>
      <span>{invoice.job}</span>
      <span>{invoice.total}</span>
      <span>
        <Badge
          tone={
            invoice.status === "Paid"
              ? "success"
              : invoice.status === "Overdue"
                ? "danger"
                : invoice.status === "Sent"
                  ? "info"
                  : "neutral"
          }
        >
          {invoice.status}
        </Badge>
      </span>
      <span>{invoice.dueDate}</span>
      <span className="row-actions">
        {invoice.status === "Paid" ? (
          <span>Lunas</span>
        ) : (
          <button className="ghost-button" type="button" onClick={() => void handleMarkPaid()} disabled={updateInvoiceMutation.isPending}>
            {updateInvoiceMutation.isPending ? "..." : "Tandai Lunas"}
          </button>
        )}
        <button className="ghost-button" type="button" onClick={handlePrint}>
          PDF
        </button>
        {invoiceWhatsappLink ? (
          <a className="ghost-button" href={invoiceWhatsappLink} target="_blank" rel="noreferrer">
            Kirim WA
          </a>
        ) : null}
      </span>
    </div>
  );
}

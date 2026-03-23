import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import {
  useCreateInvoiceMutation,
  useCustomersQuery,
  useDashboardStatsQuery,
  useJobsQuery,
} from "../api/hooks";
import { PageError, PageLoader } from "../components/PageState";
import { Badge, DonutSummary, EmptyAction, MiniBarChart, SectionCard, StatCard } from "../components/UI";

function defaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  date.setHours(17, 0, 0, 0);
  return date.toISOString().slice(0, 16);
}

export default function DashboardPage() {
  const dashboardQuery = useDashboardStatsQuery();
  const customersQuery = useCustomersQuery();
  const jobsQuery = useJobsQuery();
  const createInvoiceMutation = useCreateInvoiceMutation();
  const [customerId, setCustomerId] = useState("");
  const [jobId, setJobId] = useState("");
  const [serviceLabel, setServiceLabel] = useState("Instalasi AC");
  const [installationFee, setInstallationFee] = useState("0");
  const [sparepartFee, setSparepartFee] = useState("0");
  const [invoiceStatus, setInvoiceStatus] = useState<"Draft" | "Sent" | "Paid">("Sent");
  const [dueDate, setDueDate] = useState(defaultDueDate);

  if (dashboardQuery.isLoading) {
    return <PageLoader title="Memuat dashboard..." />;
  }

  if (dashboardQuery.error || !dashboardQuery.data) {
    return <PageError message={getErrorMessage(dashboardQuery.error)} />;
  }

  const stats = dashboardQuery.data;
  const customers = customersQuery.data ?? [];
  const jobs = jobsQuery.data ?? [];
  const selectedJob = jobs.find((job) => job.id === jobId);
  const totalInvoice = Number(installationFee || 0) + Number(sparepartFee || 0);

  const dashboardStats = [
    { label: "Job Hari Ini", value: String(stats.todayJobs), hint: `${stats.doneToday} selesai hari ini`, tone: "success" as const },
    { label: "Job Aktif", value: String(stats.activeJobs), hint: `${stats.lowStockCount} stok perlu dicek`, tone: "warning" as const },
    { label: "Teknisi Aktif", value: String(stats.activeTechnicians), hint: `${stats.totalCustomers} pelanggan aktif`, tone: "default" as const },
    { label: "Revenue Bulan Ini", value: stats.monthlyRevenueLabel, hint: `${stats.activeContracts} kontrak aktif`, tone: "success" as const },
  ];

  async function handleQuickInvoice(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const resolvedCustomerId = customerId || selectedJob?.customerId || "";
    await createInvoiceMutation.mutateAsync({
      customerId: resolvedCustomerId,
      jobId: jobId || null,
      total: totalInvoice,
      status: invoiceStatus,
      dueDate,
      paidAmount: invoiceStatus === "Paid" ? totalInvoice : 0,
      paidAt: invoiceStatus === "Paid" ? new Date().toISOString() : null,
    });
    setCustomerId("");
    setJobId("");
    setServiceLabel("Instalasi AC");
    setInstallationFee("0");
    setSparepartFee("0");
    setInvoiceStatus("Sent");
    setDueDate(defaultDueDate());
  }

  return (
    <div className="page-stack">
      <div className="stats-grid">
        {dashboardStats.map((item) => (
          <StatCard
            key={item.label}
            label={item.label}
            value={item.value}
            hint={item.hint}
            tone={item.tone}
          />
        ))}
      </div>

      <div className="dashboard-grid">
        <SectionCard
          title="Operations Cockpit"
          description="Pola yang umum di aplikasi field service besar: owner langsung melihat queue dispatch, billing, dan follow-up dari satu layar."
          className="ops-card"
        >
          <div className="ops-grid">
            {stats.opsQueues.map((queue) => (
              <Link key={queue.id} to={queue.href} className={`ops-queue-card ops-queue-card--${queue.tone}`}>
                <div className="ops-queue-card__count">{queue.count}</div>
                <strong>{queue.label}</strong>
                <p>{queue.description}</p>
                {queue.amountLabel ? <span>{queue.amountLabel}</span> : <span>Lihat detail</span>}
              </Link>
            ))}
          </div>
        </SectionCard>

        <SectionCard
          title="Dispatch Hari Ini"
          description="Ringkas, cepat dibaca, dan fokus ke siapa pergi ke mana. Ini mengikuti pola dispatch board yang umum di ServiceTitan, Jobber, dan Housecall Pro."
        >
          <div className="dispatch-list">
            {stats.dispatchToday.length > 0 ? (
              stats.dispatchToday.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`} className="dispatch-item">
                  <div className="dispatch-item__time">
                    <strong>{job.schedule.split("·")[1]?.trim() ?? job.schedule}</strong>
                    <span>{job.number}</span>
                  </div>
                  <div className="dispatch-item__body">
                    <strong>{job.title}</strong>
                    <p>{job.customer} · {job.location}</p>
                    <small>{job.technicians.length > 0 ? job.technicians.join(", ") : "Belum ada teknisi"}</small>
                  </div>
                  <div className="dispatch-item__status">
                    <Badge tone={job.priority === "Urgent" ? "danger" : job.status === "done" ? "success" : job.status === "pending" ? "warning" : "info"}>
                      {job.priority === "Urgent" ? `Urgent · ${job.status.replaceAll("_", " ")}` : job.status.replaceAll("_", " ")}
                    </Badge>
                  </div>
                </Link>
              ))
            ) : (
              <p className="chart-helper">Belum ada job terjadwal hari ini.</p>
            )}
          </div>
        </SectionCard>
      </div>

      <div className="dashboard-grid">
        <SectionCard
          title="Revenue 7 Hari"
          description="Puncak pemasukan muncul saat jadwal maintenance area kantor."
        >
          <MiniBarChart items={stats.revenueBars} />
        </SectionCard>

        <SectionCard
          title="Status Job"
          description="Distribusi pekerjaan aktif saat ini."
        >
          <DonutSummary items={stats.statusBreakdown} />
        </SectionCard>
      </div>

      <div className="callout callout--success">
        <div>
          <strong>Plan aktif: {stats.business?.plan ?? "Starter"}</strong>
          <p>
            Bisnis {stats.business?.name ?? "TeknikOS"} saat ini memakai paket {stats.business?.plan ?? "Starter"}.
          </p>
        </div>
        <Link to="/settings">Kelola Paket →</Link>
      </div>

      <div className="dashboard-grid">
        <SectionCard
          title="Quick Billing"
          description="Alur ringkas yang lebih logis: pilih pelanggan atau job, isi biaya jasa instalasi, tambah komponen sparepart, lalu kirim invoice."
        >
          <form className="action-stack" onSubmit={handleQuickInvoice}>
            <div className="field-grid">
              <label className="field">
                <span>Job terkait</span>
                <select
                  value={jobId}
                  onChange={(event) => {
                    const nextJobId = event.target.value;
                    setJobId(nextJobId);
                    const nextJob = jobs.find((job) => job.id === nextJobId);
                    if (nextJob) {
                      setCustomerId(nextJob.customerId);
                      setServiceLabel(nextJob.title);
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
                <span>Nama jasa / instalasi</span>
                <input value={serviceLabel} onChange={(event) => setServiceLabel(event.target.value)} required />
              </label>
              <label className="field">
                <span>Biaya instalasi / jasa</span>
                <input type="number" min="0" value={installationFee} onChange={(event) => setInstallationFee(event.target.value)} required />
              </label>
            </div>

            <div className="field-grid">
              <label className="field">
                <span>Biaya sparepart</span>
                <input type="number" min="0" value={sparepartFee} onChange={(event) => setSparepartFee(event.target.value)} />
              </label>
              <label className="field">
                <span>Status invoice</span>
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

            <div className="summary-list">
              <div><span>Biaya jasa</span><strong>Rp{Number(installationFee || 0).toLocaleString("id-ID")}</strong></div>
              <div><span>Biaya sparepart</span><strong>Rp{Number(sparepartFee || 0).toLocaleString("id-ID")}</strong></div>
              <div><span>Total invoice</span><strong>Rp{totalInvoice.toLocaleString("id-ID")}</strong></div>
            </div>

            {selectedJob ? (
              <p className="form-helper">
                Job terhubung: {selectedJob.number} · {selectedJob.customer}. Jika sparepart dipakai dari service, stok tetap dikelola dari halaman detail job.
              </p>
            ) : null}
            {createInvoiceMutation.error ? <p className="form-error">{getErrorMessage(createInvoiceMutation.error)}</p> : null}

            <div className="button-row button-row--left">
              <EmptyAction primary type="submit" disabled={createInvoiceMutation.isPending || totalInvoice <= 0}>
                {createInvoiceMutation.isPending ? "Membuat..." : "Buat Invoice Dari Dashboard"}
              </EmptyAction>
              <Link to="/invoices" className="btn btn--secondary">Lihat Semua Invoice</Link>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Playbook Operasional" description="Pattern yang paling sering dipakai aplikasi sejenis untuk menjaga dispatch, CRM, dan billing tetap rapi.">
          <div className="stack-list">
            <div className="stack-list__item">
              <strong>1. Dispatch dulu, billing belakangan</strong>
              <p>Pastikan job punya teknisi dan slot waktu jelas. Pembayaran invoice tetap dipisahkan dari progres kerja lapangan.</p>
            </div>
            <div className="stack-list__item">
              <strong>2. Billing pakai komponen yang jelas</strong>
              <p>Biaya instalasi/jasa masuk sebagai komponen utama, lalu sparepart sebagai komponen tambahan agar owner dan pelanggan sama-sama paham.</p>
            </div>
            <div className="stack-list__item">
              <strong>3. Follow up pelanggan dari dashboard</strong>
              <p>Queue overdue invoice, kontrak mendekati due, dan pelanggan dormant sekarang terlihat dari cockpit agar owner tidak perlu menebak-nebak prioritas.</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Job Terbaru" action={<Link to="/jobs">Lihat Semua Job →</Link>}>
        <div className="table-card">
          <div className="data-table data-table--head">
            <span>#Job</span>
            <span>Pelanggan</span>
            <span>Teknisi</span>
            <span>Jenis</span>
            <span>Status</span>
            <span>Jadwal</span>
            <span className="align-right">Harga</span>
          </div>
          {stats.recentJobs.map((job) => (
            <div key={job.id} className="data-table">
              <span className="mono">{job.number}</span>
              <span>{job.title}</span>
              <span>-</span>
              <span>-</span>
              <span>
                <Badge tone={job.status === "pending" ? "warning" : job.status === "done" ? "success" : "info"}>
                  {job.status.replaceAll("_", " ")}
                </Badge>
              </span>
              <span>{job.schedule}</span>
              <span className="align-right">{job.price}</span>
            </div>
          ))}
        </div>
      </SectionCard>

      <div className="callout callout--warning">
        <div>
          <strong>{stats.lowStockCount} item stok hampir habis</strong>
          <p>
            {stats.lowStockItems.length > 0
              ? stats.lowStockItems.map((item) => item.name).join(" dan ")
              : "Tidak ada stok kritis saat ini."}
          </p>
        </div>
        <Link to="/inventory">Kelola Inventori →</Link>
      </div>
    </div>
  );
}

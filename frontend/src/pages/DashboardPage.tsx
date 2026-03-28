import { FormEvent, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import {
  useBusinessQuery,
  useCreateBusinessSupportRequestMutation,
  useCreateInvoiceMutation,
  useCustomersQuery,
  useDashboardStatsQuery,
  useJobsQuery,
  useSendBusinessWhatsappMutation,
  useTechniciansQuery,
} from "../api/hooks";
import { PageError, PageLoader } from "../components/PageState";
import { DeadlineList, ScheduleCalendar } from "../components/ScheduleCalendar";
import { Badge, DonutSummary, EmptyAction, MiniBarChart, SectionCard, StatCard, EmptyState } from "../components/UI";
import { formatRupiah } from "../utils/currency";
import { buildJobProgressMessage, buildTechnicianTaskMessage } from "../utils/whatsapp";

function defaultDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + 3);
  date.setHours(17, 0, 0, 0);
  return date.toISOString().slice(0, 16);
}

const jobStatusLabels: Record<string, string> = {
  pending: "Menunggu",
  assigned: "Ditugaskan",
  on_the_way: "Dalam Perjalanan",
  in_progress: "Dikerjakan",
  done: "Selesai",
  cancelled: "Dibatalkan",
  paid: "Lunas (Legacy)",
};

export default function DashboardPage() {
  const dashboardQuery = useDashboardStatsQuery();
  const businessQuery = useBusinessQuery();
  const supportRequestMutation = useCreateBusinessSupportRequestMutation();
  const customersQuery = useCustomersQuery();
  const techniciansQuery = useTechniciansQuery();
  const jobsQuery = useJobsQuery();
  const createInvoiceMutation = useCreateInvoiceMutation();
  const sendBusinessWhatsappMutation = useSendBusinessWhatsappMutation();
  const [customerId, setCustomerId] = useState("");
  const [jobId, setJobId] = useState("");
  const [wahaJobId, setWahaJobId] = useState("");
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
  const business = businessQuery.data;
  const customers = customersQuery.data ?? [];
  const technicians = techniciansQuery.data ?? [];
  const jobs = jobsQuery.data ?? [];
  const calendarItems = jobs.map((job) => ({
    id: job.id,
    title: `${job.number} · ${job.title}`,
    subtitle: `${job.customer} · ${job.technician}`,
    scheduleAt: job.scheduleAt,
    deadlineAt: job.deadlineAt ?? null,
    href: `/jobs/${job.id}`,
    status: job.status,
    priority: job.priority,
  }));
  const selectedJob = jobs.find((job) => job.id === jobId);
  const selectedWahaJob = jobs.find((job) => job.id === wahaJobId) ?? jobs[0];
  const selectedWahaCustomer = customers.find((customer) => customer.id === selectedWahaJob?.customerId);
  const selectedWahaTechnicians = technicians.filter((technician) =>
    selectedWahaJob?.technicianIds.includes(technician.id),
  );
  const totalInvoice = Number(installationFee || 0) + Number(sparepartFee || 0);
  const canUseWahaAutomation = business?.whatsapp?.canUseAutomation ?? false;

  async function handleSubscriptionRequest(type: "subscription_upgrade" | "subscription_renewal") {
    await supportRequestMutation.mutateAsync({
      type,
      targetPlan: type === "subscription_upgrade" ? "Bisnis" : undefined,
      message:
        type === "subscription_upgrade"
          ? "Owner meminta upgrade subscription dari dashboard."
          : "Owner meminta perpanjangan subscription dari dashboard.",
    });
  }

  const dashboardStats = [
    {
      label: "Tugas Hari Ini",
      value: String(stats.todayJobs),
      hint: `${stats.doneToday} selesai hari ini`,
      type: "success" as const,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
          <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
      ),
      trend: stats.todayJobs > 0 ? { value: "12%", up: true } : undefined
    },
    {
      label: "Tugas Aktif",
      value: String(stats.activeJobs),
      hint: `${stats.lowStockCount} stok perlu dicek`,
      type: "warning" as const,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
      ),
      trend: stats.activeJobs > 0 ? { value: "3%", up: false } : undefined
    },
    {
      label: "Teknisi Aktif",
      value: String(stats.activeTechnicians),
      hint: `${stats.totalCustomers} pelanggan aktif`,
      type: "info" as const,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
      trend: stats.activeTechnicians > 0 ? { value: "2", up: true } : undefined
    },
    {
      label: "Pendapatan Bulan Ini",
      value: stats.monthlyRevenueLabel,
      hint: `${stats.activeContracts} kontrak aktif`,
      type: "success" as const,
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="1" x2="12" y2="23" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
      trend: stats.activeContracts > 0 ? { value: "8%", up: true } : undefined
    },
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

  async function handleSendCustomerUpdate() {
    if (!selectedWahaJob || !selectedWahaCustomer?.phone) {
      return;
    }

    await sendBusinessWhatsappMutation.mutateAsync({
      phone: selectedWahaCustomer.phone,
      message: buildJobProgressMessage({
        businessName: business?.name,
        customerName: selectedWahaCustomer.name ?? selectedWahaJob.customer,
        jobNumber: selectedWahaJob.number,
        jobTitle: selectedWahaJob.title,
        status: jobStatusLabels[selectedWahaJob.status] ?? selectedWahaJob.status,
        schedule: selectedWahaJob.schedule,
        location: selectedWahaJob.location,
        technicians: selectedWahaTechnicians.map((item) => item.name),
      }).join("\n"),
    });
  }

  async function handleSendTechnicianUpdate(technicianId: string) {
    if (!selectedWahaJob) {
      return;
    }

    const technician = technicians.find((item) => item.id === technicianId);
    if (!technician?.phone) {
      return;
    }

    await sendBusinessWhatsappMutation.mutateAsync({
      phone: technician.phone,
      message: buildTechnicianTaskMessage({
        businessName: business?.name,
        technicianName: technician.name,
        jobNumber: selectedWahaJob.number,
        jobTitle: selectedWahaJob.title,
        status: jobStatusLabels[selectedWahaJob.status] ?? selectedWahaJob.status,
        schedule: selectedWahaJob.schedule,
        location: selectedWahaJob.location,
        customerName: selectedWahaCustomer?.name ?? selectedWahaJob.customer,
      }).join("\n"),
    });
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
            type={item.type}
            icon={item.icon}
            trend={item.trend}
          />
        ))}
      </div>

      <div className="dashboard-grid">
        <SectionCard
          title="Pusat Kendali"
          description="Pola yang umum di aplikasi field service besar: owner langsung melihat antrian penugasan, penagihan, dan follow-up dari satu layar."
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
          title="Penugasan Hari Ini"
          description="Ringkas, cepat dibaca, dan fokus ke siapa berangkat ke mana. Ini mengikuti pola dispatch board yang umum di industri jasa teknisi."
        >
          <div className="dispatch-list">
            {stats.dispatchToday.length > 0 ? (
              stats.dispatchToday.map((job) => (
                <Link key={job.id} to={`/jobs/${job.id}`} className={`dispatch-item ${job.status === "done" ? "dispatch-item--done" : ""}`}>
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
                    <Badge tone={job.status === "done" ? "neutral" : job.priority === "Urgent" ? "danger" : job.status === "pending" ? "warning" : "info"}>
                      {job.priority === "Urgent" && job.status !== "done" ? `Urgent · ${job.status.replaceAll("_", " ")}` : job.status.replaceAll("_", " ")}
                    </Badge>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState
                title="Belum ada dispatch hari ini"
                description="Buat job operasional pertama Anda dan assign teknisi untuk melihat jadwal kerjanya di sini."
                action={<Link to="/jobs?create=1" className="btn btn--primary">+ Buat Job</Link>}
              />
            )}
          </div>
        </SectionCard>
      </div>

      <div className="dashboard-grid">
        <SectionCard
          title="Kalender Jadwal & Deadline"
          description="Lihat semua jadwal kerja bisnis dan deadline yang sudah melekat pada job."
        >
          <ScheduleCalendar items={calendarItems} emptyLabel="Belum ada job terjadwal pada hari ini." />
        </SectionCard>

        <SectionCard
          title="Deadline Mendekat"
          description="Pantau job yang deadline-nya perlu segera ditindak."
        >
          <DeadlineList items={calendarItems.filter(item => !["done", "cancelled"].includes(item.status || ""))} emptyLabel="Belum ada deadline aktif untuk job bisnis ini." />
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
            Bisnis {stats.business?.name ?? "Coreveta"} saat ini memakai paket {stats.business?.plan ?? "Starter"}.
          </p>
        </div>
        <Link to="/settings">Kelola Paket →</Link>
      </div>

      {business?.subscriptionAlert ? (
        <div className="callout callout--warning">
          <div>
            <strong>{business.subscriptionAlert.title}</strong>
            <p>{business.subscriptionAlert.message}</p>
          </div>
          <div className="button-row button-row--left">
            <button className="btn btn--primary" type="button" onClick={() => handleSubscriptionRequest("subscription_renewal")}>
              Minta Perpanjang
            </button>
            <button className="btn btn--secondary" type="button" onClick={() => handleSubscriptionRequest("subscription_upgrade")}>
              Tanya Upgrade
            </button>
          </div>
        </div>
      ) : null}

      <div className="cards-grid cards-grid--triple">
        <SectionCard
          title="Kirim Pesan WhatsApp"
          description="Pilih tugas lalu kirim notifikasi otomatis ke pelanggan atau teknisi memakai template pesan WhatsApp."
        >
          <div className="action-stack">
            <label className="field">
              <span>Pilih tugas untuk notifikasi</span>
              <select value={selectedWahaJob?.id ?? ""} onChange={(event) => setWahaJobId(event.target.value)}>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.number} · {job.title}
                  </option>
                ))}
              </select>
            </label>

            <div className="summary-list">
              <div>
                <span>Status WhatsApp</span>
                <Badge tone={canUseWahaAutomation ? "success" : "warning"}>
                   {business?.whatsapp?.automationStatusLabel ?? "Belum aktif"}
                </Badge>
              </div>
            </div>

            {!canUseWahaAutomation ? (
              <div className="callout callout--warning callout--cramped-fix">
                <div className="callout__body">
                  <strong>Otomasi WhatsApp Belum Aktif</strong>
                  <p>Hubungkan nomor bisnis Anda dari halaman pengaturan WAHA untuk mengaktifkan notifikasi otomatis ke pelanggan dan teknisi.</p>
                </div>
                <Link to="/settings/whatsapp" className="btn btn--secondary btn--small" style={{ marginTop: "12px", display: "inline-block" }}>Ke Pengaturan WA &rarr;</Link>
              </div>
            ) : null}

            <div className="button-row button-row--left">
              <EmptyAction
                primary
                onClick={() => void handleSendCustomerUpdate()}
                disabled={!canUseWahaAutomation || sendBusinessWhatsappMutation.isPending || !selectedWahaCustomer?.phone}
              >
                {sendBusinessWhatsappMutation.isPending ? "Mengirim..." : "Kirim ke Pelanggan"}
              </EmptyAction>
            </div>

            {selectedWahaTechnicians.length > 0 ? (
              <div className="stack-list">
                {selectedWahaTechnicians.map((technician) => (
                  <div key={technician.id} className="stack-list__item">
                    <strong>{technician.name}</strong>
                    <p>{technician.phone || "Nomor teknisi belum tersedia."}</p>
                    <EmptyAction
                      onClick={() => void handleSendTechnicianUpdate(technician.id)}
                      disabled={!canUseWahaAutomation || sendBusinessWhatsappMutation.isPending || !technician.phone}
                    >
                      {sendBusinessWhatsappMutation.isPending ? "Mengirim..." : "Kirim ke Teknisi"}
                    </EmptyAction>
                  </div>
                ))}
              </div>
            ) : (
              <p className="chart-helper">Tugas ini belum punya teknisi yang bisa dikirimi notifikasi.</p>
            )}

            {sendBusinessWhatsappMutation.error ? (
              <p className="form-error">{getErrorMessage(sendBusinessWhatsappMutation.error)}</p>
            ) : null}
          </div>
        </SectionCard>

        <SectionCard
          title="Tagihan Cepat"
          description="Alur ringkas yang lebih logis: pilih pelanggan atau tugas, isi biaya jasa, tambah komponen suku cadang, lalu kirim tagihan."
        >
          <form className="action-stack" onSubmit={handleQuickInvoice}>
            <div className="field-grid">
              <label className="field">
                <span>Tugas terkait</span>
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
                  <option value="">Tanpa tugas</option>
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
                <span>Nama jasa / servis</span>
                <input value={serviceLabel} onChange={(event) => setServiceLabel(event.target.value)} required />
              </label>
              <label className="field">
                <span>Biaya jasa</span>
                <input type="number" min="0" value={installationFee} onChange={(event) => setInstallationFee(event.target.value)} required />
              </label>
            </div>

            <div className="field-grid">
              <label className="field">
                <span>Biaya suku cadang</span>
                <input type="number" min="0" value={sparepartFee} onChange={(event) => setSparepartFee(event.target.value)} />
              </label>
              <label className="field">
                <span>Status tagihan</span>
                <select value={invoiceStatus} onChange={(event) => setInvoiceStatus(event.target.value as "Draft" | "Sent" | "Paid")}>
                  <option value="Draft">Draf</option>
                  <option value="Sent">Terkirim</option>
                  <option value="Paid">Lunas</option>
                </select>
              </label>
            </div>

            <label className="field">
              <span>Jatuh tempo</span>
              <input type="datetime-local" value={dueDate} onChange={(event) => setDueDate(event.target.value)} required />
            </label>

            <div className="summary-list">
              <div><span>Biaya jasa</span><strong>{formatRupiah(Number(installationFee || 0))}</strong></div>
              <div><span>Biaya suku cadang</span><strong>{formatRupiah(Number(sparepartFee || 0))}</strong></div>
              <div><span>Total tagihan</span><strong>{formatRupiah(totalInvoice)}</strong></div>
            </div>

            {selectedJob ? (
              <p className="form-helper">
                Tugas terhubung: {selectedJob.number} · {selectedJob.customer}. Jika suku cadang dipakai dari service, stok tetap dikelola dari halaman detail tugas.
              </p>
            ) : null}
            {createInvoiceMutation.error ? <p className="form-error">{getErrorMessage(createInvoiceMutation.error)}</p> : null}

            <div className="button-row button-row--left">
              <EmptyAction primary type="submit" disabled={createInvoiceMutation.isPending || totalInvoice <= 0}>
                {createInvoiceMutation.isPending ? "Membuat..." : "Buat Tagihan Dari Dashboard"}
              </EmptyAction>
              <Link to="/invoices" className="btn btn--secondary">Lihat Semua Tagihan</Link>
            </div>
          </form>
        </SectionCard>

        <SectionCard title="Playbook Operasional" description="Pattern yang paling sering dipakai aplikasi sejenis untuk menjaga dispatch, CRM, dan billing tetap rapi.">
          <div className="stack-list">
            <div className="stack-list__item">
              <strong>1. Penugasan dulu, penagihan belakangan</strong>
              <p>Pastikan tugas punya teknisi dan slot waktu jelas. Pembayaran tagihan tetap dipisahkan dari progres kerja lapangan.</p>
            </div>
            <div className="stack-list__item">
              <strong>2. Penagihan pakai komponen yang jelas</strong>
              <p>Biaya jasa masuk sebagai komponen utama, lalu suku cadang sebagai komponen tambahan agar owner dan pelanggan sama-sama paham.</p>
            </div>
            <div className="stack-list__item">
              <strong>3. Follow up pelanggan dari dashboard</strong>
              <p>Antrian tagihan jatuh tempo, kontrak mendekati selesai, dan pelanggan lama sekarang terlihat dari pusat kendali agar owner tidak perlu menebak prioritas.</p>
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Tugas Terbaru" action={<Link to="/jobs">Lihat Semua Tugas →</Link>}>
        <div className="table-card">
          <div className="data-table data-table--head">
            <span>#No</span>
            <span>Pelanggan</span>
            <span>Teknisi</span>
            <span>Jenis</span>
            <span>Status</span>
            <span>Jadwal</span>
            <span className="align-right">Harga</span>
          </div>
          {stats.recentJobs.length === 0 ? (
            <EmptyState
              title="Antrian pekerjaan kosong"
              description="Daftar 5 tugas terakhir akan muncul di tabel ini. Saat ini belum ada tugas aktif."
            />
          ) : (
            stats.recentJobs.map((job) => (
              <div key={job.id} className="data-table">
                <span className="mono">{job.number}</span>
                <span>{job.title}</span>
                <span>-</span>
                <span>-</span>
                <span>
                  <Badge tone={job.status === "pending" ? "warning" : job.status === "done" ? "success" : "info"}>
                    {jobStatusLabels[job.status] ?? job.status}
                  </Badge>
                </span>
                <span>{job.schedule}</span>
                <span className="align-right">{job.price}</span>
              </div>
            ))
          )}
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
        <Link to="/inventory">Kelola Suku Cadang →</Link>
      </div>
    </div>
  );
}

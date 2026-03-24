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
import { Badge, DonutSummary, EmptyAction, MiniBarChart, SectionCard, StatCard } from "../components/UI";
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
  on_the_way: "Menuju Lokasi",
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
          title="Kalender Jadwal & Deadline"
          description="Lihat semua jadwal kerja bisnis dan deadline yang sudah melekat pada job."
        >
          <ScheduleCalendar items={calendarItems} emptyLabel="Belum ada job terjadwal pada hari ini." />
        </SectionCard>

        <SectionCard
          title="Deadline Mendekat"
          description="Pantau job yang deadline-nya perlu segera ditindak."
        >
          <DeadlineList items={calendarItems} emptyLabel="Belum ada deadline aktif untuk job bisnis ini." />
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

      <div className="dashboard-grid">
        <SectionCard
          title="Kirim Otomatis via WAHA"
          description="Pilih job lalu kirim notifikasi otomatis ke pelanggan atau teknisi memakai template pesan WAHA."
        >
          <div className="action-stack">
            <label className="field">
              <span>Pilih job untuk notifikasi</span>
              <select value={selectedWahaJob?.id ?? ""} onChange={(event) => setWahaJobId(event.target.value)}>
                {jobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.number} · {job.title}
                  </option>
                ))}
              </select>
            </label>

            <div className="summary-list">
              <div><span>Status WAHA</span><strong>{business?.whatsapp?.automationStatusLabel ?? "Belum aktif"}</strong></div>
              <div><span>Pelanggan</span><strong>{selectedWahaCustomer?.name ?? selectedWahaJob?.customer ?? "-"}</strong></div>
              <div><span>Teknisi</span><strong>{selectedWahaJob?.technicians.join(", ") || "Belum ada teknisi"}</strong></div>
            </div>

            {!canUseWahaAutomation ? (
              <div className="callout callout--warning">
                <strong>WAHA belum siap dipakai</strong>
                <p>Aktifkan mode Otomasi WAHA dan hubungkan nomor bisnis lebih dulu dari halaman Hubungkan WAHA.</p>
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
              <p className="chart-helper">Job ini belum punya teknisi yang bisa dikirimi notifikasi.</p>
            )}

            {sendBusinessWhatsappMutation.error ? (
              <p className="form-error">{getErrorMessage(sendBusinessWhatsappMutation.error)}</p>
            ) : null}
          </div>
        </SectionCard>

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

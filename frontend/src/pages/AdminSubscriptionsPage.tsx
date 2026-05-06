import { FormEvent, useEffect, useMemo, useState } from "react";
import { getErrorMessage } from "../api/client";
import {
  useAdminCalendarQuery,
  useAdminInboxQuery,
  useAdminSubscriptionsQuery,
  useResetClientPasswordMutation,
  useUpdateAdminSubscriptionMutation,
} from "../api/hooks";
import type { AdminClientSubscription } from "../api/types";
import { PageError, PageLoader } from "../components/PageState";
import { DeadlineList, ScheduleCalendar } from "../components/ScheduleCalendar";
import { Badge, EmptyAction, SectionCard, StatCard } from "../components/UI";

const SALES_WHATSAPP = "6285645286293";

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

function isDefinedPlanOption<T>(value: T | null | undefined): value is T {
  return value != null;
}

function buildSalesResetPasswordLink(client?: AdminClientSubscription | null) {
  const message = [
    "Halo sales Coreveta, saya butuh bantuan reset password client.",
    `Nama bisnis: ${client?.name ?? "-"}`,
    `Owner: ${client?.owner?.name ?? "-"}`,
    `Email: ${client?.owner?.email ?? "-"}`,
  ].join("\n");

  return `https://wa.me/${SALES_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export default function AdminSubscriptionsPage() {
  const subscriptionsQuery = useAdminSubscriptionsQuery();
  const calendarQuery = useAdminCalendarQuery();
  const inboxQuery = useAdminInboxQuery();
  const updateMutation = useUpdateAdminSubscriptionMutation();
  const resetPasswordMutation = useResetClientPasswordMutation();
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [plan, setPlan] = useState<"Starter" | "Pro" | "Bisnis">("Starter");
  const [subscriptionStatus, setSubscriptionStatus] = useState<
    "pending_payment" | "paid" | "active" | "trialing" | "past_due" | "paused" | "cancelled"
  >("pending_payment");
  const [trialEndsAt, setTrialEndsAt] = useState("");
  const [currentPeriodEndsAt, setCurrentPeriodEndsAt] = useState("");
  const [subscriptionNotes, setSubscriptionNotes] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [lastResetPassword, setLastResetPassword] = useState("");

  const rows = subscriptionsQuery.data?.data ?? [];
  const inboxItems = inboxQuery.data ?? [];
  const calendarItems = (calendarQuery.data ?? []).map((job) => ({
    id: job.id,
    title: `${job.number} · ${job.title}`,
    subtitle: `${job.business} · ${job.customer} · ${job.technicians.join(", ") || "Belum ada teknisi"}`,
    scheduleAt: job.scheduleAt,
    deadlineAt: job.deadlineAt ?? null,
    status: job.status,
    priority: job.priority,
  }));
  const meta = subscriptionsQuery.data?.meta;

  const filteredRows = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return rows;
    return rows.filter((row) =>
      `${row.name} ${row.city} ${row.owner?.name ?? ""} ${row.owner?.email ?? ""} ${row.plan}`.toLowerCase().includes(needle),
    );
  }, [rows, search]);

  const focused = filteredRows.find((row) => row.id === selectedId) ?? filteredRows[0];
  const salesResetPasswordLink = buildSalesResetPasswordLink(focused);

  useEffect(() => {
    if (!focused) return;
    setSelectedId(focused.id);
    setPlan(focused.plan);
    setSubscriptionStatus(focused.subscriptionStatus);
    setTrialEndsAt(toDateTimeLocal(focused.trialEndsAt));
    setCurrentPeriodEndsAt(toDateTimeLocal(focused.currentPeriodEndsAt));
    setSubscriptionNotes(focused.subscriptionNotes ?? "");
    setNewPassword("");
    setLastResetPassword("");
  }, [focused]);

  if (subscriptionsQuery.isLoading) {
    return <PageLoader title="Memuat subscription client..." />;
  }

  if (subscriptionsQuery.error || !subscriptionsQuery.data) {
    return <PageError message={getErrorMessage(subscriptionsQuery.error)} />;
  }

  const activeCount = rows.filter((row) => ["active", "paid"].includes(row.subscriptionStatus)).length;
  const trialCount = rows.filter((row) => row.subscriptionStatus === "trialing").length;
  const pendingCount = rows.filter((row) => row.subscriptionStatus === "pending_payment").length;
  const issueCount = rows.filter((row) => ["past_due", "paused", "cancelled"].includes(row.subscriptionStatus)).length;
  const inboxOpenCount = inboxItems.length;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!focused) return;

    await updateMutation.mutateAsync({
      businessId: focused.id,
      payload: {
        plan,
        subscriptionStatus,
        trialEndsAt: trialEndsAt ? new Date(trialEndsAt).toISOString() : null,
        currentPeriodEndsAt: currentPeriodEndsAt ? new Date(currentPeriodEndsAt).toISOString() : null,
        subscriptionNotes: subscriptionNotes || null,
      },
    });
  }

  async function handleResetPassword() {
    if (!focused) return;

    const result = await resetPasswordMutation.mutateAsync({
      businessId: focused.id,
      newPassword: newPassword.trim() || undefined,
    });
    setLastResetPassword(result.temporaryPassword);
    setNewPassword("");
  }

  return (
    <div className="page-stack">
      <div className="stats-grid">
        <StatCard label="Client Aktif" value={String(activeCount)} hint="Subscription sehat" type="success" />
        <StatCard label="Masih Trial" value={String(trialCount)} hint="Perlu follow up closing" />
        <StatCard label="Pending Payment" value={String(pendingCount)} hint="Perlu ditindak admin" type="warning" />
        <StatCard label="Perlu Tindakan" value={String(issueCount)} hint="Past due / paused / cancelled" type="warning" />
        <StatCard label="Inbox Admin" value={String(inboxOpenCount)} hint="Permintaan client & alert subscription" type="warning" />
      </div>

      <div className="dashboard-grid">
        <SectionCard
          title="Kalender Semua Jadwal Client"
          description="Staff admin bisa melihat seluruh jadwal job lintas client dalam satu tampilan."
        >
          <ScheduleCalendar items={calendarItems} emptyLabel="Belum ada jadwal client pada hari ini." />
        </SectionCard>

        <SectionCard
          title="Deadline Client"
          description="Tenggat kerja lintas client yang perlu pengawasan dari admin."
        >
          <DeadlineList items={calendarItems} emptyLabel="Belum ada deadline aktif lintas client." />
        </SectionCard>
      </div>

      <div className="dashboard-grid">
        <SectionCard
          title="Inbox Admin"
          description="Semua permintaan upgrade, perpanjang, reset password, dan peringatan subscription client masuk ke sini."
        >
          <div className="stack-list">
            {inboxItems.length > 0 ? (
              inboxItems.map((item) => (
                <article key={item.id} className="stack-list__item">
                  <div className="admin-subscription-card">
                    <div>
                      <strong>{item.title ?? item.businessName}</strong>
                      <p>
                        {item.requesterName} · {item.requesterEmail} · {item.createdAtLabel}
                      </p>
                      <small>{item.message || `Permintaan ${item.type}`}</small>
                    </div>
                    <div className="admin-subscription-card__meta">
                      <Badge tone={item.level === "danger" ? "danger" : item.level === "warning" ? "warning" : "info"}>
                        {item.type.replaceAll("_", " ")}
                      </Badge>
                      <small>{item.currentPlan}{item.targetPlan && item.targetPlan !== "-" ? ` → ${item.targetPlan}` : ""}</small>
                    </div>
                  </div>
                </article>
              ))
            ) : (
              <p className="chart-helper">Permintaan dari owner dan alert subscription otomatis akan muncul di sini.</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Client Workspace" description="Lihat siapa pemilik bisnis, paket aktif, dan sinyal operasional yang sudah terpakai.">
          <div className="toolbar toolbar--simple">
            <input
              className="toolbar__search"
              placeholder="Cari bisnis, kota, atau owner..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <div className="stack-list">
            {filteredRows.map((row) => (
              <button
                key={row.id}
                type="button"
                className={`stack-list__item stack-list__item--button ${focused?.id === row.id ? "stack-list__item--active" : ""}`}
                onClick={() => setSelectedId(row.id)}
              >
                <div className="admin-subscription-card">
                  <div>
                    <strong>{row.name}</strong>
                    <p>
                      {row.city} · {row.owner?.name ?? "Tanpa owner"} · {row.plan}
                    </p>
                  </div>
                  <div className="admin-subscription-card__meta">
                    <Badge
                      tone={
                        row.subscriptionStatus === "pending_payment"
                          ? "warning"
                          : row.subscriptionStatus === "paid" || row.subscriptionStatus === "active"
                          ? "success"
                          : row.subscriptionStatus === "trialing"
                            ? "info"
                            : "warning"
                      }
                    >
                      {row.subscriptionStatusLabel}
                    </Badge>
                    <small>{row.counts.activeJobs} job aktif</small>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </SectionCard>

        <div className="page-stack">
          <SectionCard title={focused ? `Kelola ${focused.name}` : "Pilih Client"} description="Ubah plan, status langganan, dan catatan internal tanpa membuka data operasional detail pelanggan.">
            {focused ? (
              <form className="action-stack" onSubmit={handleSubmit}>
                <div className="summary-list">
                  <div><span>Owner</span><strong>{focused.owner?.name ?? "-"}</strong></div>
                  <div><span>Email</span><strong>{focused.owner?.email ?? "-"}</strong></div>
                  <div><span>Dibuat</span><strong>{focused.createdAtLabel}</strong></div>
                  <div><span>Service</span><strong>{focused.serviceType}</strong></div>
                </div>

                <div className="field-grid">
                  <label className="field">
                    <span>Plan</span>
                    <select value={plan} onChange={(event) => setPlan(event.target.value as typeof plan)}>
                      {(meta?.plans ?? []).filter(isDefinedPlanOption).map((option) => (
                        <option key={option.key} value={option.key}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="field">
                    <span>Status langganan</span>
                    <select
                      value={subscriptionStatus}
                      onChange={(event) =>
                        setSubscriptionStatus(event.target.value as typeof subscriptionStatus)
                      }
                    >
                      {meta?.statuses.map((statusOption) => (
                        <option key={statusOption} value={statusOption}>
                          {statusOption}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="field-grid">
                  <label className="field">
                    <span>Trial berakhir</span>
                    <input
                      type="datetime-local"
                      value={trialEndsAt}
                      onChange={(event) => setTrialEndsAt(event.target.value)}
                    />
                  </label>
                  <label className="field">
                    <span>Periode aktif sampai</span>
                    <input
                      type="datetime-local"
                      value={currentPeriodEndsAt}
                      onChange={(event) => setCurrentPeriodEndsAt(event.target.value)}
                    />
                  </label>
                </div>

                <label className="field">
                  <span>Catatan internal</span>
                  <textarea
                    value={subscriptionNotes}
                    onChange={(event) => setSubscriptionNotes(event.target.value)}
                    placeholder="Contoh: follow up invoice bulanan, upgrade menunggu approval owner."
                  />
                </label>

                <div className="callout callout--warning">
                  <strong>Pemakaian saat ini</strong>
                  <p>
                    {focused.counts.technicians} teknisi · {focused.counts.customers} pelanggan ·{" "}
                    {focused.counts.inventoryItems} inventori · {focused.counts.contracts} kontrak.
                  </p>
                </div>

                <SectionCard
                  title="Reset Password Client"
                  description="Password lama tidak bisa dilihat. Admin hanya bisa membuat password baru sementara lalu membagikannya ke client."
                >
                  <div className="action-stack">
                    <label className="field">
                      <span>Password baru sementara</span>
                      <input
                        value={newPassword}
                        onChange={(event) => setNewPassword(event.target.value)}
                        placeholder="Kosongkan untuk generate otomatis"
                      />
                    </label>
                    {lastResetPassword ? (
                      <div className="callout callout--success">
                        <div>
                          <strong>Password sementara baru</strong>
                          <p>
                            {lastResetPassword} untuk {focused.owner?.email ?? "client ini"}.
                          </p>
                        </div>
                      </div>
                    ) : null}
                    {resetPasswordMutation.error ? (
                      <p className="form-error">{getErrorMessage(resetPasswordMutation.error)}</p>
                    ) : null}
                    <div className="button-row button-row--left">
                      {focused.subscriptionStatus === "pending_payment" ? (
                        <EmptyAction
                          type="button"
                          primary
                          onClick={async () => {
                            setSubscriptionStatus("paid");
                            await updateMutation.mutateAsync({
                              businessId: focused.id,
                              payload: {
                                plan,
                                subscriptionStatus: "paid",
                                trialEndsAt: trialEndsAt ? new Date(trialEndsAt).toISOString() : null,
                                currentPeriodEndsAt: currentPeriodEndsAt ? new Date(currentPeriodEndsAt).toISOString() : null,
                                subscriptionNotes: subscriptionNotes || null,
                              },
                            });
                          }}
                          disabled={updateMutation.isPending}
                        >
                          {updateMutation.isPending ? "Menyimpan..." : "Tandai Paid"}
                        </EmptyAction>
                      ) : null}
                      <EmptyAction
                        type="button"
                        onClick={handleResetPassword}
                        primary
                        disabled={resetPasswordMutation.isPending}
                      >
                        {resetPasswordMutation.isPending ? "Mereset..." : "Reset Password Client"}
                      </EmptyAction>
                      <a className="btn btn--secondary" href={salesResetPasswordLink} target="_blank" rel="noreferrer">
                        Reset via Sales
                      </a>
                    </div>
                  </div>
                </SectionCard>

                {updateMutation.error ? <p className="form-error">{getErrorMessage(updateMutation.error)}</p> : null}
                <div className="button-row button-row--left">
                  <EmptyAction type="button" onClick={() => focused && setSelectedId(focused.id)}>
                    Reset
                  </EmptyAction>
                  <EmptyAction primary type="submit" disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Menyimpan..." : "Simpan Subscription"}
                  </EmptyAction>
                </div>
              </form>
            ) : (
              <p className="chart-helper">Belum ada client yang bisa dipilih.</p>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

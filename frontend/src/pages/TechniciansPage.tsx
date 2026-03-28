import { FormEvent, useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../api/client";
import {
  useBusinessQuery,
  useCreateTechnicianAccountMutation,
  useCreateTechnicianMutation,
  useDisableTechnicianAccountMutation,
  useForceLogoutTechnicianMutation,
  useJobsQuery,
  useResetTechnicianPasswordMutation,
  useTechniciansLiveQuery,
  useTechniciansQuery,
  useUpdateTechnicianAccountMutation,
  useUpdateTechnicianMutation,
  useDeleteTechnicianMutation,
} from "../api/hooks";
import type { TechnicianAccountResult } from "../api/types";
import { PageError, PageLoader } from "../components/PageState";
import { DeadlineList, ScheduleCalendar } from "../components/ScheduleCalendar";
import { Badge, EmptyAction, SectionCard, StatCard } from "../components/UI";
import { buildTechnicianTaskMessage, buildWhatsAppLink } from "../utils/whatsapp";

export default function TechniciansPage() {
  const techniciansQuery = useTechniciansQuery();
  const techniciansLiveQuery = useTechniciansLiveQuery();
  const businessQuery = useBusinessQuery();
  const jobsQuery = useJobsQuery();
  const createTechnicianMutation = useCreateTechnicianMutation();
  const createTechnicianAccountMutation = useCreateTechnicianAccountMutation();
  const disableTechnicianAccountMutation = useDisableTechnicianAccountMutation();
  const forceLogoutTechnicianMutation = useForceLogoutTechnicianMutation();
  const resetTechnicianPasswordMutation = useResetTechnicianPasswordMutation();
  const updateTechnicianAccountMutation = useUpdateTechnicianAccountMutation();
  const deleteTechnicianMutation = useDeleteTechnicianMutation();
  const [editingId, setEditingId] = useState("");
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");
  const updateTechnicianMutation = useUpdateTechnicianMutation(editingId || undefined);
  const [showForm, setShowForm] = useState(false);
  const [accountDrafts, setAccountDrafts] = useState<Record<string, string>>({});
  const [passwordDrafts, setPasswordDrafts] = useState<Record<string, string>>({});
  const [lastAccountResult, setLastAccountResult] = useState<TechnicianAccountResult | null>(null);
  const [accountActionTargetId, setAccountActionTargetId] = useState("");
  const formRef = useRef<HTMLDivElement | null>(null);
  const accountFeedbackRef = useRef<HTMLDivElement | null>(null);
  const calendarRef = useRef<HTMLDivElement | null>(null);
  const [expandedAccountId, setExpandedAccountId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [status, setStatus] = useState<"Aktif" | "Bertugas" | "Standby" | "Tidak Aktif">("Aktif");
  const technicians = techniciansQuery.data ?? [];
  const jobs = jobsQuery.data ?? [];
  const editingTechnician = technicians.find((item) => item.id === editingId);
  const focusedTechnician = technicians.find((item) => item.id === selectedTechnicianId) ?? technicians[0];

  useEffect(() => {
    if (!selectedTechnicianId && technicians[0]) {
      setSelectedTechnicianId(technicians[0].id);
    }
  }, [selectedTechnicianId, technicians]);

  useEffect(() => {
    if (!editingTechnician) {
      return;
    }

    setName(editingTechnician.name);
    setPhone(editingTechnician.phone);
    setSpecialties(editingTechnician.specialties.join(", "));
    setStatus(editingTechnician.status);
  }, [editingTechnician]);

  useEffect(() => {
    setAccountDrafts((current) => {
      let changed = false;
      const next = { ...current };

      for (const technician of technicians) {
        if (!next[technician.id] && technician.accountEmail) {
          next[technician.id] = technician.accountEmail;
          changed = true;
        }
      }

      return changed ? next : current;
    });
  }, [technicians]);

  if (techniciansQuery.isLoading) {
    return <PageLoader title="Memuat teknisi..." />;
  }

  if (techniciansQuery.error || !techniciansQuery.data) {
    return <PageError message={getErrorMessage(techniciansQuery.error)} />;
  }

  const activeCount = technicians.filter((item) => item.status === "Aktif").length;
  const assignedCount = technicians.filter((item) => item.status === "Bertugas").length;
  const inactiveCount = technicians.filter((item) => item.status === "Tidak Aktif").length;
  const maxTechnicians = businessQuery.data?.entitlements?.maxTechnicians ?? 1;
  const technicianSlotsLeft = Math.max(0, maxTechnicians - technicians.length);
  const liveTechnicians = techniciansLiveQuery.data ?? [];
  const focusedAssignments = focusedTechnician
    ? jobs.filter((job) => job.technicianIds.includes(focusedTechnician.id))
    : [];
  const focusedCalendarItems = focusedAssignments.map((job) => ({
    id: job.id,
    title: `${job.number} · ${job.title}`,
    subtitle: `${job.customer} · ${job.location}`,
    scheduleAt: job.scheduleAt,
    deadlineAt: job.deadlineAt ?? null,
    href: `/jobs/${job.id}`,
    status: job.status,
    priority: job.priority,
  }));

  function scrollToRef(ref: { current: HTMLDivElement | null }) {
    window.setTimeout(() => {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 140);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const payload = {
      name,
      phone,
      specialties: specialties.split(",").map((item) => item.trim()).filter(Boolean),
      status,
      rating: editingTechnician?.rating ?? 0,
    };

    if (editingId) {
      await updateTechnicianMutation.mutateAsync(payload);
    } else {
      await createTechnicianMutation.mutateAsync(payload);
    }

    setEditingId("");
    setShowForm(false);
    setName("");
    setPhone("");
    setSpecialties("");
    setStatus("Aktif");
  }

  async function handleCreateAccount(technicianId: string) {
    const email = accountDrafts[technicianId]?.trim();
    if (!email) {
      return;
    }

    setAccountActionTargetId(technicianId);
    setLastAccountResult(null);
    try {
      const result = await createTechnicianAccountMutation.mutateAsync({
        technicianId,
        email,
        password: passwordDrafts[technicianId]?.trim() || undefined,
      });
      setLastAccountResult(result);
      scrollToRef(accountFeedbackRef);
    } finally {
      setAccountActionTargetId("");
    }
  }

  async function handleResetPassword(technicianId: string) {
    setAccountActionTargetId(technicianId);
    setLastAccountResult(null);
    try {
      const result = await resetTechnicianPasswordMutation.mutateAsync({
        technicianId,
        newPassword: passwordDrafts[technicianId]?.trim() || undefined,
      });
      setLastAccountResult(result);
      scrollToRef(accountFeedbackRef);
      setPasswordDrafts((current) => ({
        ...current,
        [technicianId]: "",
      }));
    } finally {
      setAccountActionTargetId("");
    }
  }

  async function handleUpdateAccount(technicianId: string) {
    const email = accountDrafts[technicianId]?.trim();
    const newPassword = passwordDrafts[technicianId]?.trim();
    if (!email && !newPassword) {
      return;
    }

    setAccountActionTargetId(technicianId);
    setLastAccountResult(null);
    try {
      const result = await updateTechnicianAccountMutation.mutateAsync({
        technicianId,
        email: email || undefined,
        newPassword: newPassword || undefined,
      });
      setLastAccountResult(result);
      scrollToRef(accountFeedbackRef);
      setPasswordDrafts((current) => ({
        ...current,
        [technicianId]: "",
      }));
    } finally {
      setAccountActionTargetId("");
    }
  }

  async function handleForceLogout(technicianId: string) {
    setAccountActionTargetId(technicianId);
    setLastAccountResult(null);
    try {
      const result = await forceLogoutTechnicianMutation.mutateAsync({ technicianId });
      setLastAccountResult(result);
      scrollToRef(accountFeedbackRef);
    } finally {
      setAccountActionTargetId("");
    }
  }

  async function handleDisableAccount(technicianId: string) {
    setAccountActionTargetId(technicianId);
    setLastAccountResult(null);
    try {
      const result = await disableTechnicianAccountMutation.mutateAsync({ technicianId });
      setLastAccountResult(result);
      scrollToRef(accountFeedbackRef);
      setPasswordDrafts((current) => ({
        ...current,
        [technicianId]: "",
      }));
    } finally {
      setAccountActionTargetId("");
    }
  }

  async function handleDeleteTechnician(id: string) {
    if (window.confirm("Apakah Anda yakin ingin menghapus teknisi ini? Data history pekerjaan tetap tersimpan di database.")) {
      await deleteTechnicianMutation.mutateAsync(id);
    }
  }

  function getAccountStatusLabel(accountStatus?: string | null) {
    if (accountStatus === "active") return "Akun Aktif";
    if (accountStatus === "disabled") return "Akun Dinonaktifkan";
    return "Belum Ada Akun";
  }

  function getAccountStatusTone(accountStatus?: string | null) {
    if (accountStatus === "active") return "success";
    if (accountStatus === "disabled") return "danger";
    return "warning";
  }

  return (
    <div className="page-stack">
      <div className="stats-grid">
        <StatCard 
          label="Total Tim" 
          value={String(technicians.length)} 
          hint="Personel terdaftar" 
          type="info"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          }
        />
        <StatCard 
          label="Slot Tersisa" 
          value={String(technicianSlotsLeft)} 
          hint={`Maks ${maxTechnicians} paket`} 
          type={technicianSlotsLeft > 0 ? "success" : "warning"} 
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="19" y1="8" x2="19" y2="14" />
              <line x1="16" y1="11" x2="22" y2="11" />
            </svg>
          }
        />
        <StatCard 
          label="Ready" 
          value={String(activeCount)} 
          hint="Siap bertugas" 
          type="success" 
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          }
        />
        <StatCard 
          label="On-Field" 
          value={String(assignedCount)} 
          hint="Di lokasi job" 
          type="info"
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          }
        />
        <StatCard 
          label="Off" 
          value={String(inactiveCount)} 
          hint="Tidak aktif" 
          type="default" 
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18.36 6.64a9 9 0 1 1-12.73 0" />
              <line x1="12" y1="2" x2="12" y2="12" />
            </svg>
          }
        />
      </div>

      <div className="callout callout--warning">
        <strong>Paket {businessQuery.data?.plan ?? "Starter"}</strong>
        <p>
          Maksimal {maxTechnicians} teknisi. Kalau timmu tumbuh lebih besar, upgrade plan dari admin subscription console.
        </p>
      </div>

      <SectionCard
        title="Absen & Kehadiran Teknisi"
        description="Panel ini mengambil data lokasi dan waktu aktif terakhir teknisi dari backend live."
      >
        {techniciansLiveQuery.isLoading ? (
          <p className="form-helper">Memuat data kehadiran teknisi...</p>
        ) : liveTechnicians.length > 0 ? (
          <div className="cards-grid cards-grid--two">
            {liveTechnicians.map((technician) => (
              <article key={technician.id} className="sub-card">
                <span>{technician.name}</span>
                <strong>{technician.status}</strong>
                <small>Update terakhir: {technician.lastSeenAt ?? "Belum ada"}</small>
                <small>
                  Lokasi: {technician.latitude.toFixed(5)}, {technician.longitude.toFixed(5)}
                </small>
              </article>
            ))}
          </div>
        ) : (
          <div className="callout">
            <div>
              <strong>Belum ada data kehadiran aktif</strong>
              <p>
                Backend masih menyimpan field `lastSeenAt`, `latitude`, dan `longitude`, tetapi belum ada alur frontend yang mengirim check-in/check-out terbaru dari akun teknisi.
              </p>
            </div>
          </div>
        )}
      </SectionCard>

      {lastAccountResult ? (
        <div ref={accountFeedbackRef} className="callout callout--success">
          <div>
            <strong>{lastAccountResult.technicianName}</strong>
            <p>{lastAccountResult.message}</p>
            <p>Email login: {lastAccountResult.accountEmail ?? "-"}</p>
            <p>
              Password sementara:{" "}
              {lastAccountResult.temporaryPassword ?? "Tidak diubah karena akun lama hanya ditautkan ulang."}
            </p>
          </div>
        </div>
      ) : null}

      <div className="toolbar toolbar--simple">
        <div />
        <EmptyAction
          primary
          onClick={() => {
            setEditingId("");
            setShowForm((current) => !current);
            if (showForm) {
              setName("");
              setPhone("");
              setSpecialties("");
              setStatus("Aktif");
            }
          }}
        >
          {showForm ? "Tutup Form" : "Tambah Teknisi"}
        </EmptyAction>
      </div>

      {showForm ? (
        <div ref={formRef}>
          <SectionCard title={editingId ? "Edit Teknisi" : "Teknisi Baru"}>
          <form className="action-stack" onSubmit={handleSubmit}>
            <div className="field-grid">
              <label className="field">
                <span>Nama</span>
                <input value={name} onChange={(event) => setName(event.target.value)} required />
              </label>
              <label className="field">
                <span>WhatsApp</span>
                <input value={phone} onChange={(event) => setPhone(event.target.value)} required />
              </label>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>Spesialisasi</span>
                <input value={specialties} onChange={(event) => setSpecialties(event.target.value)} required />
              </label>
              <label className="field">
                <span>Status</span>
                <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
                  <option value="Aktif">Aktif</option>
                  <option value="Bertugas">Bertugas</option>
                  <option value="Standby">Standby</option>
                  <option value="Tidak Aktif">Tidak Aktif</option>
                </select>
              </label>
            </div>
            {createTechnicianMutation.error || updateTechnicianMutation.error ? (
              <p className="form-error">{getErrorMessage(createTechnicianMutation.error || updateTechnicianMutation.error)}</p>
            ) : null}
            <div className="button-row button-row--left">
              <EmptyAction onClick={() => setShowForm(false)}>Batal</EmptyAction>
              <EmptyAction
                primary
                type="submit"
                disabled={createTechnicianMutation.isPending || updateTechnicianMutation.isPending}
              >
                {createTechnicianMutation.isPending || updateTechnicianMutation.isPending ? "Menyimpan..." : editingId ? "Update Teknisi" : "Simpan Teknisi"}
              </EmptyAction>
            </div>
          </form>
          </SectionCard>
        </div>
      ) : null}

      <div className="cards-grid">
        {technicians.map((technician) => {
          const isExpanded = expandedAccountId === technician.id;
          const initials = technician.name.slice(0, 2).toUpperCase();
          const reminderWhatsappLink = buildWhatsAppLink(
            technician.phone,
            buildTechnicianTaskMessage({
              businessName: businessQuery.data?.name,
              technicianName: technician.name,
              jobNumber: "Cek dashboard",
              jobTitle: "Lihat assignment terbaru",
              status: technician.status,
              schedule: "Hari ini",
              location: businessQuery.data?.address ?? businessQuery.data?.city ?? "Lokasi bisnis",
              customerName: "Update operasional",
            }),
          );

          return (
            <div key={technician.id} className={`tech-card ${technician.status === "Tidak Aktif" ? "tech-card--inactive" : ""}`}>
              <div className="tech-card__header">
                <div className="tech-card__identity">
                  <div className="avatar avatar--large">{initials}</div>
                  <div>
                    <h3>{technician.name}</h3>
                    <p>{technician.specialties.join(", ")}</p>
                  </div>
                </div>
                <div className="tech-card__badge-stack">
                  <Badge tone={technician.status === "Aktif" ? "success" : technician.status === "Bertugas" ? "info" : "neutral"}>
                    {technician.status}
                  </Badge>
                  <div className="tech-card__rating">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-warning">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                    <span>{technician.rating} · {technician.jobsCompleted} job</span>
                  </div>
                </div>
              </div>

              <div className="tech-card__content">
                <div className="summary-list summary-list--compact">
                  <div><span>WA</span><strong>{technician.phone}</strong></div>
                  <div><span>Login</span><Badge tone={getAccountStatusTone(technician.accountStatus)}>{getAccountStatusLabel(technician.accountStatus)}</Badge></div>
                  {technician.accountEmail && <div><span>Email</span><strong>{technician.accountEmail}</strong></div>}
                </div>
              </div>

              <div className="tech-card__actions">
                <div className="button-group">
                  <button className="btn btn--secondary btn--small" onClick={() => { setSelectedTechnicianId(technician.id); scrollToRef(calendarRef); }}>
                    Kalender
                  </button>
                  <button className="btn btn--secondary btn--small" onClick={() => { setEditingId(technician.id); setShowForm(true); scrollToRef(formRef); }}>
                    Edit Profile
                  </button>
                  <button className="btn btn--primary btn--small" onClick={() => window.location.assign(`/jobs?technicianId=${technician.id}`)}>
                    Jobs
                  </button>
                </div>
                <div className="button-group">
                  <button 
                    className={`btn btn--small ${isExpanded ? "btn--primary-soft" : "btn--secondary-soft"}`} 
                    onClick={() => setExpandedAccountId(isExpanded ? "" : technician.id)}
                  >
                    {isExpanded ? "Tutup Akun" : "Atur Login"}
                  </button>
                  {reminderWhatsappLink && (
                    <a className="btn btn--secondary-soft btn--small" href={reminderWhatsappLink} target="_blank" rel="noreferrer">
                      WA
                    </a>
                  )}
                  <button 
                    className="btn btn--danger-soft btn--small" 
                    onClick={() => handleDeleteTechnician(technician.id)}
                    disabled={deleteTechnicianMutation.isPending}
                  >
                    Delete
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="tech-card__drawer tech-card__drawer--expanded">
                  <div className="action-stack">
                    <label className="field">
                      <span>Email login teknisi</span>
                      <input
                        type="email"
                        value={accountDrafts[technician.id] ?? ""}
                        onChange={(event) =>
                          setAccountDrafts((current) => ({
                            ...current,
                            [technician.id]: event.target.value,
                          }))
                        }
                        placeholder="teknisi@bisnisanda.id"
                      />
                    </label>
                    <label className="field">
                      <span>Password login teknisi</span>
                      <input
                        type="text"
                        value={passwordDrafts[technician.id] ?? ""}
                        onChange={(event) =>
                          setPasswordDrafts((current) => ({
                            ...current,
                            [technician.id]: event.target.value,
                          }))
                        }
                        placeholder={technician.accountStatus === "not_created" ? "Min 8 karakter" : "Kosongkan jika tidak ingin ganti"}
                      />
                    </label>
                    
                    <div className="button-row button-row--left">
                      {technician.accountStatus !== "not_created" ? (
                        <>
                          <EmptyAction
                            primary
                            onClick={() => void handleUpdateAccount(technician.id)}
                            disabled={
                              (!accountDrafts[technician.id]?.trim() && !passwordDrafts[technician.id]?.trim()) ||
                              (updateTechnicianAccountMutation.isPending && accountActionTargetId === technician.id)
                            }
                          >
                            {updateTechnicianAccountMutation.isPending && accountActionTargetId === technician.id
                              ? "Menyimpan..."
                              : "Update Akun"}
                          </EmptyAction>
                          <EmptyAction
                            onClick={() => void handleResetPassword(technician.id)}
                            disabled={resetTechnicianPasswordMutation.isPending && accountActionTargetId === technician.id}
                          >
                            Reset Password Acak
                          </EmptyAction>
                          <button className="btn btn--danger-soft btn--small" onClick={() => void handleDisableAccount(technician.id)}>
                            Nonaktifkan
                          </button>
                        </>
                      ) : (
                        <EmptyAction
                          primary
                          onClick={() => void handleCreateAccount(technician.id)}
                          disabled={
                            !accountDrafts[technician.id]?.trim() ||
                            (createTechnicianAccountMutation.isPending && accountActionTargetId === technician.id)
                          }
                        >
                          {createTechnicianAccountMutation.isPending && accountActionTargetId === technician.id
                            ? "Membuat..."
                            : "Buat Akun"}
                        </EmptyAction>
                      )}
                    </div>

                    {accountActionTargetId === technician.id && (
                      <div className="form-helper">Sedang memproses perubahan akun...</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {focusedTechnician ? (
        <div ref={calendarRef} className="dashboard-grid">
          <SectionCard
            title={`Kalender Tugas ${focusedTechnician.name}`}
            description="Teknisi bisa melihat semua jadwal kerja yang menjadi tanggung jawabnya."
          >
            <ScheduleCalendar items={focusedCalendarItems} emptyLabel="Belum ada jadwal untuk teknisi ini." />
          </SectionCard>

          <SectionCard
            title="Deadline Tugas Teknisi"
            description="Pantau tenggat kerja teknisi yang sudah ditetapkan pada job."
          >
            <DeadlineList items={focusedCalendarItems} emptyLabel="Belum ada deadline untuk teknisi ini." />
          </SectionCard>
        </div>
      ) : null}
    </div>
  );
}

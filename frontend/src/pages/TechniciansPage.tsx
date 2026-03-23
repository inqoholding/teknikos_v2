import { FormEvent, useEffect, useState } from "react";
import { getErrorMessage } from "../api/client";
import { useBusinessQuery, useCreateTechnicianMutation, useJobsQuery, useTechniciansQuery, useUpdateTechnicianMutation } from "../api/hooks";
import { PageError, PageLoader } from "../components/PageState";
import { DeadlineList, ScheduleCalendar } from "../components/ScheduleCalendar";
import { Badge, EmptyAction, SectionCard, StatCard } from "../components/UI";
import { buildTechnicianTaskMessage, buildWhatsAppLink } from "../utils/whatsapp";

export default function TechniciansPage() {
  const techniciansQuery = useTechniciansQuery();
  const businessQuery = useBusinessQuery();
  const jobsQuery = useJobsQuery();
  const createTechnicianMutation = useCreateTechnicianMutation();
  const [editingId, setEditingId] = useState("");
  const [selectedTechnicianId, setSelectedTechnicianId] = useState("");
  const updateTechnicianMutation = useUpdateTechnicianMutation(editingId || undefined);
  const [showForm, setShowForm] = useState(false);
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

  return (
    <div className="page-stack">
      <div className="stats-grid">
        <StatCard label="Total" value={String(technicians.length)} hint="Semua teknisi" />
        <StatCard label="Slot Tersisa" value={String(technicianSlotsLeft)} hint={`Maks ${maxTechnicians} di plan ini`} tone={technicianSlotsLeft > 0 ? "success" : "warning"} />
        <StatCard label="Aktif" value={String(activeCount)} hint="Siap terima job" tone="success" />
        <StatCard label="Sedang Bertugas" value={String(assignedCount)} hint="Masih di lapangan" />
        <StatCard label="Tidak Aktif" value={String(inactiveCount)} hint="Di luar jadwal" tone="warning" />
      </div>

      <div className="callout callout--warning">
        <strong>Paket {businessQuery.data?.plan ?? "Starter"}</strong>
        <p>
          Maksimal {maxTechnicians} teknisi. Kalau timmu tumbuh lebih besar, upgrade plan dari admin subscription console.
        </p>
      </div>

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
      ) : null}

      <div className="cards-grid">
        {technicians.map((technician) => {
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
            <SectionCard key={technician.id} title={technician.name} description={technician.specialties.join(", ")}>
              <div className="tech-card__body">
                <div className="avatar avatar--large">{technician.name.slice(0, 2).toUpperCase()}</div>
                <div className="summary-list">
                  <div><span>Rating</span><strong>{technician.rating} · {technician.jobsCompleted} job</strong></div>
                  <div><span>Status</span><Badge tone={technician.status === "Aktif" ? "success" : "info"}>{technician.status}</Badge></div>
                  <div><span>Phone</span><strong>{technician.phone}</strong></div>
                </div>
                <div className="button-row button-row--left">
                  <EmptyAction onClick={() => setSelectedTechnicianId(technician.id)}>
                    Buka Kalender
                  </EmptyAction>
                  <EmptyAction
                    onClick={() => {
                      setEditingId(technician.id);
                      setShowForm(true);
                    }}
                  >
                    Edit
                  </EmptyAction>
                  <EmptyAction
                    primary
                    onClick={() => {
                      window.location.assign(`/jobs?technicianId=${technician.id}`);
                    }}
                  >
                    Lihat Job
                  </EmptyAction>
                  {reminderWhatsappLink ? (
                    <a className="btn btn--secondary" href={reminderWhatsappLink} target="_blank" rel="noreferrer">
                      Reminder WA
                    </a>
                  ) : null}
                </div>
              </div>
            </SectionCard>
          );
        })}
      </div>

      {focusedTechnician ? (
        <div className="dashboard-grid">
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

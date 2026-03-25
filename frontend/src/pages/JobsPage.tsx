import { FormEvent, startTransition, useDeferredValue, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { useBusinessQuery, useCreateJobMutation, useCustomersQuery, useJobsQuery, useSessionQuery, useTechniciansQuery } from "../api/hooks";
import { PageError, PageLoader } from "../components/PageState";
import { Badge, EmptyAction, SectionCard, EmptyState } from "../components/UI";

const statusBuckets = [
  { key: "pending", title: "Menunggu" },
  { key: "assigned", title: "Ditugaskan" },
  { key: "on_the_way", title: "Perjalanan" },
  { key: "in_progress", title: "Dikerjakan" },
  { key: "done", title: "Selesai" },
];

export default function JobsPage() {
  const [searchParams] = useSearchParams();
  const [view, setView] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(searchParams.get("create") === "1");
  const [title, setTitle] = useState("");
  const [customerId, setCustomerId] = useState(searchParams.get("customerId") ?? "");
  const [technicianIds, setTechnicianIds] = useState<string[]>(searchParams.get("technicianId") ? [searchParams.get("technicianId") as string] : []);
  const [type, setType] = useState("AC");
  const [scheduleAt, setScheduleAt] = useState("");
  const [deadlineAt, setDeadlineAt] = useState("");
  const [price, setPrice] = useState("0");
  const [priority, setPriority] = useState<"Normal" | "Urgent">("Normal");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const deferredSearch = useDeferredValue(search);
  const statusFilter = searchParams.get("status") ?? "";
  const technicianFilter = searchParams.get("technicianId") ?? "";
  const sessionQuery = useSessionQuery();
  const isTechnician = sessionQuery.data?.user.role === "technician";
  const queryParams = useMemo(() => {
    const params: Record<string, string> = {};
    if (deferredSearch.trim()) params.q = deferredSearch.trim();
    if (statusFilter) params.status = statusFilter;
    if (technicianFilter) params.technicianId = technicianFilter;
    return Object.keys(params).length > 0 ? params : undefined;
  }, [deferredSearch, statusFilter, technicianFilter]);

  const jobsQuery = useJobsQuery(queryParams);
  const businessQuery = useBusinessQuery();
  const customersQuery = useCustomersQuery(undefined, !isTechnician);
  const techniciansQuery = useTechniciansQuery(!isTechnician);
  const createJobMutation = useCreateJobMutation();

  if (jobsQuery.isLoading) {
    return <PageLoader title="Memuat job order..." />;
  }

  if (jobsQuery.error || !jobsQuery.data) {
    return <PageError message={getErrorMessage(jobsQuery.error)} />;
  }

  const filteredJobs = jobsQuery.data;
  const customers = customersQuery.data ?? [];
  const technicians = techniciansQuery.data ?? [];
  const canUseMultiTechnician = businessQuery.data?.entitlements?.multiTechnicianEnabled ?? false;
  const pendingCount = filteredJobs.filter((job) => job.status === "pending").length;
  const activeCount = filteredJobs.filter((job) => ["assigned", "on_the_way", "in_progress"].includes(job.status)).length;
  const doneCount = filteredJobs.filter((job) => job.status === "done").length;
  const urgentCount = filteredJobs.filter((job) => job.priority === "Urgent").length;

  async function handleCreateJob(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createJobMutation.mutateAsync({
      title,
      customerId,
      technicianIds,
      type,
      scheduleAt,
      deadlineAt: deadlineAt || null,
      price: Number(price),
      status: technicianIds.length > 0 ? "assigned" : "pending",
      priority,
      description,
      location,
      items: [],
    });
    setShowCreate(false);
    setTitle("");
    setCustomerId("");
    setTechnicianIds([]);
    setType("AC");
    setScheduleAt("");
    setDeadlineAt("");
    setPrice("0");
    setPriority("Normal");
    setDescription("");
    setLocation("");
  }

  function handleExportCsv() {
    const rows = [
      ["number", "title", "customer", "technician", "type", "schedule", "status", "price"],
      ...filteredJobs.map((job) => [
        job.number,
        job.title,
        job.customer,
        job.technician,
        job.type,
        job.schedule,
        job.status,
        job.price,
      ]),
    ];
    const csv = rows.map((row) => row.map((value) => `"${String(value).replaceAll("\"", "\"\"")}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "jobs.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="page-stack">
      <div className="cards-grid cards-grid--job-overview">
        <article className="sub-card">
          <span>Job tampil</span>
          <strong>{filteredJobs.length}</strong>
          <small>{statusFilter || "Semua status"}</small>
        </article>
        <article className="sub-card">
          <span>Menunggu</span>
          <strong>{pendingCount}</strong>
          <small>Butuh assignment</small>
        </article>
        <article className="sub-card">
          <span>Aktif</span>
          <strong>{activeCount}</strong>
          <small>Masih berjalan</small>
        </article>
        <article className="sub-card">
          <span>Selesai / urgent</span>
          <strong>{doneCount} · {urgentCount}</strong>
          <small>Done dan prioritas tinggi</small>
        </article>
      </div>

      <SectionCard title="Kontrol Job Order" description="Pindah tampilan, cari job, lalu ekspor atau buat order baru dari panel yang sama.">
        <div className="toolbar">
          <div className="segmented">
            <button className={view === "list" ? "segmented__active" : ""} onClick={() => startTransition(() => setView("list"))}>
              List
            </button>
            <button className={view === "kanban" ? "segmented__active" : ""} onClick={() => startTransition(() => setView("kanban"))}>
              Kanban
            </button>
          </div>
          <input
            className="toolbar__search"
            placeholder="Cari nama pelanggan atau nomor job"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <div className="toolbar__actions">
            <EmptyAction onClick={handleExportCsv}>Export CSV</EmptyAction>
            {!isTechnician ? (
              <EmptyAction primary onClick={() => setShowCreate((current) => !current)}>
                {showCreate ? "Tutup Form" : "+ Buat Job"}
              </EmptyAction>
            ) : null}
          </div>
        </div>
      </SectionCard>

      {showCreate && !isTechnician ? (
        <SectionCard title="Job Baru">
          <form className="action-stack" onSubmit={handleCreateJob}>
            <div className="field-grid">
              <label className="field">
                <span>Judul job</span>
                <input value={title} onChange={(event) => setTitle(event.target.value)} required />
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
                <span>Teknisi</span>
                <div className="technician-checklist">
                  {technicians.map((technician) => {
                    const checked = technicianIds.includes(technician.id);
                    const disableUnchecked = !canUseMultiTechnician && technicianIds.length > 0 && !checked;

                    return (
                      <label
                        key={technician.id}
                        className={`technician-chip ${checked ? "technician-chip--active" : ""} ${disableUnchecked ? "technician-chip--disabled" : ""}`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={disableUnchecked}
                          onChange={() =>
                            setTechnicianIds((current) =>
                              checked ? current.filter((id) => id !== technician.id) : [...current, technician.id],
                            )
                          }
                        />
                        <span>{technician.name}</span>
                      </label>
                    );
                  })}
                </div>
                <small className="field-hint">
                  {canUseMultiTechnician
                    ? "Pilih satu atau lebih teknisi. Jika belum dipilih, job akan dibuat sebagai pending."
                    : `Paket ${businessQuery.data?.plan ?? "Starter"} saat ini hanya mengizinkan 1 teknisi per job.`}
                </small>
              </label>
              <label className="field">
                <span>Jenis pekerjaan</span>
                <input value={type} onChange={(event) => setType(event.target.value)} required />
              </label>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>Jadwal</span>
                <input type="datetime-local" value={scheduleAt} onChange={(event) => setScheduleAt(event.target.value)} required />
              </label>
              <label className="field">
                <span>Deadline tugas</span>
                <input type="datetime-local" value={deadlineAt} onChange={(event) => setDeadlineAt(event.target.value)} />
              </label>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>Harga</span>
                <input type="number" min="0" value={price} onChange={(event) => setPrice(event.target.value)} required />
              </label>
              <label className="field">
                <span>Prioritas</span>
                <select value={priority} onChange={(event) => setPriority(event.target.value as "Normal" | "Urgent")}>
                  <option value="Normal">Normal</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </label>
              <label className="field">
                <span>Lokasi</span>
                <input value={location} onChange={(event) => setLocation(event.target.value)} required />
              </label>
            </div>
            <label className="field">
              <span>Deskripsi</span>
              <textarea value={description} onChange={(event) => setDescription(event.target.value)} />
            </label>
            {createJobMutation.error ? <p className="form-error">{getErrorMessage(createJobMutation.error)}</p> : null}
            <div className="button-row button-row--left">
              <EmptyAction onClick={() => setShowCreate(false)}>Batal</EmptyAction>
              <EmptyAction primary type="submit" disabled={createJobMutation.isPending}>
                {createJobMutation.isPending ? "Menyimpan..." : "Simpan Job"}
              </EmptyAction>
            </div>
          </form>
        </SectionCard>
      ) : null}

      <SectionCard title="Filter">
        <div className="filter-grid">
          <div className="field-like">{statusFilter || "Semua status"}</div>
          <div className="field-like">
            {isTechnician
              ? "Job teknisi aktif"
              : technicianFilter
                ? technicians.find((item) => item.id === technicianFilter)?.name ?? "Teknisi"
                : "Semua teknisi"}
          </div>
          <div className="field-like">{filteredJobs.length} job tampil</div>
          <div className="field-like field-like--muted">
            {isTechnician ? "Akun teknisi hanya menampilkan job yang ditugaskan." : "Gunakan search untuk filter cepat"}
          </div>
        </div>
      </SectionCard>

      {view === "list" ? (
        <SectionCard title="List Job">
          <div className="table-card">
            <div className="data-table data-table--head data-table--jobs">
              <span>#</span>
              <span>Job</span>
              <span>Pelanggan</span>
              <span>Teknisi</span>
              <span>Jenis</span>
              <span>Jadwal</span>
              <span>Status</span>
              <span className="align-right">Harga</span>
            </div>
            {filteredJobs.length === 0 ? (
              <EmptyState
                title="Belum ada job order"
                description="Buat job operasional pertama Anda dan assign teknisi untuk melihat antrian tugas di sini."
                action={!isTechnician ? <EmptyAction primary onClick={() => setShowCreate(true)}>+ Buat Job Baru</EmptyAction> : undefined}
              />
            ) : (
              filteredJobs.map((job) => (
                <div key={job.id} className="data-table data-table--jobs">
                  <span className="mono">{job.number.replace("JOB-", "")}</span>
                  <span>
                    <Link to={`/jobs/${job.id}`}><strong>{job.title}</strong></Link>
                    <small>{job.location}</small>
                  </span>
                  <span>{job.customer}</span>
                  <span>{job.technician}</span>
                  <span>{job.type}</span>
                  <span>
                    {job.schedule.split("·")[1]?.trim() ?? job.schedule}
                    <small>{job.deadlineAt ? `Deadline ${new Date(job.deadlineAt).toLocaleString("id-ID")}` : "Tanpa deadline"}</small>
                  </span>
                  <span>
                    <Badge tone={job.status === "pending" ? "warning" : job.status === "done" ? "success" : "info"}>
                      {job.status.replaceAll("_", " ")}
                    </Badge>
                  </span>
                  <span className="align-right">{job.price}</span>
                </div>
              ))
            )}
          </div>
        </SectionCard>
      ) : (
        <div className="kanban-grid">
          {statusBuckets.map((bucket) => {
            const bucketJobs = filteredJobs.filter((job) => job.status === bucket.key);
            return (
              <SectionCard
                key={bucket.key}
                title={bucket.title}
                action={<Badge tone={bucket.key === "pending" ? "warning" : "info"}>{bucketJobs.length}</Badge>}
                className="kanban-column"
              >
                <div className="kanban-stack">
                  {bucketJobs.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-6 text-center rounded-2xl border border-slate-200 bg-slate-50/50 border-dashed w-full h-full min-h-[160px]">
                      <span className="text-sm text-slate-400 font-medium">Kosong</span>
                    </div>
                  ) : null}
                  {bucketJobs.map((job) => (
                    <article key={job.id} className="kanban-card">
                      <Link to={`/jobs/${job.id}`} className="mono">{job.number}</Link>
                      <strong>{job.customer}</strong>
                      <p>{job.title}</p>
                      <div className="kanban-card__meta">
                        <span>{job.technician}</span>
                        <span>{job.price}</span>
                      </div>
                      <small>{job.deadlineAt ? `Deadline ${new Date(job.deadlineAt).toLocaleDateString("id-ID")}` : "Tanpa deadline"}</small>
                    </article>
                  ))}
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

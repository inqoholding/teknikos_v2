import { ChangeEvent, useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import {
  useBusinessQuery,
  useCreateInvoiceFromJobMutation,
  useCustomersQuery,
  useInventoryQuery,
  useJobQuery,
  useSessionQuery,
  useSendBusinessWhatsappMutation,
  useTechniciansQuery,
  useUpdateJobMutation,
} from "../api/hooks";
import type { JobDetail } from "../api/types";
import { Badge, EmptyAction, SectionCard } from "../components/UI";
import { PageError, PageLoader } from "../components/PageState";
import { formatRupiah } from "../utils/currency";
import { printInvoice } from "../utils/invoicePrint";
import { createClientId } from "../utils/ids";
import { buildInvoiceMessage, buildJobProgressMessage, buildTechnicianTaskMessage, buildWhatsAppLink } from "../utils/whatsapp";

type EditableItem = {
  id: string;
  inventoryId?: string | null;
  kind: "service" | "sparepart";
  name: string;
  quantity: number;
  unitPrice: number;
  note?: string | null;
};

const statusLabels: Record<string, string> = {
  pending: "Menunggu",
  assigned: "Ditugaskan",
  on_the_way: "Menuju Lokasi",
  in_progress: "Dikerjakan",
  done: "Selesai",
  cancelled: "Dibatalkan",
  paid: "Lunas (Legacy)",
};

const allowedTransitions: Record<string, string[]> = {
  pending: ["assigned", "cancelled"],
  assigned: ["on_the_way", "cancelled"],
  on_the_way: ["in_progress", "cancelled"],
  in_progress: ["done", "cancelled"],
  done: [],
  paid: [],
  cancelled: [],
};

function toEditableItem(item: JobDetail["items"][number]): EditableItem {
  return {
    id: item.id,
    inventoryId: item.inventoryId,
    kind: item.kind,
    name: item.name,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    note: item.note,
  };
}

function createBlankItem(): EditableItem {
  return {
    id: createClientId("job-item"),
    inventoryId: null,
    kind: "service",
    name: "",
    quantity: 1,
    unitPrice: 0,
    note: "",
  };
}

async function fileToDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Gagal membaca file gambar."));
    reader.readAsDataURL(file);
  });
}

export default function JobDetailPage() {
  const { id } = useParams();
  const sessionQuery = useSessionQuery();
  const isTechnician = sessionQuery.data?.user.role === "technician";
  const jobQuery = useJobQuery(id);
  const updateJobMutation = useUpdateJobMutation(id);
  const createInvoiceMutation = useCreateInvoiceFromJobMutation(id);
  const techniciansQuery = useTechniciansQuery(!isTechnician);
  const customersQuery = useCustomersQuery(undefined, !isTechnician);
  const inventoryQuery = useInventoryQuery();
  const businessQuery = useBusinessQuery();
  const sendBusinessWhatsappMutation = useSendBusinessWhatsappMutation();

  const [status, setStatus] = useState("pending");
  const [technicianIds, setTechnicianIds] = useState<string[]>([]);
  const [cancelReason, setCancelReason] = useState("");
  const [deadlineAt, setDeadlineAt] = useState("");
  const [beforePhotoUrl, setBeforePhotoUrl] = useState<string | null>(null);
  const [afterPhotoUrl, setAfterPhotoUrl] = useState<string | null>(null);
  const [lineItems, setLineItems] = useState<EditableItem[]>([]);

  useEffect(() => {
    if (!jobQuery.data) {
      return;
    }

    setStatus(jobQuery.data.status);
    setTechnicianIds(jobQuery.data.technicianIds ?? (jobQuery.data.technicianId ? [jobQuery.data.technicianId] : []));
    setCancelReason(jobQuery.data.cancelReason ?? "");
    setDeadlineAt(jobQuery.data.deadlineAt ? new Date(jobQuery.data.deadlineAt).toISOString().slice(0, 16) : "");
    setBeforePhotoUrl(jobQuery.data.beforePhotoUrl ?? null);
    setAfterPhotoUrl(jobQuery.data.afterPhotoUrl ?? null);
    setLineItems(
      jobQuery.data.items.length > 0 ? jobQuery.data.items.map(toEditableItem) : [createBlankItem()],
    );
  }, [jobQuery.data]);

  if (jobQuery.isLoading) {
    return <PageLoader title="Memuat detail job..." />;
  }

  if (jobQuery.error || !jobQuery.data) {
    return <PageError message={getErrorMessage(jobQuery.error)} />;
  }

  const job = jobQuery.data;
  const technicians = techniciansQuery.data ?? [];
  const customers = customersQuery.data ?? [];
  const inventoryItems = inventoryQuery.data ?? [];
  const customer = customers.find((item) => item.id === job.customerId);
  const assignedTechnicians = technicians.filter((technician) => technicianIds.includes(technician.id));
  const allowedStatusOptions = new Set([job.status, ...(allowedTransitions[job.status] ?? [])]);
  const timeline = [
    job.completedAt ? ["Job selesai", job.completedAt] : null,
    ["Update terakhir", job.updatedAt ?? ""],
    ["Job dibuat", job.createdAt ?? ""],
  ].filter(Boolean) as Array<[string, string]>;
  const totalItemsValue = lineItems.reduce(
    (sum, item) => sum + Number(item.quantity || 0) * Number(item.unitPrice || 0),
    0,
  );
  const mapQuery = encodeURIComponent(job.location);
  const progressWhatsappLink = buildWhatsAppLink(
    customer?.phone,
    buildJobProgressMessage({
      businessName: businessQuery.data?.name,
      customerName: customer?.name ?? job.customer,
      jobNumber: job.number,
      jobTitle: job.title,
      status: statusLabels[status] ?? status,
      schedule: job.schedule,
      location: job.location,
      technicians: assignedTechnicians.map((item) => item.name),
    }),
  );
  const invoiceWhatsappLink =
    customer?.phone && job.invoice
      ? buildWhatsAppLink(
          customer.phone,
          buildInvoiceMessage({
            businessName: businessQuery.data?.name,
            customerName: customer.name,
            invoiceNumber: job.invoice.number,
            total: job.invoice.totalLabel,
            dueDate: job.invoice.dueDateLabel,
            status: job.invoice.status,
            jobLabel: `${job.number} · ${job.title}`,
          }),
        )
      : null;
  const canUseWahaAutomation = businessQuery.data?.whatsapp?.canUseAutomation ?? false;

  function updateLineItem(idToUpdate: string, patch: Partial<EditableItem>) {
    setLineItems((current) =>
      current.map((item) => {
        if (item.id !== idToUpdate) {
          return item;
        }

        const nextItem = { ...item, ...patch };
        if (nextItem.kind !== "sparepart") {
          nextItem.inventoryId = null;
        }

        return nextItem;
      }),
    );
  }

  function handleInventorySelect(itemId: string, inventoryId: string) {
    const selectedInventory = inventoryItems.find((item) => item.id === inventoryId);
    if (!selectedInventory) {
      updateLineItem(itemId, { inventoryId: null });
      return;
    }

    updateLineItem(itemId, {
      inventoryId,
      name: selectedInventory.name,
      unitPrice: selectedInventory.sellPriceValue,
    });
  }

  async function handlePhotoUpload(
    event: ChangeEvent<HTMLInputElement>,
    side: "before" | "after",
  ) {
    const file = event.target.files?.[0];
    if (!file) return;
    const dataUrl = await fileToDataUrl(file);
    if (side === "before") {
      setBeforePhotoUrl(dataUrl);
    } else {
      setAfterPhotoUrl(dataUrl);
    }
  }

  async function handleUpdateStatus() {
    const payloadItems = lineItems
      .filter((item) => item.name.trim())
      .map((item) => ({
        inventoryId: item.kind === "sparepart" ? item.inventoryId || null : null,
        kind: item.kind,
        name: item.name.trim(),
        quantity: Number(item.quantity) || 1,
        unitPrice: Number(item.unitPrice) || 0,
        note: item.note?.trim() || undefined,
      }));

    const payload = isTechnician
      ? {
          status,
          cancelReason: status === "cancelled" ? cancelReason : null,
          beforePhotoUrl,
          afterPhotoUrl,
          items: payloadItems,
        }
      : {
          status,
          technicianIds,
          cancelReason: status === "cancelled" ? cancelReason : null,
          deadlineAt: deadlineAt || null,
          beforePhotoUrl,
          afterPhotoUrl,
          items: payloadItems,
          price: totalItemsValue > 0 ? totalItemsValue : undefined,
        };

    await updateJobMutation.mutateAsync(payload);
  }

  async function handleCreateInvoice() {
    await createInvoiceMutation.mutateAsync();
  }

  function handlePrintInvoice() {
    if (!job.invoice) {
      return;
    }

    printInvoice({
      business: businessQuery.data,
      invoice: {
        number: job.invoice.number,
        customer: job.customer,
        job: job.number,
        total: job.invoice.totalLabel,
        status: job.invoice.status as "Draft" | "Sent" | "Paid" | "Overdue",
        dueDate: job.invoice.dueDateLabel,
      },
      job,
    });
  }

  async function handleSendCustomerAutoMessage(kind: "progress" | "invoice") {
    if (!customer?.phone) {
      return;
    }

    const messageLines =
      kind === "invoice"
        ? buildInvoiceMessage({
            businessName: businessQuery.data?.name,
            customerName: customer.name ?? job.customer,
            invoiceNumber: job.invoice?.number ?? `${job.number}-INV`,
            total: job.invoice?.totalLabel ?? formatRupiah(totalItemsValue || 0),
            dueDate: job.invoice?.dueDateLabel ?? "Segera",
            status: job.invoice?.status ?? "Belum dibuat",
            jobLabel: `${job.number} · ${job.title}`,
          })
        : buildJobProgressMessage({
            businessName: businessQuery.data?.name,
            customerName: customer.name ?? job.customer,
            jobNumber: job.number,
            jobTitle: job.title,
            status: statusLabels[status] ?? status,
            schedule: job.schedule,
            location: job.location,
            technicians: assignedTechnicians.map((item) => item.name),
          });

    await sendBusinessWhatsappMutation.mutateAsync({
      phone: customer.phone,
      message: messageLines.join("\n"),
    });
  }

  async function handleSendTechnicianAutoMessage(technicianId: string) {
    const technician = assignedTechnicians.find((item) => item.id === technicianId);
    if (!technician?.phone) {
      return;
    }

    await sendBusinessWhatsappMutation.mutateAsync({
      phone: technician.phone,
      message: buildTechnicianTaskMessage({
        businessName: businessQuery.data?.name,
        technicianName: technician.name,
        jobNumber: job.number,
        jobTitle: job.title,
        status: statusLabels[status] ?? status,
        schedule: job.schedule,
        location: job.location,
        customerName: customer?.name ?? job.customer,
      }).join("\n"),
    });
  }

  const statusSteps = [
    { key: "pending", label: "Menunggu" },
    { key: "assigned", label: "Ditugaskan" },
    { key: "on_the_way", label: "Ojek" },
    { key: "in_progress", label: "Proses" },
    { key: "done", label: "Selesai" },
  ];

  const currentStepIndex = statusSteps.findIndex((s) => s.key === job.status);

  return (
    <div className="page-stack">
      <div className="button-row button-row--left" style={{ marginBottom: "-8px" }}>
        <Link to="/jobs" className="ghost-button">&larr; Kembali ke Jobs</Link>
      </div>

      <div className="status-steps">
        {statusSteps.map((s, idx) => {
          const isCompleted = idx < currentStepIndex || job.status === "done";
          const isActive = idx === currentStepIndex && job.status !== "done";
          
          return (
            <div key={s.key} className={`status-step ${isCompleted ? "status-step--completed" : ""} ${isActive ? "status-step--active" : ""}`}>
              <strong>{s.label}</strong>
              <div className="status-step__bar">
                <div className="status-step__fill" style={{ transform: isCompleted ? "translateX(0)" : isActive ? "translateX(-50%)" : "translateX(-100%)" }} />
              </div>
            </div>
          );
        })}
      </div>

      <SectionCard
        title={`${job.number} · ${job.title}`}
        action={
          <div className="badge-row">
            <Badge tone={job.status === "done" || job.status === "paid" ? "success" : job.status === "cancelled" ? "danger" : "info"}>
              {statusLabels[job.status] ?? job.status}
            </Badge>
            <Badge tone="warning">{job.priority ?? "Normal"}</Badge>
          </div>
        }
      >
        <p className="lead-text">{job.description || "Belum ada deskripsi pekerjaan."}</p>
      </SectionCard>

      <div className="cards-grid cards-grid--detail-summary">
        <article className="sub-card">
          <span>Pelanggan</span>
          <strong>{job.customer}</strong>
          <small>{job.location}</small>
        </article>
        <article className="sub-card">
          <span>Teknisi</span>
          <strong>{job.technicians.length > 0 ? job.technicians.join(", ") : "Belum ditugaskan"}</strong>
          <small>{job.type}</small>
        </article>
        <article className="sub-card">
          <span>Invoice</span>
          <strong>{job.invoice?.number ?? "Belum ada"}</strong>
          <small>{job.invoice?.status ?? "Belum dibuat"}</small>
        </article>
        <article className="sub-card">
          <span>Nilai job</span>
          <strong>{formatRupiah(totalItemsValue || 0)}</strong>
          <small>{job.schedule}</small>
        </article>
      </div>

      <div className="page-stack">
        <div className="split-grid">
          <SectionCard
            title="Pelanggan"
          >
            <div className="detail-pair">
              <strong>{job.customer}</strong>
              <span>{job.schedule}</span>
              <span>{job.location}</span>
            </div>
          </SectionCard>
          <SectionCard title="Teknisi">
            <div className="detail-pair">
              <strong>{job.technicians.length > 0 ? job.technicians.join(", ") : "Belum ditugaskan"}</strong>
              <span>Jenis pekerjaan: {job.type}</span>
              <span>Priority: {job.priority}</span>
            </div>
          </SectionCard>
        </div>

        <div className="detail-grid detail-grid--soft">
          <div className="detail-grid__main">
            <SectionCard title="Timeline">
              <div className="timeline-list">
                {timeline.map(([label, time]) => (
                  <div key={label} className="timeline-list__item">
                    <span className="timeline-list__dot" />
                    <div>
                      <strong>{label}</strong>
                      <small>{time || "-"}</small>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Before / After Photo" description="Dokumentasi visual untuk owner dan pelanggan.">
              <div className="photo-grid">
                <div className="photo-card">
                  {beforePhotoUrl ? <img src={beforePhotoUrl} alt="Before" className="photo-card__image" /> : <div className="photo-box">Before Photo</div>}
                  <div className="photo-card__actions">
                    <label className="btn btn--inverse-soft btn--small">
                      {beforePhotoUrl ? "Ganti" : "Upload"}
                      <input type="file" accept="image/*" hidden onChange={(event) => void handlePhotoUpload(event, "before")} />
                    </label>
                    {beforePhotoUrl ? (
                      <button className="btn btn--secondary btn--small" onClick={() => setBeforePhotoUrl(null)}>Hapus</button>
                    ) : null}
                  </div>
                </div>
                <div className="photo-card">
                  {afterPhotoUrl ? <img src={afterPhotoUrl} alt="After" className="photo-card__image" /> : <div className="photo-box photo-box--success">After Photo</div>}
                  <div className="photo-card__actions">
                    <label className="btn btn--inverse-soft btn--small">
                      {afterPhotoUrl ? "Ganti" : "Upload"}
                      <input type="file" accept="image/*" hidden onChange={(event) => void handlePhotoUpload(event, "after")} />
                    </label>
                    {afterPhotoUrl ? (
                      <button className="btn btn--secondary btn--small" onClick={() => setAfterPhotoUrl(null)}>Hapus</button>
                    ) : null}
                  </div>
                </div>
              </div>
            </SectionCard>

            <SectionCard title="Item Service & Sparepart" description="Tambahkan jasa dan sparepart yang dipakai. Sparepart akan otomatis mengurangi stok inventori.">
              <div className="job-items-editor">
                {lineItems.map((item) => (
                  <div key={item.id} className="job-item-card">
                    <div className="field-grid">
                      <label className="field">
                        <span>Tipe</span>
                        <select
                          value={item.kind}
                          onChange={(event) => updateLineItem(item.id, { kind: event.target.value as "service" | "sparepart" })}
                        >
                          <option value="service">Service</option>
                          <option value="sparepart">Sparepart</option>
                        </select>
                      </label>
                      {inventoryItems.length > 0 ? (
                        <label className="field">
                          <span>{item.kind === "sparepart" ? "Pilih barang" : "Pilih jasa (opsional)"}</span>
                          <select 
                            value={item.inventoryId ?? ""} 
                            onChange={(event) => handleInventorySelect(item.id, event.target.value)}
                          >
                            <option value="">{item.kind === "sparepart" ? "Pilih sparepart" : "Input manual / Pilih master jasa"}</option>
                            {inventoryItems
                              .filter((inv) => item.kind === "service" ? inv.category === "Jasa" : inv.category !== "Jasa")
                              .map((inventoryItem) => (
                                <option key={inventoryItem.id} value={inventoryItem.id}>
                                  {inventoryItem.name} · {item.kind === "sparepart" ? `stok ${inventoryItem.stock}` : `Service Master (${inventoryItem.sellPrice})`}
                                </option>
                              ))}
                          </select>
                        </label>
                      ) : (
                        <label className="field">
                          <span>Nama item</span>
                          <input value={item.name} onChange={(event) => updateLineItem(item.id, { name: event.target.value })} />
                        </label>
                      )}
                    </div>
                    <div className="field-grid">
                      <label className="field">
                        <span>{item.kind === "sparepart" ? "Nama tampilan" : "Nama item"}</span>
                        <input value={item.name} onChange={(event) => updateLineItem(item.id, { name: event.target.value })} />
                      </label>
                      <label className="field">
                        <span>Qty</span>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(event) => updateLineItem(item.id, { quantity: Number(event.target.value) || 1 })}
                        />
                      </label>
                    </div>
                    <div className="field-grid">
                      <label className="field">
                        <span>Harga satuan</span>
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice}
                          onChange={(event) => updateLineItem(item.id, { unitPrice: Number(event.target.value) || 0 })}
                        />
                      </label>
                      <label className="field">
                        <span>Catatan</span>
                        <input value={item.note ?? ""} onChange={(event) => updateLineItem(item.id, { note: event.target.value })} />
                      </label>
                    </div>
                    <div className="job-item-card__footer">
                      <strong>{formatRupiah(item.quantity * item.unitPrice)}</strong>
                      <EmptyAction onClick={() => setLineItems((current) => current.filter((entry) => entry.id !== item.id))}>
                        Hapus Item
                      </EmptyAction>
                    </div>
                  </div>
                ))}
              </div>
              <div className="button-row button-row--left">
                <EmptyAction onClick={() => setLineItems((current) => [...current, createBlankItem()])}>
                  + Tambah Item
                </EmptyAction>
                <div className="field-like field-like--summary">Nilai service: {formatRupiah(totalItemsValue || 0)}</div>
              </div>
            </SectionCard>

            {!isTechnician ? (
            <SectionCard title="WhatsApp Manual" description="Kirim update kerja, invoice, dan reminder tugas lewat WhatsApp secara manual tanpa bot.">
            <div className="action-stack">
              <div className="callout callout--success">
                <div>
                  <strong>Client</strong>
                  <p>{customer?.name ?? job.customer} · {customer?.phone ?? "Nomor belum tersedia"}</p>
                </div>
              </div>
              <div className="button-row button-row--left">
                {progressWhatsappLink ? (
                  <a className="btn btn--secondary" href={progressWhatsappLink} target="_blank" rel="noreferrer">
                    Kirim Progress ke Client
                  </a>
                ) : (
                  <span className="form-helper">Nomor client belum tersedia untuk kirim progress.</span>
                )}
                {invoiceWhatsappLink ? (
                  <a className="btn btn--secondary" href={invoiceWhatsappLink} target="_blank" rel="noreferrer">
                    Kirim Invoice ke Client
                  </a>
                ) : null}
              </div>

              <div className="callout">
                <div>
                  <strong>Reminder teknisi</strong>
                  <p>Kirim ringkasan job dan lokasi langsung ke teknisi yang ditugaskan.</p>
                </div>
              </div>
              <div className="whatsapp-share-grid">
                {assignedTechnicians.length > 0 ? (
                  assignedTechnicians.map((technician) => {
                    const technicianWhatsappLink = buildWhatsAppLink(
                      technician.phone,
                      buildTechnicianTaskMessage({
                        businessName: businessQuery.data?.name,
                        technicianName: technician.name,
                        jobNumber: job.number,
                        jobTitle: job.title,
                        status: statusLabels[status] ?? status,
                        schedule: job.schedule,
                        location: job.location,
                        customerName: customer?.name ?? job.customer,
                      }),
                    );

                    return (
                      <div key={technician.id} className="whatsapp-share-card">
                        <strong>{technician.name}</strong>
                        <span>{technician.phone}</span>
                        {technicianWhatsappLink ? (
                          <a className="btn btn--secondary" href={technicianWhatsappLink} target="_blank" rel="noreferrer">
                            Kirim Tugas via WA
                          </a>
                        ) : (
                          <span className="form-helper">Nomor WA belum valid.</span>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p className="form-helper">Pilih teknisi dulu di Action Panel agar reminder tugas bisa dikirim.</p>
                )}
              </div>
            </div>
          </SectionCard>
            ) : null}

            {!isTechnician ? (
            <SectionCard title="WhatsApp Otomatis WAHA" description="Jika WAHA sudah terhubung, kirim pesan otomatis ke client dan teknisi langsung dari detail job.">
            <div className="action-stack">
              {!canUseWahaAutomation ? (
                <div className="callout callout--warning">
                  <strong>WAHA belum siap dipakai</strong>
                  <p>Aktifkan mode Otomasi WAHA dan hubungkan nomor bisnis lebih dulu dari halaman Hubungkan WAHA.</p>
                </div>
              ) : null}

              <div className="summary-list">
                <div><span>Status WAHA</span><strong>{businessQuery.data?.whatsapp?.automationStatusLabel ?? "Belum aktif"}</strong></div>
                <div><span>Client</span><strong>{customer?.name ?? job.customer}</strong></div>
                <div><span>Tim teknisi</span><strong>{assignedTechnicians.map((item) => item.name).join(", ") || "Belum ada teknisi"}</strong></div>
              </div>

              <div className="button-row button-row--left">
                <EmptyAction
                  primary
                  onClick={() => void handleSendCustomerAutoMessage("progress")}
                  disabled={!canUseWahaAutomation || sendBusinessWhatsappMutation.isPending || !customer?.phone}
                >
                  {sendBusinessWhatsappMutation.isPending ? "Mengirim..." : "Kirim Progress ke Client"}
                </EmptyAction>
                <EmptyAction
                  onClick={() => void handleSendCustomerAutoMessage("invoice")}
                  disabled={!canUseWahaAutomation || sendBusinessWhatsappMutation.isPending || !customer?.phone || !job.invoice}
                >
                  {sendBusinessWhatsappMutation.isPending ? "Mengirim..." : "Kirim Invoice ke Client"}
                </EmptyAction>
              </div>

              <div className="whatsapp-share-grid">
                {assignedTechnicians.length > 0 ? (
                  assignedTechnicians.map((technician) => (
                    <div key={technician.id} className="whatsapp-share-card">
                      <strong>{technician.name}</strong>
                      <span>{technician.phone}</span>
                      <EmptyAction
                        onClick={() => void handleSendTechnicianAutoMessage(technician.id)}
                        disabled={!canUseWahaAutomation || sendBusinessWhatsappMutation.isPending || !technician.phone}
                      >
                        {sendBusinessWhatsappMutation.isPending ? "Mengirim..." : "Kirim Tugas Otomatis"}
                      </EmptyAction>
                    </div>
                  ))
                ) : (
                  <p className="form-helper">Belum ada teknisi yang ditugaskan untuk job ini.</p>
                )}
              </div>

              {sendBusinessWhatsappMutation.error ? <p className="form-error">{getErrorMessage(sendBusinessWhatsappMutation.error)}</p> : null}
            </div>
            </SectionCard>
            ) : null}
          </div>

          <div className="detail-grid__side">
            <SectionCard
              title={isTechnician ? "Panel Teknisi" : "Action Panel"}
              description={
                isTechnician
                  ? "Update progres lapangan dan dokumentasi job tanpa membuka kontrol manajerial."
                  : "Ubah status job, assign teknisi, dan simpan detail lapangan."
              }
            >
            <div className="action-stack">
              <label className="field">
                <span>Status job</span>
                <select className="field-like align-left" value={status} onChange={(event) => setStatus(event.target.value)}>
                  {Object.entries(statusLabels)
                    .filter(([value]) => value !== "paid" || status === "paid")
                    .map(([value, label]) => (
                    <option key={value} value={value} disabled={!allowedStatusOptions.has(value)}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
              {!isTechnician ? (
              <div className="field">
                <span>Tim teknisi</span>
                <div className="technician-checklist">
                  {technicians.map((technician) => {
                    const checked = technicianIds.includes(technician.id);
                    const initials = technician.name
                      .split(" ")
                      .map((n) => n[0])
                      .slice(0, 2)
                      .join("")
                      .toUpperCase();
                      
                    return (
                      <label key={technician.id} className={`technician-chip ${checked ? "technician-chip--active" : ""}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(event) =>
                            setTechnicianIds((current) =>
                              event.target.checked
                                ? [...current, technician.id]
                                : current.filter((item) => item !== technician.id),
                            )
                          }
                        />
                        <div className="technician-chip__avatar">{initials}</div>
                        <span>{technician.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              ) : null}
              {status === "cancelled" ? (
                <label className="field">
                  <span>Alasan pembatalan</span>
                  <textarea value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} />
                </label>
              ) : null}
              {!isTechnician ? (
              <label className="field">
                <span>Deadline tugas</span>
                <input type="datetime-local" value={deadlineAt} onChange={(event) => setDeadlineAt(event.target.value)} />
              </label>
              ) : null}
               <button className={`btn ${isTechnician ? "btn--primary" : "btn--secondary"}`} onClick={() => void handleUpdateStatus()} disabled={updateJobMutation.isPending}>
                {updateJobMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
              {!isTechnician ? (
              <button
                className="btn btn--secondary"
                onClick={() => void handleCreateInvoice()}
                disabled={createInvoiceMutation.isPending || Boolean(job.invoice) || job.status === "cancelled"}
              >
                {createInvoiceMutation.isPending
                  ? "Membuat..."
                  : job.invoice
                    ? "Invoice Sudah Ada"
                    : "Buat Invoice"}
              </button>
              ) : null}
              {!isTechnician ? (
              <EmptyAction onClick={handlePrintInvoice} disabled={!job.invoice}>
                Simpan PDF Invoice
              </EmptyAction>
              ) : null}
              {!isTechnician ? job.status === "cancelled" ? (
                <p className="form-helper">Invoice tidak bisa dibuat dari job yang dibatalkan.</p>
              ) : (
                <p className="form-helper">Pembayaran invoice terpisah dari status job. Job selesai tidak otomatis membuat invoice lunas.</p>
              ) : (
                <p className="form-helper">Akun teknisi hanya bisa memperbarui progres lapangan, foto dokumentasi, dan item pekerjaan.</p>
              )}
            </div>
            </SectionCard>

            <SectionCard title="Map Preview" description="Preview lokasi pekerjaan untuk cek area servis dengan cepat.">
            <div className="map-preview map-preview--embed">
              <iframe
                title={`Map ${job.location}`}
                src={`https://www.google.com/maps?q=${mapQuery}&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
            <a className="inline-link" href={`https://www.google.com/maps/search/?api=1&query=${mapQuery}`} target="_blank" rel="noreferrer">
              Buka di Google Maps
            </a>
            </SectionCard>

            <SectionCard title="Ringkasan Operasional">
              <div className="summary-list">
                <div><span>Dibuat</span><strong>{job.createdAt ?? "-"}</strong></div>
                <div><span>Dijadwalkan</span><strong>{job.schedule}</strong></div>
                <div><span>Deadline</span><strong>{job.deadlineAt ? new Date(job.deadlineAt).toLocaleString("id-ID") : "Belum diatur"}</strong></div>
                <div><span>Update terakhir</span><strong>{job.updatedAt ?? "-"}</strong></div>
              </div>
              {updateJobMutation.error ? <p className="form-error">{getErrorMessage(updateJobMutation.error)}</p> : null}
              {createInvoiceMutation.error ? <p className="form-error">{getErrorMessage(createInvoiceMutation.error)}</p> : null}
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}

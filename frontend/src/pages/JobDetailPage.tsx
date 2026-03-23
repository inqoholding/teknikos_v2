import { ChangeEvent, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import {
  useBusinessQuery,
  useCreateInvoiceFromJobMutation,
  useCustomersQuery,
  useInventoryQuery,
  useJobQuery,
  useTechniciansQuery,
  useUpdateJobMutation,
} from "../api/hooks";
import type { JobDetail } from "../api/types";
import { Badge, EmptyAction, SectionCard } from "../components/UI";
import { PageError, PageLoader } from "../components/PageState";
import { printInvoice } from "../utils/invoicePrint";
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
    id: crypto.randomUUID(),
    inventoryId: null,
    kind: "service",
    name: "",
    quantity: 1,
    unitPrice: 0,
    note: "",
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);
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
  const jobQuery = useJobQuery(id);
  const updateJobMutation = useUpdateJobMutation(id);
  const createInvoiceMutation = useCreateInvoiceFromJobMutation(id);
  const techniciansQuery = useTechniciansQuery();
  const customersQuery = useCustomersQuery();
  const inventoryQuery = useInventoryQuery();
  const businessQuery = useBusinessQuery();

  const [status, setStatus] = useState("pending");
  const [technicianIds, setTechnicianIds] = useState<string[]>([]);
  const [cancelReason, setCancelReason] = useState("");
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

    await updateJobMutation.mutateAsync({
      status,
      technicianIds,
      cancelReason: status === "cancelled" ? cancelReason : null,
      beforePhotoUrl,
      afterPhotoUrl,
      items: payloadItems,
      price: totalItemsValue > 0 ? totalItemsValue : undefined,
    });
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

  return (
    <div className="page-stack">
      <div className="detail-grid">
        <div className="detail-grid__main">
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

          <div className="split-grid">
            <SectionCard title="Pelanggan">
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

          <SectionCard title="Before / After Photo" description="Upload dokumentasi kerja agar owner dan pelanggan punya bukti visual yang rapi.">
            <div className="photo-grid">
              <div className="photo-card">
                {beforePhotoUrl ? <img src={beforePhotoUrl} alt="Before service" className="photo-card__image" /> : <div className="photo-box">Before</div>}
                <div className="photo-card__actions">
                  <label className="btn btn--secondary">
                    Upload Before
                    <input type="file" accept="image/*" hidden onChange={(event) => void handlePhotoUpload(event, "before")} />
                  </label>
                  {beforePhotoUrl ? (
                    <EmptyAction onClick={() => setBeforePhotoUrl(null)}>Hapus</EmptyAction>
                  ) : null}
                </div>
              </div>
              <div className="photo-card">
                {afterPhotoUrl ? <img src={afterPhotoUrl} alt="After service" className="photo-card__image" /> : <div className="photo-box photo-box--success">After</div>}
                <div className="photo-card__actions">
                  <label className="btn btn--secondary">
                    Upload After
                    <input type="file" accept="image/*" hidden onChange={(event) => void handlePhotoUpload(event, "after")} />
                  </label>
                  {afterPhotoUrl ? (
                    <EmptyAction onClick={() => setAfterPhotoUrl(null)}>Hapus</EmptyAction>
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
                    {item.kind === "sparepart" ? (
                      <label className="field">
                        <span>Barang inventori</span>
                        <select value={item.inventoryId ?? ""} onChange={(event) => handleInventorySelect(item.id, event.target.value)}>
                          <option value="">Pilih sparepart</option>
                          {inventoryItems.map((inventoryItem) => (
                            <option key={inventoryItem.id} value={inventoryItem.id}>
                              {inventoryItem.name} · stok {inventoryItem.stock}
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
                    <strong>{formatCurrency(item.quantity * item.unitPrice)}</strong>
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
              <div className="field-like field-like--summary">Nilai service: {formatCurrency(totalItemsValue || 0)}</div>
            </div>
          </SectionCard>
        </div>

        <div className="detail-grid__side">
          <SectionCard title="Action Panel" description="Ubah status job, assign teknisi, dan simpan detail lapangan.">
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
              <div className="field">
                <span>Tim teknisi</span>
                <div className="technician-checklist">
                  {technicians.map((technician) => {
                    const checked = technicianIds.includes(technician.id);
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
                        <span>{technician.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
              {status === "cancelled" ? (
                <label className="field">
                  <span>Alasan pembatalan</span>
                  <textarea value={cancelReason} onChange={(event) => setCancelReason(event.target.value)} />
                </label>
              ) : null}
              <button className="btn btn--secondary" onClick={() => void handleUpdateStatus()} disabled={updateJobMutation.isPending}>
                {updateJobMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
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
              <EmptyAction onClick={handlePrintInvoice} disabled={!job.invoice}>
                Simpan PDF Invoice
              </EmptyAction>
              {job.status === "cancelled" ? (
                <p className="form-helper">Invoice tidak bisa dibuat dari job yang dibatalkan.</p>
              ) : (
                <p className="form-helper">Pembayaran invoice terpisah dari status job. Job selesai tidak otomatis membuat invoice lunas.</p>
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

          <SectionCard title="Ringkasan">
            <div className="summary-list">
              <div><span>Dibuat</span><strong>{job.createdAt ?? "-"}</strong></div>
              <div><span>Dijadwalkan</span><strong>{job.schedule}</strong></div>
              <div><span>Update terakhir</span><strong>{job.updatedAt ?? "-"}</strong></div>
              <div><span>Nilai job</span><strong>{formatCurrency(totalItemsValue || 0)}</strong></div>
              <div><span>Invoice</span><strong>{job.invoice?.number ?? "Belum ada"}</strong></div>
            </div>
            {updateJobMutation.error ? <p className="form-error">{getErrorMessage(updateJobMutation.error)}</p> : null}
            {createInvoiceMutation.error ? <p className="form-error">{getErrorMessage(createInvoiceMutation.error)}</p> : null}
          </SectionCard>

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
        </div>
      </div>
    </div>
  );
}

import { FormEvent, useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { useBusinessQuery, useCreateCustomerMutation, useCustomersQuery, useSendBusinessWhatsappMutation } from "../api/hooks";
import { PageError, PageLoader } from "../components/PageState";
import { Badge, EmptyAction, SectionCard } from "../components/UI";
import { buildCustomerFollowUpMessage } from "../utils/whatsapp";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [crmFilter, setCrmFilter] = useState<"all" | "contracts" | "follow_up" | "billing">("all");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [units, setUnits] = useState("");
  const deferredSearch = useDeferredValue(search);
  const createCustomerMutation = useCreateCustomerMutation();
  const businessQuery = useBusinessQuery();
  const sendBusinessWhatsappMutation = useSendBusinessWhatsappMutation();
  const customersQuery = useCustomersQuery(
    deferredSearch.trim() ? { q: deferredSearch.trim() } : undefined,
  );

  if (customersQuery.isLoading) {
    return <PageLoader title="Memuat pelanggan..." />;
  }

  if (customersQuery.error || !customersQuery.data) {
    return <PageError message={getErrorMessage(customersQuery.error)} />;
  }

  const filteredCustomers = customersQuery.data;
  const contractsCount = filteredCustomers.filter((item) => item.contract !== "Tidak ada").length;
  const billingCount = filteredCustomers.filter((item) => item.health === "Butuh Billing").length;
  const followUpCount = filteredCustomers.filter((item) => item.health === "Perlu Follow Up").length;
  const canUseWahaAutomation = businessQuery.data?.whatsapp?.canUseAutomation ?? false;
  const visibleCustomers = useMemo(() => {
    if (crmFilter === "contracts") {
      return filteredCustomers.filter((item) => item.contract !== "Tidak ada");
    }
    if (crmFilter === "follow_up") {
      return filteredCustomers.filter((item) => item.health === "Perlu Follow Up");
    }
    if (crmFilter === "billing") {
      return filteredCustomers.filter((item) => item.health === "Butuh Billing");
    }
    return filteredCustomers;
  }, [crmFilter, filteredCustomers]);
  const activeFilterCopy =
    crmFilter === "contracts"
      ? "Menampilkan pelanggan dengan kontrak aktif atau relasi maintenance berjalan."
      : crmFilter === "follow_up"
        ? "Menampilkan pelanggan yang perlu follow up supaya tidak dingin terlalu lama."
        : crmFilter === "billing"
          ? "Menampilkan pelanggan dengan billing aktif atau piutang yang perlu ditagih."
          : "Menampilkan seluruh pelanggan yang lolos dari pencarian aktif.";

  function buildMapsLink(address: string) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }

  async function handleCreateCustomer(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createCustomerMutation.mutateAsync({
      name,
      phone,
      email,
      address,
      units: units
        .split("\n")
        .map((item) => item.trim())
        .filter(Boolean),
    });
    setName("");
    setPhone("");
    setEmail("");
    setAddress("");
    setUnits("");
    setShowCreate(false);
  }

  async function handleSendAutomaticFollowUp(customer: (typeof filteredCustomers)[number]) {
    await sendBusinessWhatsappMutation.mutateAsync({
      phone: customer.phone,
      message: buildCustomerFollowUpMessage({
        businessName: businessQuery.data?.name,
        customerName: customer.name,
        address: customer.address,
        lastService: customer.lastService,
        nextAction: customer.nextAction,
      }).join("\n"),
    });
  }

  return (
    <div className="page-stack">
      <div className="toolbar">
        <input
          className="toolbar__search"
          placeholder="Cari nama, WA, atau alamat"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
        <div className="toolbar__actions">
          <EmptyAction primary onClick={() => setShowCreate((current) => !current)}>
            {showCreate ? "Tutup Form" : "Tambah Pelanggan"}
          </EmptyAction>
        </div>
      </div>

      {showCreate ? (
        <SectionCard title="Pelanggan Baru">
          <form className="action-stack" onSubmit={handleCreateCustomer}>
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
                <span>Email</span>
                <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
              </label>
              <label className="field">
                <span>Alamat</span>
                <input value={address} onChange={(event) => setAddress(event.target.value)} required />
              </label>
            </div>
            <label className="field">
              <span>Unit pelanggan</span>
              <textarea
                value={units}
                onChange={(event) => setUnits(event.target.value)}
                placeholder="Satu unit per baris"
              />
            </label>
            {createCustomerMutation.error ? <p className="form-error">{getErrorMessage(createCustomerMutation.error)}</p> : null}
            <div className="button-row button-row--left">
              <EmptyAction onClick={() => setShowCreate(false)}>Batal</EmptyAction>
              <EmptyAction primary type="submit" disabled={createCustomerMutation.isPending}>
                {createCustomerMutation.isPending ? "Menyimpan..." : "Simpan Pelanggan"}
              </EmptyAction>
            </div>
          </form>
        </SectionCard>
      ) : null}

      <div className="cards-grid cards-grid--job-overview">
        <article className="sub-card">
          <span>Pelanggan tampil</span>
          <strong>{visibleCustomers.length}</strong>
          <small>Hasil filter aktif</small>
        </article>
        <article className="sub-card">
          <span>Kontrak aktif</span>
          <strong>{contractsCount}</strong>
          <small>Relasi maintenance aktif</small>
        </article>
        <article className="sub-card">
          <span>Perlu follow up</span>
          <strong>{followUpCount}</strong>
          <small>Pelanggan perlu dihubungi</small>
        </article>
        <article className="sub-card">
          <span>Butuh billing</span>
          <strong>{billingCount}</strong>
          <small>Piutang perlu ditagih</small>
        </article>
      </div>

      <div className="page-stack">
        <SectionCard title="Database Pelanggan">
          {crmFilter !== "all" ? (
            <div className="callout callout--success">
              <div>
                <strong>Filter CRM aktif</strong>
                <p>{activeFilterCopy}</p>
              </div>
              <button type="button" className="btn btn--secondary" onClick={() => setCrmFilter("all")}>
                Tampilkan semua
              </button>
            </div>
          ) : null}
          <div className="customer-list">
            {visibleCustomers.map((customer) => (
              <article key={customer.id} className="customer-card">
                <div className="customer-card__head">
                  <div>
                    <strong>{customer.name}</strong>
                    <p>{customer.address}</p>
                  </div>
                  <Link to={`/customers/${customer.id}`}>Detail</Link>
                </div>
                <div className="customer-card__meta">
                  <span>WA {customer.phone}</span>
                  <span>{customer.email || "Tanpa email"}</span>
                  <span>{customer.totalJobs} job</span>
                  <span>Servis terakhir {customer.lastService}</span>
                </div>
                <div className="customer-card__insights">
                  <button
                    type="button"
                    className="customer-card__insight-button"
                    onClick={() =>
                      setCrmFilter(
                        customer.health === "Butuh Billing"
                          ? "billing"
                          : customer.health === "Perlu Follow Up"
                            ? "follow_up"
                            : customer.contract !== "Tidak ada"
                              ? "contracts"
                              : "all",
                      )
                    }
                  >
                    <Badge
                      tone={
                        customer.health === "Butuh Billing"
                          ? "danger"
                          : customer.health === "Perlu Follow Up"
                            ? "warning"
                            : customer.health === "Kontrak Aktif"
                              ? "success"
                              : "info"
                      }
                    >
                      {customer.health}
                    </Badge>
                  </button>
                  <button
                    type="button"
                    className="customer-card__insight-chip"
                    onClick={() => setCrmFilter(customer.openInvoices > 0 ? "billing" : "all")}
                  >
                    {customer.openInvoices} invoice aktif
                  </button>
                  <button
                    type="button"
                    className="customer-card__insight-chip"
                    onClick={() => setCrmFilter(customer.health === "Butuh Billing" ? "billing" : "follow_up")}
                  >
                    Piutang {customer.balanceDue}
                  </button>
                </div>
                <div className="customer-card__units">
                  {customer.units.length > 0
                    ? customer.units.map((unit) => <span key={unit}>{unit}</span>)
                    : <span>Belum ada unit tercatat</span>}
                </div>
                <div className="customer-card__footer">
                  <span className={`mini-pill ${customer.contract === "Tidak ada" ? "mini-pill--neutral" : "mini-pill--success"}`}>
                    {customer.contract}
                  </span>
                  <p>{customer.nextAction}</p>
                </div>
                <div className="customer-card__actions">
                  <a className="btn btn--secondary" href={buildMapsLink(customer.address)} target="_blank" rel="noreferrer">
                    Buka Maps
                  </a>
                  <a className="btn btn--secondary" href={`https://wa.me/${customer.phone.replace(/[^\d]/g, "")}`} target="_blank" rel="noreferrer">
                    Chat WA
                  </a>
                  <EmptyAction
                    onClick={() => void handleSendAutomaticFollowUp(customer)}
                    disabled={!canUseWahaAutomation || sendBusinessWhatsappMutation.isPending || !customer.phone}
                  >
                    {sendBusinessWhatsappMutation.isPending ? "Mengirim..." : "Kirim Pesan Otomatis"}
                  </EmptyAction>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Insight CRM" description="Ringkasan CRM dipisah penuh agar tidak tenggelam di samping daftar pelanggan yang tinggi.">
          <div className="ops-grid ops-grid--compact">
            <button
              type="button"
              className={`ops-queue-card ops-queue-card--success crm-insight-card ${crmFilter === "contracts" ? "crm-insight-card--active" : ""}`}
              onClick={() => setCrmFilter((current) => (current === "contracts" ? "all" : "contracts"))}
              aria-pressed={crmFilter === "contracts"}
            >
              <div className="ops-queue-card__count">{contractsCount}</div>
              <strong>Kontrak Aktif</strong>
              <p>Pelanggan yang sudah punya relasi maintenance yang lebih stabil.</p>
              <span>{crmFilter === "contracts" ? "Klik untuk reset" : "Klik untuk filter"}</span>
            </button>
            <button
              type="button"
              className={`ops-queue-card ops-queue-card--warning crm-insight-card ${crmFilter === "follow_up" ? "crm-insight-card--active" : ""}`}
              onClick={() => setCrmFilter((current) => (current === "follow_up" ? "all" : "follow_up"))}
              aria-pressed={crmFilter === "follow_up"}
            >
              <div className="ops-queue-card__count">{followUpCount}</div>
              <strong>Perlu Follow Up</strong>
              <p>Pelanggan lama atau kontrak mendekati jatuh tempo yang perlu dihubungi.</p>
              <span>{crmFilter === "follow_up" ? "Klik untuk reset" : "Klik untuk filter"}</span>
            </button>
            <button
              type="button"
              className={`ops-queue-card ops-queue-card--danger crm-insight-card ${crmFilter === "billing" ? "crm-insight-card--active" : ""}`}
              onClick={() => setCrmFilter((current) => (current === "billing" ? "all" : "billing"))}
              aria-pressed={crmFilter === "billing"}
            >
              <div className="ops-queue-card__count">{billingCount}</div>
              <strong>Butuh Billing</strong>
              <p>Piutang dan reminder invoice yang perlu dikerjakan owner hari ini.</p>
              <span>{crmFilter === "billing" ? "Klik untuk reset" : "Klik untuk filter"}</span>
            </button>
          </div>
          {visibleCustomers.length === 0 ? (
            <div className="callout">
              <div>
                <strong>Tidak ada pelanggan pada filter ini</strong>
                <p>Ubah filter CRM atau pencarian untuk melihat segmen pelanggan lain.</p>
              </div>
            </div>
          ) : null}
          <div className="callout callout--success">
            <div>
              <strong>Peluang upsell</strong>
              <p>{visibleCustomers.length} pelanggan aktif sekarang sudah punya playbook next action dari data live backend.</p>
            </div>
          </div>
          <div className="callout callout--warning">
            <div>
              <strong>Pola ala FSM modern</strong>
              <p>CRM sekarang tidak cuma daftar pelanggan, tapi juga health, piutang, dan saran follow-up seperti aplikasi field service yang lebih matang.</p>
            </div>
          </div>
          {!canUseWahaAutomation ? (
            <p className="form-helper">Tombol kirim pesan otomatis aktif jika mode Otomasi WAHA sudah terhubung.</p>
          ) : null}
          {sendBusinessWhatsappMutation.error ? <p className="form-error">{getErrorMessage(sendBusinessWhatsappMutation.error)}</p> : null}
        </SectionCard>
      </div>
    </div>
  );
}

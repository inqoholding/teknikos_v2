import { FormEvent, useDeferredValue, useState } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { useCreateCustomerMutation, useCustomersQuery } from "../api/hooks";
import { PageError, PageLoader } from "../components/PageState";
import { Badge, EmptyAction, SectionCard } from "../components/UI";

export default function CustomersPage() {
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [units, setUnits] = useState("");
  const deferredSearch = useDeferredValue(search);
  const createCustomerMutation = useCreateCustomerMutation();
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

      <div className="dashboard-grid">
        <SectionCard title="Database Pelanggan">
          <div className="customer-list">
            {filteredCustomers.map((customer) => (
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
                  <span>{customer.openInvoices} invoice aktif</span>
                  <span>Piutang {customer.balanceDue}</span>
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
                </div>
              </article>
            ))}
          </div>
        </SectionCard>
        <SectionCard title="Insight CRM">
          <div className="ops-grid ops-grid--compact">
            <article className="ops-queue-card ops-queue-card--success">
              <div className="ops-queue-card__count">{contractsCount}</div>
              <strong>Kontrak Aktif</strong>
              <p>Pelanggan yang sudah punya relasi maintenance yang lebih stabil.</p>
              <span>Retensi lebih sehat</span>
            </article>
            <article className="ops-queue-card ops-queue-card--warning">
              <div className="ops-queue-card__count">{followUpCount}</div>
              <strong>Perlu Follow Up</strong>
              <p>Pelanggan lama atau kontrak mendekati jatuh tempo yang perlu dihubungi.</p>
              <span>Jangan dingin terlalu lama</span>
            </article>
            <article className="ops-queue-card ops-queue-card--danger">
              <div className="ops-queue-card__count">{billingCount}</div>
              <strong>Butuh Billing</strong>
              <p>Piutang dan reminder invoice yang perlu dikerjakan owner hari ini.</p>
              <span>Jaga cashflow</span>
            </article>
          </div>
          <div className="callout callout--success">
            <div>
              <strong>Peluang upsell</strong>
              <p>{filteredCustomers.length} pelanggan aktif sekarang sudah punya playbook next action dari data live backend.</p>
            </div>
          </div>
          <div className="callout callout--warning">
            <div>
              <strong>Pola ala FSM modern</strong>
              <p>CRM sekarang tidak cuma daftar pelanggan, tapi juga health, piutang, dan saran follow-up seperti aplikasi field service yang lebih matang.</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

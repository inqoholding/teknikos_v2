import { FormEvent, useState } from "react";
import { getErrorMessage, isApiErrorStatus } from "../api/client";
import { useBusinessQuery, useContractsQuery, useCreateContractMutation, useCustomersQuery } from "../api/hooks";
import { PageError, PageLoader } from "../components/PageState";
import { Badge, EmptyAction, SectionCard, StatCard } from "../components/UI";

const presets = [
  { label: "Maintenance AC Bulanan", interval: "Bulanan", unitCount: "4", value: "1200000" },
  { label: "Quarterly Office Visit", interval: "3 Bulan", unitCount: "8", value: "3500000" },
  { label: "Kontrak Instalasi Tahunan", interval: "Tahunan", unitCount: "12", value: "8500000" },
];

export default function ContractsPage() {
  const businessQuery = useBusinessQuery();
  const contractsQuery = useContractsQuery();
  const customersQuery = useCustomersQuery();
  const createContractMutation = useCreateContractMutation();
  const [showCreate, setShowCreate] = useState(false);
  const [customerId, setCustomerId] = useState("");
  const [plan, setPlan] = useState("");
  const [serviceInterval, setServiceInterval] = useState("Bulanan");
  const [unitCount, setUnitCount] = useState("1");
  const [value, setValue] = useState("0");
  const [nextServiceAt, setNextServiceAt] = useState("");
  const contracts = contractsQuery.data ?? [];
  const focusContract = contracts.find((item) => item.status === "Hampir Jatuh Tempo") ?? contracts[0];

  if (contractsQuery.isLoading) {
    return <PageLoader title="Memuat kontrak..." />;
  }

  if (isApiErrorStatus(contractsQuery.error, 403)) {
    return (
      <SectionCard title="Kontrak Terkunci" description="Fitur recurring service tersedia mulai paket Pro.">
        <div className="callout callout--warning">
          <strong>Paket aktif: {businessQuery.data?.plan ?? "Starter"}</strong>
          <p>
            Kontrak membantu renewal, jadwal service berkala, dan pipeline revenue berulang. Upgrade paket untuk mengaktifkannya.
          </p>
        </div>
      </SectionCard>
    );
  }

  if (contractsQuery.error || !contractsQuery.data) {
    return <PageError message={getErrorMessage(contractsQuery.error)} />;
  }

  const customers = customersQuery.data ?? [];
  const active = contracts.filter((item) => item.status === "Aktif").length;
  const expired = contracts.filter((item) => item.status === "Expired").length;
  const nearDue = contracts.filter((item) => item.status === "Hampir Jatuh Tempo").length;

  async function handleCreateContract(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await createContractMutation.mutateAsync({
      customerId,
      plan,
      serviceInterval,
      unitCount: Number(unitCount),
      value: Number(value),
      nextServiceAt,
    });
    setCustomerId("");
    setPlan("");
    setServiceInterval("Bulanan");
    setUnitCount("1");
    setValue("0");
    setNextServiceAt("");
    setShowCreate(false);
  }

  return (
    <div className="page-stack">
      <div className="stats-grid">
        <StatCard label="Kontrak Aktif" value={String(active)} hint="Recurring revenue" tone="success" />
        <StatCard label="Expired" value={String(expired)} hint="Butuh follow up" tone="warning" />
        <StatCard label="Next Service 7 Hari" value={String(nearDue)} hint="Jadwal terdekat" />
      </div>

      {showCreate ? (
        <SectionCard title="Tambah Kontrak Servis" description="Pakai preset agar owner bisa setup kontrak lebih cepat dan konsisten.">
          <div className="cards-grid cards-grid--three">
            {presets.map((preset) => (
              <button
                key={preset.label}
                type="button"
                className="service-card"
                onClick={() => {
                  setPlan(preset.label);
                  setServiceInterval(preset.interval);
                  setUnitCount(preset.unitCount);
                  setValue(preset.value);
                }}
              >
                <strong>{preset.label}</strong>
                <p>{preset.interval} · {preset.unitCount} unit · Rp{Number(preset.value).toLocaleString("id-ID")}</p>
              </button>
            ))}
          </div>
          <form className="action-stack" onSubmit={handleCreateContract}>
            <div className="field-grid">
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
              <label className="field">
                <span>Nama paket kontrak</span>
                <input value={plan} onChange={(event) => setPlan(event.target.value)} required />
              </label>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>Interval</span>
                <input value={serviceInterval} onChange={(event) => setServiceInterval(event.target.value)} required />
              </label>
              <label className="field">
                <span>Jumlah unit</span>
                <input type="number" min="1" value={unitCount} onChange={(event) => setUnitCount(event.target.value)} required />
              </label>
            </div>
            <div className="field-grid">
              <label className="field">
                <span>Nilai kontrak</span>
                <input type="number" min="0" value={value} onChange={(event) => setValue(event.target.value)} required />
              </label>
              <label className="field">
                <span>Jadwal service berikutnya</span>
                <input type="datetime-local" value={nextServiceAt} onChange={(event) => setNextServiceAt(event.target.value)} required />
              </label>
            </div>
            {createContractMutation.error ? <p className="form-error">{getErrorMessage(createContractMutation.error)}</p> : null}
            <div className="button-row button-row--left">
              <EmptyAction onClick={() => setShowCreate(false)}>Batal</EmptyAction>
              <EmptyAction primary type="submit" disabled={createContractMutation.isPending}>
                {createContractMutation.isPending ? "Menyimpan..." : "Simpan Kontrak"}
              </EmptyAction>
            </div>
          </form>
        </SectionCard>
      ) : null}

      <div className="dashboard-grid">
        <SectionCard title="Daftar Kontrak" action={<EmptyAction primary onClick={() => setShowCreate((current) => !current)}>{showCreate ? "Tutup Form" : "Tambah Kontrak"}</EmptyAction>}>
          <div className="contract-list">
            {contracts.map((contract) => (
              <article key={contract.id} className="contract-card">
                <div className="contract-card__head">
                  <div>
                    <strong>{contract.customer}</strong>
                    <p>{contract.plan}</p>
                  </div>
                  <Badge tone={contract.status === "Aktif" ? "success" : contract.status === "Hampir Jatuh Tempo" ? "warning" : "danger"}>
                    {contract.status}
                  </Badge>
                </div>
                <div className="contract-card__meta">
                  <span>Nilai {contract.value}</span>
                  <span>Service berikutnya {contract.nextService}</span>
                </div>
                <div className="contract-card__footer">
                  <span className="mini-pill mini-pill--success">{contract.status === "Expired" ? "Perlu renewal" : "Masih aktif"}</span>
                </div>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Renewal Focus">
          <div className="stack-list">
            <div className="stack-list__item">
              <strong>{focusContract?.customer ?? "Belum ada fokus renewal"}</strong>
              <p>
                {focusContract
                  ? `${focusContract.plan} · ${focusContract.value} · next service ${focusContract.nextService}.`
                  : "Gunakan daftar kontrak live untuk follow up renewal yang paling dekat."}
              </p>
            </div>
            <div className="stack-list__item">
              <strong>Alur yang disarankan</strong>
              <p>Buat kontrak, jadwalkan next service, lalu kirim invoice terpisah saat visit atau tagih recurring sesuai kebutuhan bisnis.</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { useSetupBusinessMutation } from "../api/hooks";

const services = [
  { label: "Servis AC", description: "Cuci, bongkar, isi freon, maintenance berkala.", active: true },
  { label: "Plumber", description: "Pipa bocor, pompa, saluran mampet, sanitasi." },
  { label: "Listrik", description: "Panel, instalasi, troubleshooting, lampu, MCB." },
  { label: "Lainnya", description: "Perbaikan umum dan pekerjaan custom." },
];

const planOptions = [
  { key: "Starter", label: "Starter", description: "Mulai gratis untuk setup dasar." },
  { key: "Pro", label: "Pro", description: "Rekomendasi untuk tim operasional aktif." },
  { key: "Bisnis", label: "Bisnis", description: "Cocok untuk skala lebih besar." },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const setupMutation = useSetupBusinessMutation();
  const storedPlan =
    typeof window !== "undefined" ? window.sessionStorage.getItem("teknikos:selected-plan") : null;
  const [selectedService, setSelectedService] = useState("Servis AC");
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get("plan") || storedPlan || "Starter");
  const [name, setName] = useState("CV Teknik Makassar");
  const [phone, setPhone] = useState("0812 1234 5678");
  const [email, setEmail] = useState("halo@teknikmakassar.id");
  const [address, setAddress] = useState("Jl. Urip Sumoharjo No. 55, Makassar");
  const city = useMemo(() => address.split(",").slice(-1)[0]?.trim() || "Makassar", [address]);

  useEffect(() => {
    const nextPlan = searchParams.get("plan") || storedPlan || "Starter";
    setSelectedPlan(nextPlan);
  }, [searchParams, storedPlan]);

  async function submitBusinessSetup() {
    await setupMutation.mutateAsync(
      {
        name,
        phone,
        email,
        address,
        city,
        serviceType: selectedService,
        plan: selectedPlan,
      },
      {
        onSuccess: () => {
          window.sessionStorage.removeItem("teknikos:selected-plan");
          const isStarter = selectedPlan.toLowerCase() === "starter";
          navigate(isStarter ? "/dashboard" : "/payment-pending", { replace: true });
        },
      },
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await submitBusinessSetup();
  }

  return (
    <div className="setup-page">
      <header className="setup-page__header">
        <div>
          <span className="eyebrow-pill">Progress</span>
          <h1>Setup Bisnis</h1>
          <p>Langkah cepat sebelum dashboard siap dipakai.</p>
        </div>
        <div className="step-indicator">
          <span className="step-indicator__active" />
          <span />
          <strong>Langkah 1 dari 2</strong>
        </div>
      </header>

      <div className="setup-grid">
        <form className="surface-card" onSubmit={handleSubmit}>
          <div className="section-card__header">
            <div>
              <h3>Info bisnis utama</h3>
              <p>Isi detail dasar bisnis supaya job, invoice, dan data pelanggan langsung rapi sejak awal.</p>
            </div>
          </div>
          <div className="field-grid">
            <label className="field">
              <span>Nama bisnis</span>
              <input type="text" value={name} onChange={(event) => setName(event.target.value)} />
            </label>
            <label className="field">
              <span>Nomor WA bisnis</span>
              <input type="text" value={phone} onChange={(event) => setPhone(event.target.value)} />
            </label>
          </div>
          <label className="field">
            <span>Email bisnis</span>
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
          <label className="field">
            <span>Alamat lengkap</span>
            <textarea value={address} onChange={(event) => setAddress(event.target.value)} />
          </label>
          <div className="service-grid">
            {services.map((service) => (
              <article
                key={service.label}
                className={`service-card ${selectedService === service.label ? "service-card--active" : ""}`}
                onClick={() => setSelectedService(service.label)}
              >
                <div className="service-card__icon">{service.label.slice(0, 2).toUpperCase()}</div>
                <strong>{service.label}</strong>
                <p>{service.description}</p>
              </article>
            ))}
          </div>
          <div className="service-grid">
            {planOptions.map((plan) => (
              <article
                key={plan.key}
                className={`service-card ${selectedPlan === plan.key ? "service-card--active" : ""}`}
                onClick={() => setSelectedPlan(plan.key)}
              >
                <div className="service-card__icon">{plan.label.slice(0, 2).toUpperCase()}</div>
                <strong>{plan.label}</strong>
                <p>{plan.description}</p>
              </article>
            ))}
          </div>
          {setupMutation.error ? <p className="form-error">{getErrorMessage(setupMutation.error)}</p> : null}
          <div className="button-row">
            <button className="btn btn--secondary" type="button" onClick={() => navigate(-1)}>
              Kembali
            </button>
            <button className="btn btn--primary" type="submit" disabled={setupMutation.isPending}>
              {setupMutation.isPending ? "Menyimpan..." : "Lanjutkan →"}
            </button>
          </div>
        </form>

        <aside className="surface-card setup-summary">
          <div className="section-card__header">
            <div>
              <h3>Konfirmasi data bisnis</h3>
              <p>Preview langkah 2 sebelum dashboard aktif.</p>
            </div>
          </div>
          <div className="summary-list">
            <div><span>Nama bisnis</span><strong>{name}</strong></div>
            <div><span>WhatsApp</span><strong>{phone}</strong></div>
            <div><span>Alamat</span><strong>{address}</strong></div>
            <div><span>Layanan</span><strong>{selectedService}</strong></div>
            <div><span>Plan</span><strong>{selectedPlan}</strong></div>
          </div>
          <div className="callout callout--success">
            Data ini akan dipakai otomatis untuk header invoice, alamat job, filter layanan, dan identitas bisnis di dashboard owner.
          </div>
          <button className="btn btn--primary btn--block" type="button" onClick={submitBusinessSetup} disabled={setupMutation.isPending}>
            Buat Bisnis Saya
          </button>
        </aside>
      </div>
    </div>
  );
}

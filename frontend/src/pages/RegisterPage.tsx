import { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { useBusinessQuery, useRegisterMutation, useSessionQuery } from "../api/hooks";
import { AuthScaffold } from "../components/Layout";

const plans = [
  { key: "Starter", label: "Starter", description: "Cocok untuk mulai gratis dan setup cepat." },
  { key: "Pro", label: "Pro", description: "Paling populer untuk operasional harian tim kecil." },
  { key: "Bisnis", label: "Bisnis", description: "Untuk tim lebih besar dan pertumbuhan lanjutan." },
] as const;

export default function RegisterPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const registerMutation = useRegisterMutation();
  const sessionQuery = useSessionQuery();
  const { data: sessionData, isLoading: isSessionLoading } = sessionQuery;
  const businessQuery = useBusinessQuery(Boolean(sessionData));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [selectedPlan, setSelectedPlan] = useState(searchParams.get("plan") || "Starter");
  const passwordsMatch = password.length > 0 && password === confirmPassword;

  // Redirect if already logged in
  useEffect(() => {
    if (sessionData && !isSessionLoading) {
      const role = sessionData.user.role;
      if (role === "admin" || role === "moderator") {
        navigate("/admin", { replace: true });
        return;
      }
      if (role === "technician") {
        navigate("/jobs", { replace: true });
        return;
      }

      // Check business subscription status for owner
      if (businessQuery.data) {
        if (["pending_payment", "past_due", "paused", "cancelled"].includes(businessQuery.data.subscriptionStatus ?? "")) {
          navigate("/payment-pending", { replace: true });
          return;
        }
        navigate("/dashboard", { replace: true });
      }
    }
  }, [sessionData, isSessionLoading, businessQuery.data, navigate]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) return;
    window.sessionStorage.setItem("coreveta:selected-plan", selectedPlan);

    await registerMutation.mutateAsync(
      {
        name,
        email,
        phone,
        password,
      },
      {
        onSuccess: () => {
          navigate(`/onboarding?plan=${encodeURIComponent(selectedPlan)}`, { replace: true });
        },
      },
    );
  }

  return (
    <AuthScaffold
      eyebrow="Mulai kurang dari 10 menit"
      title="Tampil lebih profesional sejak job pertama."
      subtitle="Daftarkan bisnis, atur teknisi, dan kirim invoice yang rapi tanpa setup rumit seperti software enterprise."
    >
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-card__header">
          <h2>Buat akun owner</h2>
          <p>Mulai dengan akun gratis lalu lanjutkan ke setup bisnis.</p>
        </div>
        <div className="cards-grid cards-grid--three">
          {plans.map((plan) => (
            <button
              key={plan.key}
              type="button"
              className={`service-card ${selectedPlan === plan.key ? "service-card--active" : ""}`}
              onClick={() => setSelectedPlan(plan.key)}
            >
              <strong>{plan.label}</strong>
              <p>{plan.description}</p>
            </button>
          ))}
        </div>
        <div className="field-grid">
          <label className="field">
            <span>Nama lengkap</span>
            <input type="text" placeholder="Budi Santoso" value={name} onChange={(event) => setName(event.target.value)} />
          </label>
          <label className="field">
            <span>Email</span>
            <input type="email" placeholder="budi@bengkelac.id" value={email} onChange={(event) => setEmail(event.target.value)} />
          </label>
        </div>
        <label className="field">
          <span>Nomor WhatsApp</span>
          <input type="text" placeholder="0812xxxx" value={phone} onChange={(event) => setPhone(event.target.value)} />
        </label>
        <div className="field-grid">
          <label className="field">
            <span>Password</span>
            <input type="password" placeholder="Minimal 8 karakter" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          <label className="field">
            <span>Konfirmasi</span>
            <input
              type="password"
              placeholder="Ulangi password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
            />
          </label>
        </div>
        <div className="strength-bar">
          <span />
          <span />
          <span />
          <span className={!passwordsMatch && confirmPassword ? "strength-bar__muted" : ""} />
        </div>
        <small className="strength-label">
          {password && !passwordsMatch ? "Konfirmasi password belum cocok" : "Password strength: Bagus"}
        </small>
        <p className="form-helper">Plan dipilih: <strong>{selectedPlan}</strong></p>
        {registerMutation.error ? <p className="form-error">{getErrorMessage(registerMutation.error)}</p> : null}
        <button
          className="btn btn--primary btn--block"
          type="submit"
          disabled={registerMutation.isPending || !passwordsMatch}
        >
          {registerMutation.isPending ? "Membuat akun..." : "Buat Akun"}
        </button>
        <p className="auth-switch">
          Sudah punya akun? <Link to="/login">Masuk</Link>
        </p>
      </form>
    </AuthScaffold>
  );
}

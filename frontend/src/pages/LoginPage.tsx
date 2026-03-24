import { FormEvent, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getErrorMessage, isApiErrorStatus } from "../api/client";
import { useBusinessQuery, useCreatePublicSupportRequestMutation, useLoginMutation, useSessionQuery } from "../api/hooks";
import { AuthScaffold } from "../components/Layout";

const SALES_WHATSAPP = "6281354444967";

function buildResetPasswordLink(email?: string) {
  const message = [
    "Halo sales TeknikOS, saya butuh bantuan reset password.",
    `Email akun: ${email?.trim() || "-"}`,
  ].join("\n");

  return `https://wa.me/${SALES_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export default function LoginPage() {
  const navigate = useNavigate();
  const loginMutation = useLoginMutation();
  const publicSupportRequestMutation = useCreatePublicSupportRequestMutation();
  const sessionQuery = useSessionQuery(false);
  const businessQuery = useBusinessQuery(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const resetPasswordLink = buildResetPasswordLink(email);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    await loginMutation.mutateAsync(
      { email, password },
      {
        onSuccess: async () => {
          const sessionResult = await sessionQuery.refetch();
          const currentRole = sessionResult.data?.user.role;
          if (currentRole === "admin" || currentRole === "moderator") {
            navigate("/admin", { replace: true });
            return;
          }
          if (currentRole === "technician") {
            navigate("/jobs", { replace: true });
            return;
          }

          const result = await businessQuery.refetch();
          if (["pending_payment", "past_due", "paused", "cancelled"].includes(result.data?.subscriptionStatus ?? "")) {
            navigate("/payment-pending", { replace: true });
            return;
          }

          if (result.error) {
            if (isApiErrorStatus(result.error, 403)) {
              navigate("/onboarding", { replace: true });
              return;
            }
            navigate("/dashboard", { replace: true });
            return;
          }

          navigate("/dashboard", { replace: true });
        },
      },
    );
  }

  async function handleForgotPassword() {
    await publicSupportRequestMutation.mutateAsync({
      type: "password_help",
      requesterEmail: email.trim() || "unknown@teknikos.local",
      message: "User meminta bantuan reset password dari halaman login.",
    });

    window.open(resetPasswordLink, "_blank", "noopener,noreferrer");
  }

  return (
    <AuthScaffold
      eyebrow="Operasional bengkel yang rapi"
      title="Masuk ke TeknikOS"
      subtitle="Sistem operasi bisnis jasa teknik kamu untuk memantau job, teknisi, invoice, dan kontrak."
    >
      <form className="auth-card" onSubmit={handleSubmit}>
        <div className="auth-card__header">
          <h2>Masuk</h2>
          <p>Gunakan akun owner untuk masuk ke dashboard.</p>
        </div>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            placeholder="owner@teknikos.id"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Password</span>
          <input
            type="password"
            placeholder="Masukkan password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </label>
        <div className="auth-row">
          <label className="check-row">
            <input type="checkbox" defaultChecked />
            <span>Ingat saya</span>
          </label>
          <button type="button" className="btn btn--link" onClick={handleForgotPassword}>
            Lupa password?
          </button>
        </div>
        {loginMutation.error ? <p className="form-error">{getErrorMessage(loginMutation.error)}</p> : null}
        <button className="btn btn--primary btn--block" type="submit" disabled={loginMutation.isPending}>
          {loginMutation.isPending ? "Masuk..." : "Masuk"}
        </button>
        <div className="auth-demo">
          <span>Mode demo</span>
          <strong>Dashboard demo sekarang dibuka terpisah dari login akun asli.</strong>
          <small>
            Gunakan halaman login ini untuk akun owner kamu, atau buka demo dari landing page.
          </small>
          <Link to="/demo-owner-dashboard" className="btn btn--secondary">
            Lihat Demo Owner Dashboard
          </Link>
        </div>
        <p className="auth-switch">
          Belum punya akun? <Link to="/register">Daftar sekarang</Link>
        </p>
      </form>
    </AuthScaffold>
  );
}

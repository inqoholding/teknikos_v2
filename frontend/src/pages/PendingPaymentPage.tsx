import { Link, useNavigate } from "react-router-dom";
import { useBusinessQuery, useCreateBusinessSupportRequestMutation, useLogoutMutation } from "../api/hooks";
import { Badge } from "../components/UI";
import { getErrorMessage } from "../api/client";
import { PageError, PageLoader } from "../components/PageState";

const ADMIN_WHATSAPP = "6285645286293";

function buildWhatsAppLink(input: {
  businessName?: string | null;
  plan?: string | null;
  ownerName?: string | null;
  ownerEmail?: string | null;
}) {
  const message = [
    "Halo admin Coreveta, saya ingin lanjut pembayaran subscription.",
    `Nama bisnis: ${input.businessName ?? "-"}`,
    `Plan: ${input.plan ?? "-"}`,
    `Owner: ${input.ownerName ?? "-"}`,
    `Email: ${input.ownerEmail ?? "-"}`,
  ].join("\n");

  return `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export default function PendingPaymentPage() {
  const navigate = useNavigate();
  const businessQuery = useBusinessQuery();
  const logoutMutation = useLogoutMutation();
  const supportRequestMutation = useCreateBusinessSupportRequestMutation();

  if (businessQuery.isLoading) {
    return <PageLoader title="Memuat status pembayaran..." />;
  }

  if (businessQuery.error || !businessQuery.data) {
    return <PageError message={getErrorMessage(businessQuery.error)} />;
  }

  const business = businessQuery.data;
  const whatsappLink = buildWhatsAppLink({
    businessName: business.name,
    plan: business.plan,
    ownerName: business.owner?.name ?? null,
    ownerEmail: business.owner?.email ?? null,
  });
  const isFrozen = business.subscriptionStatus === "paused";
  const heading = isFrozen ? "Akun dibekukan sementara." : "Subscription kamu belum aktif.";

  async function handleRequest(type: "subscription_renewal" | "subscription_upgrade") {
    await supportRequestMutation.mutateAsync({
      type,
      targetPlan: type === "subscription_upgrade" ? "Bisnis" : undefined,
      message:
        type === "subscription_upgrade"
          ? "Owner meminta upgrade subscription."
          : "Owner meminta perpanjangan subscription.",
    });

    window.open(whatsappLink, "_blank", "noopener,noreferrer");
  }

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    navigate("/login", { replace: true });
  }

  return (
    <div className="auth-page">
      <div className="auth-page__panel">
        <section className="glass-card waiting-payment-card" style={{ padding: "40px", borderRadius: "32px" }}>
        <span className="eyebrow-pill" style={{ background: "rgba(245, 158, 11, 0.1)", color: "#d97706" }}>Tagihan Tertunda</span>
        <h1 style={{ marginTop: "16px", fontSize: "28px" }}>{heading}</h1>
        <p className="lead-text" style={{ color: "var(--text-muted)", marginBottom: "32px" }}>
          Paket <strong>{business.plan}</strong> untuk <strong>{business.name}</strong> sudah
          terdaftar. Silakan hubungi admin untuk aktivasi dashboard atau perpanjangan lisensi.
        </p>

        <div className="summary-list" style={{ background: "var(--surface-tint)", padding: "20px", borderRadius: "20px", marginBottom: "32px" }}>
          <div style={{ padding: "8px 0" }}><span>Bisnis</span><strong>{business.name}</strong></div>
          <div style={{ padding: "8px 0" }}><span>Paket</span><strong>{business.plan}</strong></div>
          <div style={{ padding: "8px 0" }}><span>Status</span><Badge tone="warning">{business.subscriptionStatusLabel ?? "Pending Payment"}</Badge></div>
          <div style={{ padding: "8px 0" }}><span>Owner</span><strong>{business.owner?.email ?? "-"}</strong></div>
        </div>

        <div className="callout callout--info" style={{ marginBottom: "32px" }}>
          <div>
            <strong>Akses dashboard sedang dibatasi</strong>
            <p style={{ fontSize: "13px" }}>
              Data bisnis Anda aman. Setelah pembayaran dikonfirmasi, seluruh fitur operasional akan terbuka secara otomatis.
            </p>
          </div>
        </div>

        <div className="button-row" style={{ gap: "12px" }}>
          <button className="btn btn--primary btn--block" type="button" onClick={() => handleRequest("subscription_renewal")}>
            Aktivasi via WhatsApp
          </button>
          <button className="btn btn--secondary btn--block" type="button" onClick={() => handleRequest("subscription_upgrade")}>
            Upgrade ke Bisnis
          </button>
        </div>
        
        <div style={{ marginTop: "24px", textAlign: "center" }}>
          <button className="btn btn--link" type="button" onClick={handleLogout} disabled={logoutMutation.isPending}>
            {logoutMutation.isPending ? "Mengeluarkan Sesi..." : "Ganti Akun & Keluar"}
          </button>
        </div>
        </section>
      </div>
    </div>
  );
}

import { Link } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import { useBusinessQuery, useCreateBusinessSupportRequestMutation } from "../api/hooks";
import { PageError, PageLoader } from "../components/PageState";
import { SectionCard } from "../components/UI";

const SALES_WHATSAPP = "6281354444967";

function buildSalesSubscriptionLink(input: { businessName?: string | null; plan?: string | null; type: "upgrade" | "renewal" }) {
  const message = [
    "Halo sales TeknikOS, saya butuh bantuan subscription.",
    `Nama bisnis: ${input.businessName ?? "-"}`,
    `Paket saat ini: ${input.plan ?? "-"}`,
    `Permintaan: ${input.type === "upgrade" ? "Upgrade subscription" : "Perpanjang subscription"}`,
  ].join("\n");

  return `https://wa.me/${SALES_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export default function SettingsPage() {
  const businessQuery = useBusinessQuery();
  const supportRequestMutation = useCreateBusinessSupportRequestMutation();

  if (businessQuery.isLoading) {
    return <PageLoader title="Memuat pengaturan..." />;
  }

  if (businessQuery.error || !businessQuery.data) {
    return <PageError message={getErrorMessage(businessQuery.error)} />;
  }

  const business = businessQuery.data;
  const upgradeLink = buildSalesSubscriptionLink({ businessName: business.name, plan: business.plan, type: "upgrade" });
  const renewalLink = buildSalesSubscriptionLink({ businessName: business.name, plan: business.plan, type: "renewal" });

  async function handleSupportRequest(type: "subscription_upgrade" | "subscription_renewal") {
    await supportRequestMutation.mutateAsync({
      type,
      targetPlan: type === "subscription_upgrade" ? "Bisnis" : undefined,
      message:
        type === "subscription_upgrade"
          ? "Owner meminta upgrade subscription dari halaman pengaturan."
          : "Owner meminta perpanjangan subscription dari halaman pengaturan.",
    });

    window.open(type === "subscription_upgrade" ? upgradeLink : renewalLink, "_blank", "noopener,noreferrer");
  }

  return (
    <div className="page-stack">
      <SectionCard title="Profil Bisnis" description="Kelola informasi dasar bisnis dan akses halaman pengaturan yang lebih spesifik.">
        <div className="summary-list">
          <div><span>Nama bisnis</span><strong>{business.name}</strong></div>
          <div><span>WhatsApp</span><strong>{business.phone ?? "-"}</strong></div>
          <div><span>Alamat</span><strong>{business.address ?? "-"}</strong></div>
          <div><span>Paket aktif</span><strong>{business.plan}</strong></div>
        </div>
      </SectionCard>

      {business.subscriptionAlert ? (
        <SectionCard
          title={business.subscriptionAlert.title}
          description={business.subscriptionAlert.message}
        >
          <div className="button-row button-row--left">
            <button className="btn btn--primary" type="button" onClick={() => handleSupportRequest("subscription_renewal")}>
              Minta Perpanjang Subscription
            </button>
            <button className="btn btn--secondary" type="button" onClick={() => handleSupportRequest("subscription_upgrade")}>
              Tanya Upgrade ke Sales
            </button>
          </div>
        </SectionCard>
      ) : null}

      <div className="cards-grid cards-grid--two">
        <article className="settings-link-card">
          <span className="eyebrow">WhatsApp Rules</span>
          <strong>Rules Penggunaan WhatsApp</strong>
          <p>Baca aturan singkat agar nomor bisnis lebih aman dan tidak mudah diblokir saat dipakai di TeknikOS.</p>
          <Link className="btn btn--secondary" to="/settings/whatsapp-rules">
            Buka Rules WhatsApp
          </Link>
        </article>

        <article className="settings-link-card">
          <span className="eyebrow">WAHA Connection</span>
          <strong>Hubungkan ke WAHA</strong>
          <p>Pilih mode WhatsApp, cek status koneksi, scan QR, dan sambungkan nomor bisnis ke WAHA.</p>
          <Link className="btn btn--primary" to="/settings/whatsapp-connect">
            Buka Halaman WAHA
          </Link>
        </article>

        <article className="settings-link-card">
          <span className="eyebrow">Subscription</span>
          <strong>Upgrade atau Perpanjang</strong>
          <p>Jika client ingin naik paket atau memperpanjang subscription, langsung hubungi sales dan otomatis masuk ke inbox admin.</p>
          <div className="button-row button-row--left">
            <button className="btn btn--primary" type="button" onClick={() => handleSupportRequest("subscription_upgrade")}>
              Upgrade Paket
            </button>
            <button className="btn btn--secondary" type="button" onClick={() => handleSupportRequest("subscription_renewal")}>
              Perpanjang
            </button>
          </div>
        </article>
      </div>
    </div>
  );
}

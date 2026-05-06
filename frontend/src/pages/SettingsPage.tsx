import { useState } from "react";
import { Link } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import {
  useBusinessQuery,
  useCreateBusinessSupportRequestMutation,
  useSessionQuery,
  useUpdateBusinessMutation,
} from "../api/hooks";
import { PageError, PageLoader } from "../components/PageState";
import { SectionCard } from "../components/UI";

const SALES_WHATSAPP = "6285645286293";

function buildSalesSubscriptionLink(input: { businessName?: string | null; plan?: string | null; type: "upgrade" | "renewal" }) {
  const message = [
    "Halo sales Coreveta, saya butuh bantuan subscription.",
    `Nama bisnis: ${input.businessName ?? "-"}`,
    `Paket saat ini: ${input.plan ?? "-"}`,
    `Permintaan: ${input.type === "upgrade" ? "Upgrade subscription" : "Perpanjang subscription"}`,
  ].join("\n");

  return `https://wa.me/${SALES_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export default function SettingsPage() {
  const businessQuery = useBusinessQuery();
  const sessionQuery = useSessionQuery();
  const supportRequestMutation = useCreateBusinessSupportRequestMutation();
  const isTechnician = sessionQuery.data?.user.role === "technician";

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

  const [isEditing, setIsEditing] = useState(false);
  const updateBusinessMutation = useUpdateBusinessMutation();

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const payload = {
      name: formData.get("name") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      email: formData.get("email") as string,
    };
    try {
      await updateBusinessMutation.mutateAsync(payload);
      setIsEditing(false);
    } catch {
      // Error is handled by the mutation and client implicitly or we can ignore
    }
  };

  return (
    <div className="page-stack">
      <SectionCard title="Profil Bisnis" description="Kelola informasi dasar bisnis dan akses halaman pengaturan yang lebih spesifik.">
        {isEditing ? (
          <form onSubmit={handleUpdateProfile} className="form-stack">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="name">Nama Bisnis</label>
                <input id="name" name="name" type="text" defaultValue={business.name} required />
              </div>
              <div className="field">
                <label htmlFor="phone">WhatsApp</label>
                <input id="phone" name="phone" type="tel" defaultValue={business.phone ?? ""} required />
              </div>
              <div className="field">
                <label htmlFor="email">Email</label>
                <input id="email" name="email" type="email" defaultValue={business.email ?? ""} />
              </div>
              <div className="field">
                <label htmlFor="address">Alamat</label>
                <textarea id="address" name="address" defaultValue={business.address ?? ""} rows={2} required />
              </div>
            </div>
            {updateBusinessMutation.error && (
              <p className="form-error">{getErrorMessage(updateBusinessMutation.error)}</p>
            )}
            <div className="button-row">
              <button 
                className="btn btn--secondary" 
                type="button" 
                onClick={() => setIsEditing(false)}
                disabled={updateBusinessMutation.isPending}
              >
                Batal
              </button>
              <button 
                className="btn btn--primary" 
                type="submit"
                disabled={updateBusinessMutation.isPending}
              >
                {updateBusinessMutation.isPending ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </div>
          </form>
        ) : (
          <>
            <div className="summary-list">
              <div><span>Nama bisnis</span><strong>{business.name}</strong></div>
              <div><span>WhatsApp</span><strong>{business.phone ?? "-"}</strong></div>
              <div><span>Email</span><strong>{business.email ?? "-"}</strong></div>
              <div><span>Alamat</span><strong>{business.address ?? "-"}</strong></div>
              <div><span>Paket aktif</span><strong>{business.plan}</strong></div>
            </div>
            {!isTechnician && (
              <div className="button-row button-row--left" style={{ marginTop: "16px" }}>
                <button className="btn btn--secondary" type="button" onClick={() => setIsEditing(true)}>
                   Edit Profil
                </button>
              </div>
            )}
          </>
        )}
      </SectionCard>

      {isTechnician ? (
        <SectionCard title="Akun Teknisi" description="Akun teknisi hanya menampilkan pengaturan yang relevan untuk operasional lapangan.">
          <div className="summary-list">
            <div><span>Role akun</span><strong>Teknisi</strong></div>
            <div><span>Akses utama</span><strong>Job Order</strong></div>
            <div><span>Akses dibatasi</span><strong>CRM, invoice, inventori, kontrak, dan manajemen teknisi</strong></div>
          </div>
          <p className="form-helper">
            Fitur subscription, koneksi WAHA bisnis, dan pengaturan owner tidak ditampilkan pada akun teknisi.
          </p>
        </SectionCard>
      ) : null}

      {!isTechnician && business.subscriptionAlert ? (
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

      {!isTechnician ? (
        <div className="cards-grid cards-grid--triple">
          <article className="settings-link-card">
            <span className="eyebrow">WhatsApp Rules</span>
            <strong>Rules Penggunaan WhatsApp</strong>
            <p>Baca aturan singkat agar nomor bisnis lebih aman dan tidak mudah diblokir saat dipakai di Coreveta.</p>
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
                Upgrade (Tersedia Paket Tahunan)
              </button>
              <button className="btn btn--secondary" type="button" onClick={() => handleSupportRequest("subscription_renewal")}>
                Perpanjang
              </button>
            </div>
          </article>
        </div>
      ) : null}
    </div>
  );
}

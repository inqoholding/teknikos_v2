import { Link } from "react-router-dom";
import { getErrorMessage } from "../api/client";
import {
  useBusinessQuery,
  useCreateBusinessSupportRequestMutation,
  useSessionQuery,
  useTechnicianCheckInMutation,
  useTechnicianCheckOutMutation,
  useTechnicianLocationMutation,
  useTechnicianSelfQuery,
} from "../api/hooks";
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
  const sessionQuery = useSessionQuery();
  const supportRequestMutation = useCreateBusinessSupportRequestMutation();
  const isTechnician = sessionQuery.data?.user.role === "technician";
  const technicianSelfQuery = useTechnicianSelfQuery(isTechnician);
  const technicianCheckInMutation = useTechnicianCheckInMutation();
  const technicianCheckOutMutation = useTechnicianCheckOutMutation();
  const technicianLocationMutation = useTechnicianLocationMutation();

  if (businessQuery.isLoading) {
    return <PageLoader title="Memuat pengaturan..." />;
  }

  if (businessQuery.error || !businessQuery.data) {
    return <PageError message={getErrorMessage(businessQuery.error)} />;
  }

  const business = businessQuery.data;
  const upgradeLink = buildSalesSubscriptionLink({ businessName: business.name, plan: business.plan, type: "upgrade" });
  const renewalLink = buildSalesSubscriptionLink({ businessName: business.name, plan: business.plan, type: "renewal" });

  async function getCurrentLocation() {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      throw new Error("Browser ini belum mendukung geolocation.");
    }

    return new Promise<{ latitude: number; longitude: number }>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) =>
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          }),
        () => reject(new Error("Izin lokasi ditolak atau lokasi tidak tersedia.")),
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 30000,
        },
      );
    });
  }

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

  async function handleTechnicianCheckIn() {
    const location = await getCurrentLocation();
    await technicianCheckInMutation.mutateAsync(location);
  }

  async function handleTechnicianCheckOut() {
    const location = await getCurrentLocation().catch(() => undefined);
    await technicianCheckOutMutation.mutateAsync(location);
  }

  async function handleTechnicianRefreshLocation() {
    const location = await getCurrentLocation();
    await technicianLocationMutation.mutateAsync(location);
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

      {isTechnician ? (
        <SectionCard title="Absensi Teknisi" description="Gunakan lokasi perangkat untuk check in, check out, dan pembaruan kehadiran lapangan.">
          {technicianSelfQuery.isLoading ? (
            <p className="form-helper">Memuat status absensi teknisi...</p>
          ) : technicianSelfQuery.error || !technicianSelfQuery.data ? (
            <p className="form-error">{getErrorMessage(technicianSelfQuery.error)}</p>
          ) : (
            <>
              <div className="summary-list">
                <div><span>Nama</span><strong>{technicianSelfQuery.data.name}</strong></div>
                <div><span>Status hadir</span><strong>{technicianSelfQuery.data.status}</strong></div>
                <div><span>Status absensi</span><strong>{technicianSelfQuery.data.attendanceStatus}</strong></div>
                <div><span>Update terakhir</span><strong>{technicianSelfQuery.data.lastSeenAt ?? "Belum ada"}</strong></div>
                <div><span>Koordinat</span><strong>{technicianSelfQuery.data.attendanceLatitude ?? technicianSelfQuery.data.latitude ?? "-"}, {technicianSelfQuery.data.attendanceLongitude ?? technicianSelfQuery.data.longitude ?? "-"}</strong></div>
              </div>
              <div className="button-row button-row--left">
                <button
                  className="btn btn--primary"
                  type="button"
                  onClick={() => void handleTechnicianCheckIn()}
                  disabled={technicianCheckInMutation.isPending || technicianCheckOutMutation.isPending || technicianLocationMutation.isPending}
                >
                  {technicianCheckInMutation.isPending ? "Memproses..." : "Check In"}
                </button>
                <button
                  className="btn btn--secondary"
                  type="button"
                  onClick={() => void handleTechnicianRefreshLocation()}
                  disabled={technicianCheckInMutation.isPending || technicianCheckOutMutation.isPending || technicianLocationMutation.isPending}
                >
                  {technicianLocationMutation.isPending ? "Memperbarui..." : "Update Lokasi"}
                </button>
                <button
                  className="btn btn--secondary"
                  type="button"
                  onClick={() => void handleTechnicianCheckOut()}
                  disabled={technicianCheckInMutation.isPending || technicianCheckOutMutation.isPending || technicianLocationMutation.isPending}
                >
                  {technicianCheckOutMutation.isPending ? "Memproses..." : "Check Out"}
                </button>
              </div>
              {technicianCheckInMutation.error || technicianCheckOutMutation.error || technicianLocationMutation.error ? (
                <p className="form-error">
                  {getErrorMessage(
                    technicianCheckInMutation.error || technicianCheckOutMutation.error || technicianLocationMutation.error,
                  )}
                </p>
              ) : null}
              <p className="form-helper">
                Check in akan menyimpan lokasi dan waktu aktif terakhir. Check out akan menandai teknisi tidak aktif tanpa membuka akses owner.
              </p>
            </>
          )}
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
      ) : null}
    </div>
  );
}

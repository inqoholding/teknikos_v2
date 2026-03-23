import { Link } from "react-router-dom";
import { useBusinessQuery } from "../api/hooks";
import { getErrorMessage } from "../api/client";
import { PageError, PageLoader } from "../components/PageState";

const ADMIN_WHATSAPP = "6281354444967";

function buildWhatsAppLink(input: {
  businessName?: string | null;
  plan?: string | null;
  ownerName?: string | null;
  ownerEmail?: string | null;
}) {
  const message = [
    "Halo admin TeknikOS, saya ingin lanjut pembayaran subscription.",
    `Nama bisnis: ${input.businessName ?? "-"}`,
    `Plan: ${input.plan ?? "-"}`,
    `Owner: ${input.ownerName ?? "-"}`,
    `Email: ${input.ownerEmail ?? "-"}`,
  ].join("\n");

  return `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(message)}`;
}

export default function PendingPaymentPage() {
  const businessQuery = useBusinessQuery();

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

  return (
    <div className="page-stack">
      <section className="surface-card waiting-payment-card">
        <span className="eyebrow-pill">Pending Payment</span>
        <h1>Subscription kamu belum aktif.</h1>
        <p>
          Paket <strong>{business.plan}</strong> untuk <strong>{business.name}</strong> sudah
          tercatat. Langkah berikutnya adalah menghubungi admin untuk lanjut pembayaran manual.
        </p>

        <div className="summary-list">
          <div><span>Nama bisnis</span><strong>{business.name}</strong></div>
          <div><span>Plan dipilih</span><strong>{business.plan}</strong></div>
          <div><span>Status</span><strong>{business.subscriptionStatusLabel ?? "Pending Payment"}</strong></div>
          <div><span>Email owner</span><strong>{business.owner?.email ?? "-"}</strong></div>
        </div>

        <div className="callout callout--warning">
          <div>
            <strong>Akses dashboard penuh masih dikunci</strong>
            <p>
              Setelah admin mengubah status menjadi <strong>Paid</strong>, kamu bisa login dan
              langsung masuk ke dashboard operasional.
            </p>
          </div>
        </div>

        <div className="button-row button-row--left">
          <a className="btn btn--primary" href={whatsappLink} target="_blank" rel="noreferrer">
            Lanjutkan Pembayaran via WhatsApp
          </a>
          <Link className="btn btn--secondary" to="/login">
            Kembali ke Login
          </Link>
        </div>
      </section>
    </div>
  );
}

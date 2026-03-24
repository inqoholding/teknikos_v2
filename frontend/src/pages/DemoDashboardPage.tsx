import { ArrowLeft, MessageCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { MarketingFooter } from "../components/Layout";
import { Badge, SectionCard, StatCard } from "../components/UI";

const demoStats = [
  { label: "Job Hari Ini", value: "14", hint: "4 urgent, 3 siap ditagih", tone: "success" as const },
  { label: "Teknisi Aktif", value: "6", hint: "2 tim on the way", tone: "default" as const },
  { label: "Invoice Overdue", value: "2", hint: "Butuh follow up hari ini", tone: "warning" as const },
  { label: "Revenue Bulan Ini", value: "Rp18.500.000", hint: "Naik 18% dari bulan lalu", tone: "success" as const },
];

const queueCards = [
  { title: "Dispatch", value: "3 job", text: "Belum ada teknisi dan perlu assignment cepat.", tone: "warning" as const },
  { title: "Ready To Bill", value: "5 job", text: "Pekerjaan sudah berjalan dan siap lanjut invoice.", tone: "info" as const },
  { title: "CRM Follow Up", value: "7 akun", text: "Pelanggan dengan kontrak due atau invoice tertunda.", tone: "success" as const },
];

const waLink =
  "https://wa.me/6281354444967?text=Halo%20TeknikOS,%20saya%20ingin%20lanjut%20demo%20atau%20berlangganan.";

export default function DemoDashboardPage() {
  return (
    <div className="landing-page demo-dashboard-page">
      <header className="landing-navbar">
        <div className="brand-mark brand-mark--hero">
          <div className="brand-mark__icon">T</div>
          <div>
            <strong>TeknikOS</strong>
            <span>Demo Owner Dashboard</span>
          </div>
        </div>
        <nav className="landing-navbar__links">
          <Link to="/" className="btn btn--secondary">
            <ArrowLeft size={16} />
            Kembali
          </Link>
          <Link to="/login">Login</Link>
          <a href={waLink} className="btn btn--primary" target="_blank" rel="noreferrer">
            <MessageCircle size={16} />
            Hubungi via WA
          </a>
        </nav>
      </header>

      <section className="surface-card demo-dashboard-shell">
        <div className="section-card__header">
          <div>
            <span className="eyebrow">Read-only demo</span>
            <h3>Owner Dashboard</h3>
            <p>Lihat bagaimana dispatch, billing, CRM, inventori, dan kontrak dibaca owner dalam satu layar.</p>
          </div>
          <Badge tone="success">Demo</Badge>
        </div>

        <div className="stats-grid">
          {demoStats.map((item) => (
            <StatCard key={item.label} label={item.label} value={item.value} hint={item.hint} tone={item.tone} />
          ))}
        </div>

        <div className="dashboard-grid">
          <SectionCard title="Queue Operasional" description="Prioritas harian yang biasanya dicari owner saat pagi hari.">
            <div className="ops-grid">
              {queueCards.map((card) => (
                <article key={card.title} className={`ops-queue-card ops-queue-card--${card.tone}`}>
                  <div className="ops-queue-card__count">{card.value}</div>
                  <strong>{card.title}</strong>
                  <p>{card.text}</p>
                  <span>Terlihat tanpa buka banyak halaman</span>
                </article>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Modul Utama" description="Semua fitur inti yang nanti dipakai tim di app utama.">
            <div className="demo-feature-list">
              {[
                "Job order dan action panel teknisi",
                "CRM pelanggan + histori unit",
                "Invoice dan follow-up pembayaran",
                "Inventori sparepart dan stok",
                "Kontrak servis dan jadwal berikutnya",
              ].map((item) => (
                <div key={item} className="demo-feature-list__item">
                  <span className="demo-feature-list__dot" />
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </SectionCard>
        </div>

        <div className="dashboard-grid">
          <SectionCard title="Dispatch Hari Ini" description="Siapa pergi ke mana dan apa yang paling perlu diawasi.">
            <div className="dispatch-list">
              {[
                ["JOB-014", "Cuci besar 4 unit cassette", "PT Sinar Jaya · Ardiansyah", "09:30 WITA", "Urgent"],
                ["JOB-015", "Instalasi AC ruang admin", "CV Sejuk Jaya · Rehan, Fadli", "11:00 WITA", "Assigned"],
                ["JOB-016", "Troubleshoot unit outdoor", "Ibu Lina · Belum ditugaskan", "14:00 WITA", "Pending"],
              ].map(([number, title, meta, time, status]) => (
                <div key={number} className="dispatch-item">
                  <div className="dispatch-item__time">
                    <strong>{time}</strong>
                    <span>{number}</span>
                  </div>
                  <div className="dispatch-item__body">
                    <strong>{title}</strong>
                    <p>{meta}</p>
                    <small>Contoh tampilan dispatch owner TeknikOS</small>
                  </div>
                  <div className="dispatch-item__status">
                    <Badge tone={status === "Urgent" ? "danger" : status === "Pending" ? "warning" : "info"}>
                      {status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="Lanjut Setelah Demo" description="Kalau cocok, tim bisa lanjut tanpa perlu bingung alur berikutnya.">
            <div className="stack-list">
              <div className="stack-list__item">
                <strong>1. Pilih paket lewat WhatsApp</strong>
                <p>Starter, Pro, atau Bisnis sekarang diarahkan langsung ke WA agar closing lebih gampang.</p>
              </div>
              <div className="stack-list__item">
                <strong>2. Login tetap khusus akun asli</strong>
                <p>Halaman login tidak lagi auto-buka dashboard demo ketika pengguna hanya ingin masuk akun.</p>
              </div>
              <div className="stack-list__item">
                <strong>3. Setup bisnis lalu jalan</strong>
                <p>Setelah deal, owner bisa lanjut setup dan operasional masuk ke dashboard utama.</p>
              </div>
            </div>
            <a href={waLink} className="btn btn--primary" target="_blank" rel="noreferrer">
              Lanjut Tanya via WhatsApp
            </a>
          </SectionCard>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

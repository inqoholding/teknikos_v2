import { ArrowRight, CheckCircle2, MessageCircleMore } from "lucide-react";
import { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import { FeatureIcon, MarketingFooter } from "../components/Layout";

const featureCards = [
  "Dispatch dan kalender kerja",
  "Invoice dan billing lebih rapi",
  "CRM pelanggan yang hidup",
  "Inventori, kontrak, dan WAHA",
];

const narrativeCards = [
  {
    label: "Dispatch Room",
    title: "Owner tahu siapa berangkat ke mana, tanpa bongkar chat satu-satu.",
    body: "Board operasional dibuat seperti ruang kontrol kecil: urgen terlihat, teknisi aktif terlihat, dan job yang belum ada owner-nya langsung kelihatan.",
  },
  {
    label: "Billing Rhythm",
    title: "Tagihan tidak lagi datang belakangan setelah kerja lapangan selesai.",
    body: "Biaya jasa, sparepart, invoice overdue, dan queue siap ditagih ditata agar cashflow ikut terbaca, bukan cuma job count.",
  },
  {
    label: "Customer Memory",
    title: "Pelanggan terasa punya konteks, bukan sekadar nama dan nomor telepon.",
    body: "Riwayat job, unit, kontrak, kesehatan akun, dan next action disusun supaya follow-up lebih terasa seperti CRM sungguhan.",
  },
];

const communicationCards = [
  {
    title: "Kirim progres kerja ke client",
    body: "Owner tinggal buka detail job lalu kirim update status, jadwal, lokasi, dan teknisi lewat WhatsApp manual.",
  },
  {
    title: "Kirim invoice tanpa copy-paste panjang",
    body: "Nomor invoice, total tagihan, status, dan jatuh tempo sudah disusun otomatis agar lebih enak dibagikan ke client.",
  },
  {
    title: "Setup WAHA dibuat step-by-step",
    body: "Admin tinggal ikuti urutan pilih mode, hubungkan session, scan QR, lalu tes koneksi. Tidak perlu menebak langkah berikutnya.",
  },
];

const latestFeatureCards = [
  {
    title: "Kalender jadwal dan deadline",
    body: "Dashboard owner dan admin sekarang bisa melihat seluruh jadwal kerja dan deadline job tanpa buka satu per satu.",
  },
  {
    title: "Panel WAHA yang lebih jelas",
    body: "Halaman pengaturan sudah dipisah jadi rules dan setup WAHA, lengkap dengan langkah hubungkan session, QR, dan tes koneksi.",
  },
  {
    title: "Detail job lebih operasional",
    body: "Di detail job sekarang ada deadline, before-after photo, item sparepart, invoice, dan panel tindakan yang lebih lengkap.",
  },
];

const livePanelPreview = [
  {
    title: "Operations Cockpit",
    body: "Queue dispatch, billing, dan CRM follow up dibaca dari satu panel yang langsung bisa ditindak.",
  },
  {
    title: "Kalender & Deadline",
    body: "Jadwal kerja dan tenggat job terlihat berdampingan, jadi owner tidak cuma melihat list job.",
  },
  {
    title: "WAHA Setup",
    body: "Rules WhatsApp dan langkah connect WAHA dipisah supaya setup lebih mudah dipahami client.",
  },
];

const chatbotFaq = [
  {
    question: "TeknikOS bisa dipakai untuk apa?",
    answer:
      "Untuk mengatur job, teknisi, pelanggan, invoice, inventori, dan kontrak servis dalam satu dashboard owner.",
  },
  {
    question: "Apakah bisa untuk tim kecil dulu?",
    answer:
      "Bisa. Paket Starter cocok untuk mulai rapi dulu, lalu upgrade saat teknisi dan job makin banyak.",
  },
  {
    question: "Bagaimana alur invoice-nya?",
    answer:
      "Kamu bisa buat invoice manual, tarik dari job, lalu pantau status pembayaran tanpa catatan terpisah.",
  },
  {
    question: "Apa bedanya Pro dan Bisnis?",
    answer:
      "Pro cocok untuk operasional tim aktif sehari-hari. Bisnis lebih pas untuk tim lebih besar dan monitoring lebih luas.",
  },
];

function resolveChatAnswer(question: string) {
  const trimmedQuestion = question.trim();
  const normalized = trimmedQuestion.toLowerCase();

  const exactMatch = chatbotFaq.find((item) => item.question.toLowerCase() === normalized);
  if (exactMatch) {
    return exactMatch;
  }

  if (normalized.includes("job") || normalized.includes("teknisi") || normalized.includes("dispatch")) {
    return {
      question: trimmedQuestion || "Bagaimana job dan teknisi diatur?",
      answer:
        "TeknikOS membantu bikin job, assign satu atau beberapa teknisi, lalu pantau status kerja dari berangkat sampai selesai dalam satu board.",
    };
  }

  if (normalized.includes("invoice") || normalized.includes("tagih") || normalized.includes("bayar")) {
    return {
      question: trimmedQuestion || "Bagaimana invoice dan pembayaran berjalan?",
      answer:
        "Invoice bisa dibuat manual atau dari job, lalu status pembayarannya dipantau terpisah supaya owner tahu mana yang sudah dibayar dan mana yang masih perlu follow up.",
    };
  }

  if (normalized.includes("stok") || normalized.includes("inventory") || normalized.includes("sparepart")) {
    return {
      question: trimmedQuestion || "Apakah stok sparepart ikut tercatat?",
      answer:
        "Ya. Sparepart yang dipakai di pekerjaan bisa dicatat, stok inventori ikut berkurang, dan owner bisa lihat item mana yang mulai menipis.",
    };
  }

  if (normalized.includes("pelanggan") || normalized.includes("crm") || normalized.includes("customer")) {
    return {
      question: trimmedQuestion || "Apa yang disimpan untuk pelanggan?",
      answer:
        "Data pelanggan, alamat, histori job, unit yang pernah ditangani, invoice, dan kontrak servis disimpan supaya follow up terasa lebih rapi.",
    };
  }

  if (normalized.includes("kontrak") || normalized.includes("maintenance")) {
    return {
      question: trimmedQuestion || "Bisa untuk kontrak maintenance?",
      answer:
        "Bisa. Paket Pro dan Bisnis mendukung kontrak servis berkala supaya owner bisa pantau jadwal visit berikutnya dan renewal yang mendekat.",
    };
  }

  if (normalized.includes("plan") || normalized.includes("pro") || normalized.includes("bisnis") || normalized.includes("starter")) {
    return {
      question: trimmedQuestion || "Plan mana yang cocok untuk saya?",
      answer:
        "Starter cocok untuk mulai gratis. Pro pas untuk operasional harian yang sudah aktif. Bisnis cocok jika tim dan kontrol owner sudah lebih besar.",
    };
  }

  return {
    question: trimmedQuestion || "Fitur apa yang paling sering dipakai?",
    answer:
      "Yang paling sering dipakai owner biasanya dashboard harian, job board, pelanggan, invoice, inventori, dan kontrak. Kalau mau, mulai dulu dari pertanyaan tentang job, invoice, atau plan.",
  };
}

function buildPlanRegisterLink(plan: string) {
  return `/register?plan=${encodeURIComponent(plan)}`;
}

const SALES_WHATSAPP_LINK =
  "https://wa.me/6281354444967?text=Halo%20sales%20TeknikOS,%20saya%20ingin%20tanya%20demo%20dan%20langganan.";

export default function HomePage() {
  const [draftQuestion, setDraftQuestion] = useState("");
  const [activeChat, setActiveChat] = useState(chatbotFaq[0]);

  function handleChatSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveChat(resolveChatAnswer(draftQuestion));
  }

  return (
    <div className="landing-page">
      <header className="landing-navbar">
        <div className="brand-mark brand-mark--hero">
          <div className="brand-mark__icon">T</div>
          <div>
            <strong>TeknikOS</strong>
            <span>SaaS field service Indonesia</span>
          </div>
        </div>
        <nav className="landing-navbar__links">
          <a href="#fitur">Fitur</a>
          <a href="#harga">Harga</a>
          <Link to="/register">Daftar</Link>
          <Link to="/login">Login</Link>
          <Link to="/demo-owner-dashboard" className="btn btn--primary">
            Coba Gratis
          </Link>
        </nav>
      </header>

      <section className="landing-hero">
        <div className="landing-hero__copy">
          <span className="eyebrow-pill">Untuk bengkel AC, plumber, listrik</span>
          <h1>Operasional jasa teknik yang tadinya kacau, jadi rapi dalam 10 menit.</h1>
          <p>
            Ganti koordinasi job via WhatsApp group, invoice tulis tangan, dan stok yang suka
            hilang dengan satu sistem owner dashboard yang terasa lokal, ringan, dan siap dipakai
            tim Indonesia.
          </p>
          <p className="chart-helper">
            Sekarang bukan cuma dispatch dan billing. TeknikOS juga sudah punya kalender jadwal,
            deadline job, setup WAHA bertahap, dan halaman demo yang mengikuti alur aplikasi utama.
          </p>
          <div className="landing-hero__actions">
            <Link to="/register" className="btn btn--secondary">
              Buat Akun Gratis
            </Link>
            <Link to="/demo-owner-dashboard" className="btn btn--primary">
              Coba Gratis
            </Link>
            <Link to="/demo-owner-dashboard" className="btn btn--secondary">
              Lihat Demo Owner Dashboard
            </Link>
            <a href={SALES_WHATSAPP_LINK} target="_blank" rel="noreferrer" className="btn btn--secondary">
              Tanya via WhatsApp
            </a>
          </div>
          <div className="landing-pill-row">
            <div className="mini-metric">
              <span>Setup</span>
              <strong>10 min</strong>
              <small>setup siap pakai</small>
            </div>
            <div className="mini-metric">
              <span>Harga</span>
              <strong>Rp249K</strong>
              <small>plan Pro populer</small>
            </div>
            <div className="mini-metric">
              <span>Result</span>
              <strong>Tanpa chaos</strong>
              <small>jadwal lebih rapi</small>
            </div>
          </div>
        </div>

        <div className="landing-hero__panel">
          <div className="demo-shell">
            <div className="demo-shell__header">
              <div>
                <strong>Owner Dashboard</strong>
                <span>Hari ini · 14 job · 4 teknisi aktif</span>
              </div>
              <div className="avatar avatar--small">BS</div>
            </div>
            <div className="demo-shell__stats">
              <div className="demo-stat">
                <span>Revenue</span>
                <strong>Rp18,5jt</strong>
                <small>Naik 18% MoM</small>
              </div>
              <div className="demo-stat">
                <span>Job Aktif</span>
                <strong>6</strong>
                <small>2 urgent</small>
              </div>
            </div>
            <div className="demo-shell__grid">
              <div className="demo-chart demo-chart--features">
                {[
                  "Dispatch board dengan status live",
                  "Kalender jadwal dan deadline job",
                  "CRM pelanggan dan histori unit",
                  "Invoice, kontrak, inventori, dan setup WAHA",
                ].map((item) => (
                  <div key={item} className="demo-feature-item">
                    <span className="demo-feature-item__dot" />
                    <strong>{item}</strong>
                  </div>
                ))}
              </div>
              <div className="demo-chart demo-chart--donut">
                <div className="donut-summary__chart demo-donut">
                  <div className="donut-summary__center">
                    <strong>14</strong>
                    <span>total job</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="landing-proof">
        <span>Dirancang untuk operasi teknik sehari-hari</span>
        <div>
          <strong>Job dispatch</strong>
          <strong>Invoice</strong>
          <strong>CRM pelanggan</strong>
          <strong>Inventori</strong>
          <strong>Kontrak rutin</strong>
        </div>
      </section>

      <section className="landing-rhythm-grid">
        {narrativeCards.map((item) => (
          <article key={item.label} className="rhythm-card">
            <span className="eyebrow">{item.label}</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </section>

      <section className="landing-rhythm-grid">
        {latestFeatureCards.map((item) => (
          <article key={item.title} className="rhythm-card">
            <span className="eyebrow">Fitur Terbaru</span>
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </section>

      <section className="landing-ops-strip">
        <div className="landing-ops-strip__copy">
          <span className="eyebrow">Preview Dashboard Live</span>
          <h2>Yang dilihat calon user di demo sekarang lebih dekat dengan yang benar-benar dipakai di app utama.</h2>
          <p>
            Bukan cuma halaman promosi. Struktur panel, istilah, dan prioritas di landing serta demo
            sekarang mengikuti dashboard live TeknikOS sedekat mungkin.
          </p>
        </div>
        <div className="landing-ops-strip__grid">
          {livePanelPreview.map((item, index) => (
            <article key={item.title} className={`ops-story-card ops-story-card--${index + 1}`}>
              <span className="eyebrow-pill">Live 0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-ops-strip">
        <div className="landing-ops-strip__copy">
          <span className="eyebrow">Komunikasi Lapangan</span>
          <h2>WhatsApp tetap dipakai, tapi sekarang pesannya lebih rapi dan tidak improvisasi terus.</h2>
          <p>
            Cocok untuk fase sekarang: masih manual, belum pakai bot, tapi owner sudah bisa kirim
            progres kerja, invoice, dan reminder tugas dengan format yang konsisten.
          </p>
        </div>
        <div className="landing-ops-strip__grid">
          {communicationCards.map((item, index) => (
            <article key={item.title} className={`ops-story-card ops-story-card--${index + 1}`}>
              <span className="eyebrow-pill">0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="landing-chatbot">
        <div className="landing-chatbot__copy">
          <span className="eyebrow">Tanya Fitur</span>
          <h2>Masih bingung TeknikOS cocok untuk apa? Tanya cepat di sini.</h2>
          <p>
            Saya ringkas dengan bahasa yang mudah dipahami, jadi calon client tidak perlu menebak-nebak
            fungsi setiap menu di aplikasi.
          </p>
        </div>
        <div className="landing-chatbot__panel">
          <div className="landing-chatbot__header">
            <div className="feature-icon">
              <MessageCircleMore size={18} />
            </div>
            <div>
              <strong>Asisten Fitur TeknikOS</strong>
              <p>Pilih pertanyaan yang paling sering ditanyakan owner.</p>
            </div>
          </div>
          <div className="landing-chatbot__questions">
            {chatbotFaq.map((item) => (
              <button
                key={item.question}
                type="button"
                className={`landing-chatbot__chip ${activeChat?.question === item.question ? "landing-chatbot__chip--active" : ""}`}
                onClick={() => {
                  setDraftQuestion(item.question);
                  setActiveChat(item);
                }}
              >
                {item.question}
              </button>
            ))}
          </div>
          <form className="landing-chatbot__composer" onSubmit={handleChatSubmit}>
            <input
              type="text"
              value={draftQuestion}
              onChange={(event) => setDraftQuestion(event.target.value)}
              placeholder="Contoh: bisa atur stok sparepart?"
            />
            <button type="submit" className="btn btn--primary">
              Tanya
            </button>
          </form>
          <div className="landing-chatbot__answer">
            <span>Pertanyaan</span>
            <strong>{activeChat?.question}</strong>
            <p>{activeChat?.answer}</p>
          </div>
        </div>
      </section>

      <section id="fitur" className="landing-grid">
        <article className="problem-panel">
          <span className="eyebrow">Masalah Lama</span>
          <h2>WhatsApp group, catatan manual, dan spreadsheet bikin bisnis susah scale.</h2>
          <ul>
            <li>Double booking karena jadwal tersebar di chat.</li>
            <li>Owner tidak tahu teknisi mana yang produktif.</li>
            <li>Invoice dan kontrak servis sering telat ditagih.</li>
          </ul>
        </article>
        <div className="feature-grid">
          {featureCards.map((card) => (
            <article key={card} className="feature-card">
              <FeatureIcon />
              <h3>{card}</h3>
              <p>
                {card === "Dispatch dan kalender kerja" &&
                  "Job dibuat, di-assign, dipantau, lalu dibaca juga dari kalender dan daftar deadline."}
                {card === "Invoice dan billing lebih rapi" &&
                  "Invoice manual dan auto-generate dari job selesai, tanpa tulis ulang."}
                {card === "CRM pelanggan yang hidup" &&
                  "Alamat, unit AC, job history, dan kontrak aktif tersimpan rapi."}
                {card === "Inventori, kontrak, dan WAHA" &&
                  "Owner tahu item hampir habis, kontrak mana yang mendekat, dan nomor bisnis bisa disiapkan ke WAHA."}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section className="workflow-panel">
        <div>
          <span className="eyebrow">Core Workflow</span>
          <h2>Dari job masuk sampai invoice lunas, owner tetap pegang kontrol.</h2>
        </div>
        <div className="workflow-list">
          {[
            "Buat job dan assign teknisi dalam hitungan detik.",
            "Pantau status pending, on the way, in progress, done, atau cancelled.",
            "Baca jadwal dari kalender, cek deadline, lalu lanjutkan ke invoice atau follow up pembayaran.",
          ].map((text, index) => (
            <div key={text} className="workflow-list__item">
              <span>{index + 1}</span>
              <p>{text}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="harga" className="pricing-panel">
        <div className="pricing-panel__heading">
          <div>
            <span className="eyebrow">Harga Sederhana</span>
            <h2>Mulai gratis, upgrade saat bisnis makin sibuk.</h2>
          </div>
          <p>
            Sesuai PRD: dirancang untuk bengkel kecil sampai kontraktor multi-cabang dengan harga
            yang tidak menakutkan.
          </p>
        </div>
        <div className="pricing-grid">
          <article className="price-card">
            <h3>Starter</h3>
            <strong>Rp0</strong>
            <p>Solo teknisi yang baru mulai rapi.</p>
            <ul>
              <li>Job dasar</li>
              <li>Pelanggan</li>
              <li>Invoice manual</li>
            </ul>
            <Link className="btn btn--secondary" to={buildPlanRegisterLink("Starter")}>
              Pilih Starter
            </Link>
          </article>
          <article className="price-card price-card--featured">
            <div className="price-card__tag">Primary</div>
            <h3>Pro</h3>
            <strong>Rp249K</strong>
            <p>Untuk bengkel AC 4 teknisi seperti persona utama.</p>
            <ul>
              <li>Dashboard penuh</li>
              <li>Job board</li>
              <li>CRM, stok, kontrak</li>
            </ul>
            <Link className="btn btn--secondary btn--inverse" to={buildPlanRegisterLink("Pro")}>
              Pilih Plan Pro
            </Link>
          </article>
          <article className="price-card">
            <h3>Bisnis</h3>
            <strong>Rp499K</strong>
            <p>Untuk multi-cabang yang butuh visibilitas lebih luas.</p>
            <ul>
              <li>Multi tim</li>
              <li>Laporan konsolidasi</li>
              <li>Visibility lintas kota</li>
            </ul>
            <Link className="btn btn--secondary" to={buildPlanRegisterLink("Bisnis")}>
              Pilih Plan Bisnis
            </Link>
          </article>
        </div>
      </section>

      <section className="cta-banner">
        <div>
          <span className="eyebrow">Ready To Switch</span>
          <h2>Kalau bisnis jasa teknikmu sudah capek hidup di chat, waktunya pindah ke sistem.</h2>
          <p>Mulai dari job pertama, tambah teknisi, dan lihat operasional lebih tenang minggu ini juga.</p>
        </div>
        <div className="cta-banner__actions">
          <Link to="/demo-owner-dashboard" className="btn btn--secondary btn--inverse-soft">
            Coba Gratis Sekarang
          </Link>
          <Link to="/demo-owner-dashboard" className="cta-inline-link">
            Lihat demo owner dashboard <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="landing-checks">
        {[
          "Setup bisnis kurang dari 10 menit",
          "UI lokal yang mudah dipahami owner",
          "Siap dikembangkan ke BetterAuth dan API backend",
        ].map((item) => (
          <div key={item} className="landing-checks__item">
            <CheckCircle2 size={18} />
            <span>{item}</span>
          </div>
        ))}
      </section>

      <MarketingFooter />
    </div>
  );
}

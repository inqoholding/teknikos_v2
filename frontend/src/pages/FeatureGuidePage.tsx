import { ArrowRight, LifeBuoy, MessageCircle, ShieldCheck, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { MarketingFooter } from "../components/Layout";

const featureSections = [
  {
    title: "Dashboard Owner",
    summary:
      "Ringkasan operasional harian untuk melihat job aktif, revenue, teknisi, invoice, dan sinyal penting yang harus ditindak.",
    points: [
      "Melihat job aktif, job urgent, dan progres kerja lapangan dalam satu tampilan.",
      "Memantau teknisi aktif, invoice overdue, dan indikator operasional penting.",
      "Menjadi titik kontrol owner sebelum masuk ke modul yang lebih detail.",
    ],
  },
  {
    title: "Job dan Dispatch",
    summary:
      "Modul inti untuk membuat pekerjaan, assign teknisi, memantau status, dan memastikan pekerjaan bergerak sampai selesai.",
    points: [
      "Buat job dengan jadwal, pelanggan, prioritas, lokasi, dan teknisi.",
      "Update status dari pending, on the way, in progress, done, sampai cancelled.",
      "Tarik invoice dari job agar penagihan tidak tertinggal.",
    ],
  },
  {
    title: "Pelanggan dan Teknisi",
    summary:
      "Data pelanggan dan teknisi disimpan sebagai memori operasional agar owner tidak mulai dari nol setiap kali ada follow-up.",
    points: [
      "Pelanggan menyimpan kontak, alamat, unit, dan histori pekerjaan.",
      "Teknisi menyimpan spesialisasi, status kerja, dan performa lapangan.",
      "Memudahkan penjadwalan ulang dan penugasan berdasarkan konteks riil.",
    ],
  },
  {
    title: "Invoice, Inventory, Kontrak",
    summary:
      "Modul untuk menjaga cashflow, stok sparepart, dan kontrak layanan rutin tetap terbaca dan rapi.",
    points: [
      "Invoice bisa dibuat manual atau diambil dari job selesai.",
      "Inventory membantu tracking stok dan penyesuaian stock item.",
      "Kontrak dipakai untuk client maintenance atau pekerjaan berkala.",
    ],
  },
  {
    title: "Admin Subscription",
    summary:
      "Panel admin untuk memantau client, mengubah plan dan status langganan, serta membantu reset password owner client.",
    points: [
      "Update plan dan status client dari panel admin.",
      "Lihat sinyal pemakaian client seperti teknisi, customer, inventory, dan kontrak.",
      "Reset password client tanpa membuka data operasional mereka.",
    ],
  },
];

const troubleshootingCards = [
  {
    title: "Request failed with status code 404",
    symptom: "Biasanya terjadi saat frontend memanggil path API yang salah atau browser masih memakai bundle lama.",
    steps: [
      "Hard refresh dengan Ctrl+Shift+R atau buka incognito.",
      "Cek Network tab dan pastikan request tidak menuju /api/api/...",
      "Kalau baru deploy, build frontend ulang dan reload Nginx.",
    ],
  },
  {
    title: "Origin tidak diizinkan oleh server",
    symptom: "Browser mengirim origin yang belum masuk trusted origins backend.",
    steps: [
      "Pastikan FRONTEND_URL dan BETTER_AUTH_URL di backend sesuai host yang sedang dipakai.",
      "Restart backend setelah mengubah .env.",
      "Gunakan host yang konsisten saat mode tanpa DNS masih dipakai.",
    ],
  },
  {
    title: "Login berhasil tapi tidak masuk ke dashboard",
    symptom: "User sudah punya sesi, tetapi bisnis owner belum disetup atau guard frontend salah menangani status bisnis.",
    steps: [
      "Cek endpoint /api/business/me untuk memastikan respons-nya sesuai kondisi user.",
      "Owner baru harus diarahkan ke onboarding, bukan ke dashboard penuh.",
      "Admin dan moderator harus masuk ke route /admin.",
    ],
  },
  {
    title: "Update status client gagal di halaman admin",
    symptom: "Tombol simpan dipencet tetapi perubahan tidak tersimpan atau keluar 404.",
    steps: [
      "Cek request PATCH ke /api/admin/subscriptions/:businessId.",
      "Pastikan browser sudah memuat bundle frontend terbaru.",
      "Pastikan akun yang login memang admin atau moderator.",
    ],
  },
  {
    title: "UI terasa tidak sinkron setelah deploy",
    symptom: "Backend sehat, tapi browser masih menampilkan perilaku lama atau error lama.",
    steps: [
      "Pastikan index.html tidak tersimpan di cache browser terlalu lama.",
      "Tutup tab lama lalu buka ulang aplikasi di tab baru.",
      "Verifikasi file baru memang sudah ada di /frontend/dist.",
    ],
  },
];

const operationalChecks = [
  "curl http://127.0.0.1:3001/api/health",
  "pm2 status",
  "pm2 logs teknikos-backend",
  "nginx -t",
  "systemctl reload nginx",
  "sqlite3 /var/www/teknikos/backend/data/teknikos.db '.tables'",
];

const quickStartSteps = [
  "Owner daftar atau login, lalu selesaikan onboarding bisnis.",
  "Masukkan pelanggan, teknisi, dan job aktif agar dashboard langsung punya konteks.",
  "Gunakan invoice, inventory, dan kontrak sesuai alur operasional yang mulai aktif.",
  "Untuk client berbayar atau bermasalah, admin mengelola plan dan status subscription dari panel admin.",
];

const faqItems = [
  {
    question: "Coreveta cocok untuk bisnis apa?",
    answer:
      "Paling cocok untuk jasa teknik seperti servis AC, plumber, listrik, maintenance rutin, dan tim lapangan yang butuh koordinasi job plus penagihan.",
  },
  {
    question: "Apakah owner kecil tetap bisa mulai?",
    answer:
      "Bisa. Alur Starter tetap memungkinkan setup bisnis, job dasar, pelanggan, dan invoice sebelum tim tumbuh lebih besar.",
  },
  {
    question: "Kalau ada error setelah deploy harus mulai dari mana?",
    answer:
      "Mulai dari health check backend, cek PM2, cek Nginx, lalu lihat Network tab browser untuk memastikan path API dan status code yang benar.",
  },
  {
    question: "Kenapa halaman admin penting?",
    answer:
      "Karena admin subscription memisahkan kontrol client dari data operasional, jadi plan, status, dan reset password bisa dikelola tanpa mengutak-atik isi bisnis client.",
  },
];

const supportWhatsappLink =
  "https://wa.me/6281354444967?text=Halo%20Coreveta,%20saya%20ingin%20tanya%20fitur%20atau%20minta%20bantuan%20troubleshooting.";

export default function FeatureGuidePage() {
  return (
    <div className="landing-page guide-page">
      <header className="landing-navbar">
        <div className="brand-mark brand-mark--hero">
          <div className="brand-mark__icon">T</div>
          <div>
            <strong>Coreveta</strong>
            <span>Panduan fitur dan troubleshooting</span>
          </div>
        </div>
        <nav className="landing-navbar__links">
          <Link to="/">Landing</Link>
          <a href="#fitur-utama">Fitur</a>
          <a href="#troubleshooting">Troubleshooting</a>
          <Link to="/login">Login</Link>
        </nav>
      </header>

      <section className="landing-hero guide-hero">
        <div className="landing-hero__copy">
          <span className="eyebrow-pill">Panduan Cepat Coreveta</span>
          <h1>Halaman publik untuk menjelaskan fitur inti dan menangani masalah yang paling sering muncul di Coreveta.</h1>
          <p>
            Cocok untuk owner, admin, tim internal, atau calon client yang ingin memahami fungsi
            tiap modul tanpa menebak-nebak, sekaligus punya checklist saat ada error.
          </p>
          <div className="landing-hero__actions">
            <a href="#fitur-utama" className="btn btn--secondary">
              Lihat Fitur
            </a>
            <a href="#troubleshooting" className="btn btn--primary">
              Buka Troubleshooting
            </a>
            <Link to="/register" className="btn btn--secondary">
              Coba Coreveta
            </Link>
          </div>
        </div>

        <div className="landing-hero__panel">
          <div className="surface-card guide-highlight">
            <div className="guide-highlight__icon">
              <ShieldCheck size={20} />
            </div>
            <h3>Satu halaman untuk orientasi dan respon cepat</h3>
            <p>
              Halaman ini merangkum apa yang dikerjakan Coreveta, modul yang paling penting, dan
              langkah pertama yang perlu dilakukan saat terjadi error login, origin, atau 404.
            </p>
            <ul className="guide-bullet-list">
              <li>Penjelasan fitur owner dan admin</li>
              <li>Daftar trouble yang paling sering muncul</li>
              <li>Checklist command untuk cek server</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="fitur-utama" className="guide-section">
        <div className="guide-section__heading">
          <span className="eyebrow">Fitur Utama</span>
          <h2>Modul yang benar-benar dipakai untuk menjalankan operasional</h2>
          <p>
            Coreveta dibangun untuk alur jasa teknik sehari-hari: job, teknisi, pelanggan, tagihan,
            sparepart, kontrak, dan kontrol client dari sisi admin.
          </p>
        </div>
        <div className="guide-grid">
          {featureSections.map((section, index) => (
            <article key={section.title} className="surface-card guide-card">
              <div className="guide-card__header">
                <span className="eyebrow-pill">0{index + 1}</span>
                <h3>{section.title}</h3>
              </div>
              <p>{section.summary}</p>
              <ul className="guide-bullet-list">
                {section.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section id="troubleshooting" className="guide-section guide-section--alt">
        <div className="guide-section__heading">
          <span className="eyebrow">Troubleshooting</span>
          <h2>Masalah yang paling sering bikin user bingung</h2>
          <p>
            Fokus bagian ini adalah masalah deploy dan operasional nyata: 404, origin, login, cache
            frontend, dan update status client di halaman admin.
          </p>
        </div>
        <div className="guide-grid">
          {troubleshootingCards.map((card) => (
            <article key={card.title} className="surface-card guide-card">
              <div className="guide-card__header guide-card__header--icon">
                <div className="guide-icon-chip">
                  <LifeBuoy size={18} />
                </div>
                <h3>{card.title}</h3>
              </div>
              <p className="guide-card__symptom">{card.symptom}</p>
              <ul className="guide-bullet-list">
                {card.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-section">
        <div className="guide-section__heading">
          <span className="eyebrow">Alur Pakai</span>
          <h2>Urutan singkat supaya user tidak bingung mulai dari mana</h2>
          <p>Bagian ini membantu owner baru dan tim internal memahami urutan implementasi yang paling masuk akal.</p>
        </div>
        <div className="guide-grid">
          {quickStartSteps.map((step, index) => (
            <article key={step} className="surface-card guide-card guide-card--compact">
              <div className="guide-card__header">
                <span className="eyebrow-pill">Step {index + 1}</span>
                <h3>{step}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-section">
        <div className="guide-section__heading">
          <span className="eyebrow">Alur Pakai</span>
          <h2>Urutan singkat supaya user baru tidak bingung mulai dari mana</h2>
          <p>Bagian ini cocok untuk owner baru, tim sales, atau tim deploy yang perlu menjelaskan flow Coreveta secara ringkas.</p>
        </div>
        <div className="guide-grid">
          {quickStartSteps.map((step, index) => (
            <article key={step} className="surface-card guide-card guide-card--compact">
              <div className="guide-card__header">
                <span className="eyebrow-pill">Step {index + 1}</span>
                <h3>{step}</h3>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="guide-section">
        <div className="guide-section__heading">
          <span className="eyebrow">Checklist Operasional</span>
          <h2>Command cepat saat perlu cek sistem</h2>
          <p>Mulai dari sini sebelum menyentuh env, database, atau menyimpulkan bug ada di backend.</p>
        </div>
        <div className="guide-ops-panel">
          <div className="surface-card guide-ops-card">
            <div className="guide-card__header guide-card__header--icon">
              <div className="guide-icon-chip">
                <Wrench size={18} />
              </div>
              <h3>Cek yang paling berguna</h3>
            </div>
            <ul className="guide-command-list">
              {operationalChecks.map((item) => (
                <li key={item}>
                  <code>{item}</code>
                </li>
              ))}
            </ul>
          </div>

          <div className="surface-card guide-ops-card">
            <div className="guide-card__header">
              <span className="eyebrow-pill">Saran Praktis</span>
              <h3>Supaya error yang sama tidak berulang</h3>
            </div>
            <ul className="guide-bullet-list">
              <li>Tutup tab lama setelah deploy frontend dan buka ulang aplikasi dari tab baru.</li>
              <li>Jangan jalankan seed lagi pada production yang sudah punya data user nyata.</li>
              <li>Backup SQLite sebelum perubahan schema atau data yang berisiko.</li>
              <li>Pastikan update status client di admin dilakukan dari akun staff yang benar.</li>
            </ul>
            <Link to="/demo-owner-dashboard" className="cta-inline-link">
              Lihat demo owner dashboard <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      <section className="guide-section guide-section--alt">
        <div className="guide-section__heading">
          <span className="eyebrow">FAQ</span>
          <h2>Pertanyaan yang paling sering muncul sebelum dan sesudah pakai</h2>
          <p>FAQ ini dibuat untuk membantu calon user, owner, dan tim deploy memahami konteks penggunaan Coreveta.</p>
        </div>
        <div className="guide-grid">
          {faqItems.map((item) => (
            <article key={item.question} className="surface-card guide-card">
              <div className="guide-card__header">
                <span className="eyebrow-pill">FAQ</span>
                <h3>{item.question}</h3>
              </div>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-banner guide-help-banner">
        <div>
          <span className="eyebrow">Butuh Bantuan?</span>
          <h2>Kalau ingin tanya fitur, minta demo, atau butuh bantuan troubleshooting, lanjut lewat WhatsApp.</h2>
          <p>Bagian ini bisa dipakai calon client maupun tim internal saat butuh kontak cepat tanpa membuka panel admin.</p>
        </div>
        <div className="cta-banner__actions">
          <a href={supportWhatsappLink} className="btn btn--secondary btn--inverse-soft" target="_blank" rel="noreferrer">
            <MessageCircle size={16} />
            Tanya via WhatsApp
          </a>
          <Link to="/register" className="cta-inline-link">
            Buat akun Coreveta <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <section className="guide-section guide-section--alt">
        <div className="guide-section__heading">
          <span className="eyebrow">FAQ</span>
          <h2>Pertanyaan yang paling sering muncul</h2>
          <p>FAQ ini dibuat agar calon user dan tim internal bisa cepat memahami konteks produk tanpa harus membuka seluruh dashboard.</p>
        </div>
        <div className="guide-grid">
          {faqItems.map((item) => (
            <article key={item.question} className="surface-card guide-card">
              <div className="guide-card__header">
                <span className="eyebrow-pill">FAQ</span>
                <h3>{item.question}</h3>
              </div>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-banner guide-help-banner">
        <div>
          <span className="eyebrow">Bantuan Cepat</span>
          <h2>Kalau masih bingung setelah baca panduan, lanjutkan pertanyaan atau demo lewat WhatsApp.</h2>
          <p>Bagian ini dibuat untuk visitor, calon client, dan tim internal yang butuh jalur bantuan cepat tanpa masuk ke area aplikasi.</p>
        </div>
        <div className="cta-banner__actions">
          <a href={supportWhatsappLink} className="btn btn--secondary btn--inverse-soft" target="_blank" rel="noreferrer">
            <MessageCircle size={16} />
            Tanya via WhatsApp
          </a>
          <Link to="/register" className="cta-inline-link">
            Buat akun Coreveta <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

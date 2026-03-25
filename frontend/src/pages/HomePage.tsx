import { ArrowRight, CheckCircle2, MessageCircleMore } from "lucide-react";
import { FormEvent, type ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LandingHeroTemplate } from "../components/marketing/LandingHeroTemplate";
import { FeatureIcon } from "../components/Layout";
import { MarketingFooter } from "../components/ui/marketing-footer";
import { GlowingEffect } from "../components/ui/glowing-effect";
import { ShimmerButton } from "../components/ui/shimmer-button";

const featureCards = [
  "Dispatch dan kalender kerja",
  "Invoice dan billing lebih rapi",
  "CRM pelanggan yang hidup",
  "Inventori, kontrak, dan WAHA",
];

const narrativeCards = [
  {
    label: "Ruang Dispatch",
    title: "Owner tahu siapa berangkat ke mana, tanpa bongkar chat satu-satu.",
    body: "Board operasional dibuat seperti ruang kontrol kecil: urgen terlihat, teknisi aktif terlihat, dan job yang belum ada owner-nya langsung kelihatan.",
  },
  {
    label: "Ritme Billing",
    title: "Tagihan tidak lagi datang belakangan setelah kerja lapangan selesai.",
    body: "Biaya jasa, sparepart, invoice overdue, dan queue siap ditagih ditata agar cashflow ikut terbaca, bukan cuma job count.",
  },
  {
    label: "Memori Pelanggan",
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
    title: "Kokpit Operasional",
    body: "Queue dispatch, billing, dan CRM follow up dibaca dari satu panel yang langsung bisa ditindak.",
  },
  {
    title: "Kalender & Deadline",
    body: "Jadwal kerja dan tenggat job terlihat berdampingan, jadi owner tidak cuma melihat list job.",
  },
  {
    title: "Setup WAHA",
    body: "Rules WhatsApp dan langkah connect WAHA dipisah supaya setup lebih mudah dipahami client.",
  },
];

const chatbotFaq = [
  {
    question: "TeknikOS bisa dipakai untuk apa?",
    answer: "Untuk mengatur job, teknisi, pelanggan, invoice, inventori, dan kontrak servis dalam satu dashboard owner.",
  },
  {
    question: "Apakah bisa untuk tim kecil dulu?",
    answer: "Bisa. Paket Starter cocok untuk mulai rapi dulu, lalu upgrade saat teknisi dan job makin banyak.",
  },
  {
    question: "Bagaimana alur invoice-nya?",
    answer: "Kamu bisa buat invoice manual, tarik dari job, lalu pantau status pembayaran tanpa catatan terpisah.",
  },
  {
    question: "Apa bedanya Pro dan Bisnis?",
    answer: "Pro cocok untuk operasional tim aktif sehari-hari. Bisnis lebih pas untuk tim lebih besar dan monitoring lebih luas.",
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
      answer: "TeknikOS membantu bikin job, assign satu atau beberapa teknisi, lalu pantau status kerja dari berangkat sampai selesai dalam satu board.",
    };
  }

  if (normalized.includes("invoice") || normalized.includes("tagih") || normalized.includes("bayar")) {
    return {
      question: trimmedQuestion || "Bagaimana invoice dan pembayaran berjalan?",
      answer: "Invoice bisa dibuat manual atau dari job, lalu status pembayarannya dipantau terpisah supaya owner tahu mana yang sudah dibayar dan mana yang masih perlu follow up.",
    };
  }

  if (normalized.includes("stok") || normalized.includes("inventory") || normalized.includes("sparepart")) {
    return {
      question: trimmedQuestion || "Apakah stok sparepart ikut tercatat?",
      answer: "Ya. Sparepart yang dipakai di pekerjaan bisa dicatat, stok inventori ikut berkurang, dan owner bisa lihat item mana yang mulai menipis.",
    };
  }

  if (normalized.includes("pelanggan") || normalized.includes("crm") || normalized.includes("customer")) {
    return {
      question: trimmedQuestion || "Apa yang disimpan untuk pelanggan?",
      answer: "Data pelanggan, alamat, histori job, unit yang pernah ditangani, invoice, dan kontrak servis disimpan supaya follow up terasa lebih rapi.",
    };
  }

  if (normalized.includes("kontrak") || normalized.includes("maintenance")) {
    return {
      question: trimmedQuestion || "Bisa untuk kontrak maintenance?",
      answer: "Bisa. Paket Pro dan Bisnis mendukung kontrak servis berkala supaya owner bisa pantau jadwal visit berikutnya dan renewal yang mendekat.",
    };
  }

  if (normalized.includes("plan") || normalized.includes("pro") || normalized.includes("bisnis") || normalized.includes("starter")) {
    return {
      question: trimmedQuestion || "Plan mana yang cocok untuk saya?",
      answer: "Starter cocok untuk mulai gratis. Pro pas untuk operasional harian yang sudah aktif. Bisnis cocok jika tim dan kontrol owner sudah lebih besar.",
    };
  }

  return {
    question: trimmedQuestion || "Fitur apa yang paling sering dipakai?",
    answer: "Yang paling sering dipakai owner biasanya dashboard harian, job board, pelanggan, invoice, inventori, dan kontrak. Kalau mau, mulai dulu dari pertanyaan tentang job, invoice, atau plan.",
  };
}

function buildPlanRegisterLink(plan: string) {
  return `/register?plan=${encodeURIComponent(plan)}`;
}

const SALES_WHATSAPP_LINK =
  "https://wa.me/6281354444967?text=Halo%20sales%20TeknikOS,%20saya%20ingin%20tanya%20demo%20dan%20langganan.";

function InteractiveInfoCard({
  className,
  children,
  variant = "default",
  spread = 30,
  proximity = 90,
  inactiveZone = 0.42,
}: {
  className: string;
  children: ReactNode;
  variant?: "default" | "white";
  spread?: number;
  proximity?: number;
  inactiveZone?: number;
}) {
  return (
    <article className={`${className} group relative overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-lg`}>
      <GlowingEffect
        spread={spread}
        blur={0}
        inactiveZone={inactiveZone}
        proximity={proximity}
        variant={variant}
        glow
        disabled={false}
        borderWidth={1}
        movementDuration={0.85}
        className="rounded-[inherit] opacity-40 group-hover:opacity-100"
      />
      <div className="relative z-10">{children}</div>
    </article>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const [draftQuestion, setDraftQuestion] = useState("");
  const [activeChat, setActiveChat] = useState(chatbotFaq[0]);

  function handleChatSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveChat(resolveChatAnswer(draftQuestion));
  }

  return (
    <div className="landing-page bg-slate-50 text-slate-900 min-h-screen font-sans selection:bg-sky-200">
      <LandingHeroTemplate salesWhatsappLink={SALES_WHATSAPP_LINK} />

      {/* Narrative Section: Clean White Cards */}
      <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-20 lg:grid-cols-3">
        {narrativeCards.map((item) => (
          <InteractiveInfoCard
            key={item.label}
            className={`rounded-3xl border border-slate-200 p-8 shadow-sm bg-white hover:border-sky-200`}
          >
            <span className="text-xs uppercase tracking-widest text-sky-600 font-semibold">{item.label}</span>
            <h3 className="mt-4 font-['Space_Grotesk'] text-2xl font-bold tracking-tight text-slate-900">{item.title}</h3>
            <p className="mt-4 text-sm leading-relaxed text-slate-500">{item.body}</p>
          </InteractiveInfoCard>
        ))}
      </section>

      {/* Latest Features */}
      <section className="mx-auto w-full max-w-7xl px-6 py-20 border-t border-slate-100">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="text-xs uppercase tracking-widest text-sky-600 font-semibold">Pembaruan produk</span>
            <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-slate-900 md:text-5xl leading-tight">
              Landing sekarang mengikuti wajah app yang benar-benar dipakai.
            </h2>
          </div>
          <p className="text-sm leading-relaxed text-slate-500 md:max-w-md">
            Bukan lagi halaman promo generik. Kalender, deadline, WAHA, dan alur owner sekarang
            dibawa ke permukaan supaya calon user melihat konteks operasional yang nyata.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {latestFeatureCards.map((item) => (
            <InteractiveInfoCard key={item.title} className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm hover:border-sky-200">
              <span className="text-xs uppercase tracking-widest text-slate-400 font-semibold">Fitur terbaru</span>
              <h3 className="mt-4 font-['Space_Grotesk'] text-xl font-bold tracking-tight text-slate-800">{item.title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-slate-500">{item.body}</p>
            </InteractiveInfoCard>
          ))}
        </div>
      </section>

      {/* Live Preview vs Communication */}
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="landing-anchor-section rounded-3xl border border-slate-200 bg-white p-10 shadow-sm">
          <span className="text-xs uppercase tracking-widest text-sky-600 font-semibold">Preview dashboard live</span>
          <h2 className="mt-4 font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-slate-900">
            Yang dilihat calon user di landing sekarang lebih dekat ke dashboard live.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            Struktur panel, istilah, dan prioritas sekarang sengaja dibuat mirip dengan workspace owner.
            Ini membantu user memahami TeknikOS sebagai tool operasional, bukan sekadar katalog fitur.
          </p>
          <div className="mt-10 space-y-4">
            {livePanelPreview.map((item, index) => (
              <div key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50 px-6 py-5 hover:bg-white transition-colors">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold block mb-2">Live 0{index + 1}</span>
                <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{item.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-slate-50 p-10 shadow-sm flex flex-col justify-center">
          <span className="text-xs uppercase tracking-widest text-sky-600 font-semibold">Komunikasi lapangan</span>
          <h2 className="mt-4 font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-slate-900">
            WhatsApp tetap dipakai, tapi format komunikasinya sekarang jauh lebih rapi.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            Cocok untuk fase sekarang: owner belum perlu bot penuh, tapi sudah punya pola kirim progres,
            invoice, dan reminder tugas yang tidak improvisasi terus.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
            {communicationCards.map((item, index) => (
              <InteractiveInfoCard key={item.title} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm hover:border-sky-200">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold block mb-3">0{index + 1}</span>
                <h3 className="text-base font-bold text-slate-800 leading-snug">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-slate-500">{item.body}</p>
              </InteractiveInfoCard>
            ))}
          </div>
        </div>
      </section>

      {/* Dark Sections: Chatbot & Features */}
      <section className="mx-auto w-full max-w-7xl px-6 py-20">
        <div className="rounded-[40px] bg-slate-900 p-8 md:p-12 lg:p-16 text-white shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,rgba(56,189,248,0.06),transparent_60%)] pointer-events-none"></div>
          
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] relative z-10">
            {/* Ask AI Section */}
            <div>
              <span className="text-xs uppercase tracking-widest text-sky-400 font-semibold">Tanya fitur</span>
              <h2 className="mt-4 font-['Space_Grotesk'] text-4xl font-bold tracking-tight text-white leading-tight">
                Masih bingung TeknikOS cocok untuk apa? Tanya cepat di sini.
              </h2>
              <p className="mt-6 text-base leading-relaxed text-slate-300">
                Saya ringkas dengan bahasa yang mudah dipahami, jadi calon client tidak perlu menebak-nebak
                fungsi setiap menu di aplikasi.
              </p>
              
              <div className="mt-12 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md p-6 lg:p-8">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-sky-500 text-white shadow-lg shadow-sky-500/30">
                    <MessageCircleMore size={20} />
                  </div>
                  <div>
                    <strong className="block text-lg text-white font-bold">Asisten TeknikOS</strong>
                    <p className="text-sm text-slate-400 mt-1">Pilih pertanyaan instalasi & fitur.</p>
                  </div>
                </div>
                
                <div className="mt-8 flex flex-wrap gap-2">
                  {chatbotFaq.map((item) => (
                    <button
                      key={item.question}
                      type="button"
                      className={`cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors duration-200 outline-none focus-visible:ring-2 focus-visible:ring-sky-500 ${
                        activeChat?.question === item.question
                          ? "border-sky-500 bg-sky-500/20 text-white"
                          : "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white hover:border-white/20"
                      }`}
                      onClick={() => {
                        setDraftQuestion(item.question);
                        setActiveChat(item);
                      }}
                    >
                      {item.question}
                    </button>
                  ))}
                </div>
                
                <form className="mt-8 flex flex-col gap-3 sm:flex-row relative" onSubmit={handleChatSubmit}>
                  <input
                    type="text"
                    value={draftQuestion}
                    onChange={(event) => setDraftQuestion(event.target.value)}
                    placeholder="Contoh: bisa atur stok sparepart?"
                    className="min-h-[56px] flex-1 appearance-none rounded-2xl border border-white/10 bg-black/20 px-5 text-white outline-none placeholder:text-slate-500 focus:border-sky-500/50 focus:bg-black/40 transition-all font-medium"
                  />
                  <button type="submit" className="inline-flex min-h-[56px] cursor-pointer items-center justify-center rounded-2xl bg-sky-500 px-8 text-sm font-bold text-white transition-all duration-200 hover:bg-sky-400 hover:shadow-lg hover:shadow-sky-500/25 outline-none focus-visible:ring-2 focus-visible:ring-sky-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900">
                    Tanya
                  </button>
                </form>
                
                <div className="mt-6 rounded-2xl border border-white/5 bg-white/5 p-6 animate-in slide-in-from-bottom-2 fade-in duration-300 relative">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-sky-500 rounded-l-2xl"></div>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-2">Jawaban</span>
                  <strong className="block text-xl font-bold text-white tracking-tight">{activeChat?.question}</strong>
                  <p className="mt-3 text-base leading-relaxed text-slate-300">{activeChat?.answer}</p>
                </div>
              </div>
            </div>

            {/* Feature Cards Grid (Dark) */}
            <div id="fitur" className="flex flex-col justify-center">
              <span className="text-xs uppercase tracking-widest text-sky-400 font-semibold">Masalah & Solusi</span>
              <h2 className="mt-4 font-['Space_Grotesk'] text-4xl font-bold tracking-tight text-white leading-tight">
                Tinggalkan spreadsheet dan catatan kertas manual.
              </h2>
              <div className="mt-12 grid gap-4 grid-cols-1 sm:grid-cols-2">
                {featureCards.map((card) => (
                  <InteractiveInfoCard 
                    key={card} 
                    className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:border-white/20"
                    variant="white"
                  >
                    <div className="text-sky-400 mb-4 opacity-80"><FeatureIcon /></div>
                    <h3 className="text-lg font-bold text-white">{card}</h3>
                    <p className="mt-3 text-sm leading-relaxed text-slate-400">
                      {card === "Dispatch dan kalender kerja" && "Job dibuat, di-assign, dipantau, lalu dibaca melalui kalender interaktif."}
                      {card === "Invoice dan billing lebih rapi" && "Invoice auto-generate dari status job yang selesai otomatis."}
                      {card === "CRM pelanggan yang hidup" && "Alamat, unit mesin, dan job history tersimpan dalam satu layar utuh."}
                      {card === "Inventori, kontrak, dan WAHA" && "Kendali penuh atas rotasi stok suku cadang, dan pengingat via bot."}
                    </p>
                  </InteractiveInfoCard>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Workflow & Pricing */}
      <section className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-20 lg:grid-cols-[0.8fr_1.2fr]">
        <section id="workflow" className="landing-anchor-section rounded-3xl border border-slate-200 bg-white p-10 shadow-sm flex flex-col justify-center">
          <span className="text-xs uppercase tracking-widest text-sky-600 font-semibold">Alur inti</span>
          <h2 className="mt-4 font-['Space_Grotesk'] text-3xl font-bold tracking-tight text-slate-900">
            Dari job masuk sampai invoice lunas, owner tetap pegang kontrol.
          </h2>
          <div className="mt-10 space-y-6">
            {[
              "Buat job dan assign teknisi dalam hitungan detik.",
              "Pantau status pending, on the way, in progress, atau done.",
              "Baca jadwal dari kalender, konversi ke invoice, monitor tagihan.",
            ].map((text, index) => (
               <div key={text} className="flex gap-4 items-start group cursor-default">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-600 font-bold transition-transform group-hover:scale-110 shadow-sm">
                    {index + 1}
                  </span>
                  <p className="text-base leading-relaxed text-slate-600 font-medium pt-1">{text}</p>
                </div>
            ))}
          </div>
        </section>

        <section id="harga" className="landing-anchor-section rounded-3xl border border-slate-200 bg-slate-50 p-10 shadow-sm">
          <div className="mb-10 lg:text-center">
            <span className="text-xs uppercase tracking-widest text-sky-600 font-semibold block mb-2">Harga Sederhana</span>
            <h2 className="font-['Space_Grotesk'] text-4xl font-bold tracking-tight text-slate-900">
              Mulai gratis, upgrade nanti.
            </h2>
            <p className="mt-4 text-base text-slate-500">
              Dirancang untuk bengkel kecil sampai tim multi-cabang tanpa harga siluman.
            </p>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            <article className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 flex flex-col shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">Starter</h3>
              <div className="mt-4 flex items-start gap-1">
                <span className="mt-2 text-sm font-bold text-slate-400">Rp</span>
                <strong className="font-['Space_Grotesk'] text-5xl tracking-tight text-slate-900">0</strong>
              </div>
              <p className="mt-3 text-sm text-slate-500 pb-6 border-b border-slate-100 mb-6 flex-1">Solois baru mulai.</p>
              <ul className="space-y-4 text-sm text-slate-600 mb-8 font-medium">
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-sky-500 shrink-0" /> Job list dasar</li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-sky-500 shrink-0" /> List Pelanggan</li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-sky-500 shrink-0" /> Invoice statis</li>
              </ul>
              <button onClick={() => navigate(buildPlanRegisterLink("Starter"))} className="w-full rounded-2xl border flex items-center justify-center border-slate-200 bg-slate-50 py-3.5 text-sm font-bold text-slate-700 hover:bg-white transition-colors hover:shadow-sm">
                Ambil Starter
              </button>
            </article>

            <article className="rounded-3xl bg-slate-900 p-6 md:p-8 flex flex-col shadow-xl shadow-slate-900/10 relative overflow-hidden transform md:-translate-y-4">
              <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.15),transparent_70%)] pointer-events-none"></div>
              <div className="inline-block rounded-full bg-sky-500/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-sky-400 mb-4 self-start border border-sky-500/20">
                Paling Pas
              </div>
              <h3 className="text-xl font-bold text-white">Pro</h3>
              <div className="mt-2 flex items-start gap-1">
                <span className="mt-2 text-sm font-medium text-sky-200">Rp</span>
                <strong className="font-['Space_Grotesk'] text-5xl tracking-tight text-white">249<span className="text-2xl text-slate-500">.k</span></strong>
                <span className="self-end pb-1 text-xs text-slate-500">/bln</span>
              </div>
              <p className="mt-3 text-sm text-slate-400 pb-6 border-b border-white/10 mb-6 flex-1">Untuk max 4 teknisi dan admin.</p>
              <ul className="space-y-4 text-sm text-slate-200 mb-8 font-medium">
                <li className="flex gap-3 text-sky-300"><CheckCircle2 size={18} className="text-sky-400 shrink-0" /> Semua Starter +</li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-sky-400 shrink-0 opacity-50" /> Live Dashboard</li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-sky-400 shrink-0 opacity-50" /> CRM & Histori</li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-sky-400 shrink-0 opacity-50" /> Otomasi WAHA</li>
              </ul>
              <ShimmerButton onClick={() => navigate(buildPlanRegisterLink("Pro"))} className="w-full rounded-2xl py-3.5 text-sm font-bold text-white" shimmerColor="#38bdf8" background="#0ea5e9">
                Mulai Berlangganan
              </ShimmerButton>
            </article>

            <article className="rounded-3xl border border-slate-200 bg-white p-6 md:p-8 flex flex-col shadow-sm">
              <h3 className="text-xl font-bold text-slate-900">Bisnis</h3>
              <div className="mt-4 flex items-start gap-1">
                <span className="mt-2 text-sm font-bold text-slate-400">Rp</span>
                <strong className="font-['Space_Grotesk'] text-5xl tracking-tight text-slate-900">499<span className="text-2xl text-slate-400">.k</span></strong>
                <span className="self-end pb-1 text-xs text-slate-400">/bln</span>
              </div>
              <p className="mt-3 text-sm text-slate-500 pb-6 border-b border-slate-100 mb-6 flex-1">Ekspansi lebih luas.</p>
              <ul className="space-y-4 text-sm text-slate-600 mb-8 font-medium">
                <li className="flex gap-3 text-slate-900"><CheckCircle2 size={18} className="text-slate-600 shrink-0" /> Semua fitur Pro</li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-slate-400 shrink-0" /> Multi tim lapangan</li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-slate-400 shrink-0" /> Konsolidasi laporan</li>
                <li className="flex gap-3"><CheckCircle2 size={18} className="text-slate-400 shrink-0" /> Limit API extra</li>
              </ul>
              <button onClick={() => navigate(buildPlanRegisterLink("Bisnis"))} className="w-full rounded-2xl border flex items-center justify-center border-slate-200 bg-slate-50 py-3.5 text-sm font-bold text-slate-700 hover:bg-white transition-colors hover:shadow-sm">
                Ambil Bisnis
              </button>
            </article>
          </div>
        </section>
      </section>

      {/* Call To Action */}
      <section className="mx-auto w-full max-w-5xl px-6 py-12 pb-24">
        <div className="rounded-[40px] bg-gradient-to-tr from-slate-900 to-slate-800 p-10 md:p-16 text-center shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.1),transparent_70%)] pointer-events-none"></div>
          
          <h2 className="font-['Space_Grotesk'] text-4xl md:text-5xl font-bold tracking-tight text-white mb-6 relative z-10 leading-tight">
            Saatnya naik kelas, tinggalkan chat grup.
          </h2>
          <p className="text-sky-100/80 text-lg mb-12 max-w-2xl mx-auto relative z-10">
            Setup bisnis teknisi Anda hari ini juga, gratis, dan lihat operasional lebih presisi tanpa sakit kepala.
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 relative z-10">
            <ShimmerButton
              onClick={() => navigate("/register")}
              className="rounded-2xl px-8 py-4 text-base font-bold text-slate-900 shadow-xl"
              shimmerColor="rgba(255,255,255,0.8)"
              background="#ffffff"
            >
              Gaul Bersama TeknikOS
            </ShimmerButton>
            <Link
              to="/demo-owner-dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/5 px-8 py-4 text-base font-bold text-balance text-white transition hover:bg-white/10 backdrop-blur-md border border-white/10"
            >
              Lihat Demo Dashboard
              <ArrowRight size={18} />
            </Link>
          </div>
          <div className="mt-12 flex flex-wrap justify-center gap-4 md:gap-8 relative z-10 text-slate-400 text-sm font-medium">
            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-sky-500" /> Setup cepat 10 menit</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-sky-500" /> Lokal & Berbahasa Indonesia</div>
            <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-sky-500" /> PostgreSQL Node backend siap scale</div>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

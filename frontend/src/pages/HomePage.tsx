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
    <article className={`${className} group relative overflow-hidden transition-transform duration-300 ease-out hover:-translate-y-1`}>
      <GlowingEffect
        spread={spread}
        blur={0}
        inactiveZone={inactiveZone}
        proximity={proximity}
        variant={variant}
        glow
        disabled={false}
        borderWidth={2}
        movementDuration={0.85}
        className="rounded-[inherit]"
      />
      <div className="relative">{children}</div>
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
    <div className="landing-page bg-[radial-gradient(circle_at_top,#eff8f1_0%,#f7f6ef_48%,#eef6f1_100%)] text-[#10231b]">
      <LandingHeroTemplate salesWhatsappLink={SALES_WHATSAPP_LINK} />

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-6 lg:grid-cols-3">
        {narrativeCards.map((item, index) => (
          <InteractiveInfoCard
            key={item.label}
            className={`rounded-[30px] border p-6 shadow-[0_24px_80px_rgba(18,66,49,0.10)] ${
              index === 0
                ? "border-[#b9dbc7] bg-white/80"
                : index === 1
                  ? "border-[#d7eadc] bg-[#edf7ef]"
                  : "border-[#bfe6cf] bg-[linear-gradient(180deg,#f5fff7,#e7f7ee)]"
            }`}
          >
            <span className="text-[11px] uppercase tracking-[0.18em] text-[#2d7b5f]">{item.label}</span>
            <h3 className="mt-4 font-['Space_Grotesk'] text-2xl font-semibold tracking-[-0.04em] text-[#10231b]">{item.title}</h3>
            <p className="mt-3 text-sm leading-7 text-[#54655c]">{item.body}</p>
          </InteractiveInfoCard>
        ))}
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-6">
        <div className="mb-6 flex items-end justify-between gap-6">
          <div>
            <span className="text-[11px] uppercase tracking-[0.18em] text-[#2d7b5f]">Pembaruan produk</span>
            <h2 className="mt-3 font-['Space_Grotesk'] text-3xl font-semibold tracking-[-0.05em] text-[#10231b] md:text-4xl">
              Landing sekarang mengikuti wajah app yang benar-benar dipakai.
            </h2>
          </div>
          <p className="hidden max-w-xl text-sm leading-7 text-[#56665e] lg:block">
            Bukan lagi halaman promo generik. Kalender, deadline, WAHA, dan alur owner sekarang
            dibawa ke permukaan supaya calon user melihat konteks operasional yang nyata.
          </p>
        </div>
        <div className="grid gap-5 lg:grid-cols-3">
          {latestFeatureCards.map((item) => (
            <InteractiveInfoCard key={item.title} className="rounded-[28px] border border-[#d4e8da] bg-white/82 p-6 shadow-[0_20px_60px_rgba(18,66,49,0.08)]">
              <span className="text-[11px] uppercase tracking-[0.18em] text-[#2d7b5f]">Fitur terbaru</span>
              <h3 className="mt-4 font-['Space_Grotesk'] text-2xl font-semibold tracking-[-0.04em] text-[#10231b]">{item.title}</h3>
              <p className="mt-3 text-sm leading-7 text-[#56665e]">{item.body}</p>
            </InteractiveInfoCard>
          ))}
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="landing-anchor-section rounded-[32px] border border-[#d4e8da] bg-white/84 p-7 shadow-[0_24px_80px_rgba(18,66,49,0.08)]">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[#2d7b5f]">Preview dashboard live</span>
          <h2 className="mt-4 font-['Space_Grotesk'] text-3xl font-semibold tracking-[-0.05em] text-[#10231b]">
            Yang dilihat calon user di landing sekarang lebih dekat ke dashboard live.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#56665e]">
            Struktur panel, istilah, dan prioritas sekarang sengaja dibuat mirip dengan workspace owner.
            Ini membantu user memahami TeknikOS sebagai tool operasional, bukan sekadar katalog fitur.
          </p>
          <div className="mt-8 space-y-3">
            {livePanelPreview.map((item, index) => (
              <InteractiveInfoCard key={item.title} className="rounded-[24px] border border-[#d7eadc] bg-[#f4fbf5] px-4 py-4 shadow-[0_12px_30px_rgba(18,66,49,0.05)]">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#2d7b5f]">Live 0{index + 1}</span>
                <h3 className="mt-2 text-lg font-semibold text-[#10231b]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#56665e]">{item.body}</p>
              </InteractiveInfoCard>
            ))}
          </div>
        </div>

        <div className="rounded-[32px] border border-[#c8ead5] bg-[linear-gradient(180deg,#eff9f1,#e3f4ea)] p-7 shadow-[0_24px_80px_rgba(18,66,49,0.08)]">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[#2d7b5f]">Komunikasi lapangan</span>
          <h2 className="mt-4 font-['Space_Grotesk'] text-3xl font-semibold tracking-[-0.05em] text-[#10231b]">
            WhatsApp tetap dipakai, tapi format komunikasinya sekarang jauh lebih rapi.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#56665e]">
            Cocok untuk fase sekarang: owner belum perlu bot penuh, tapi sudah punya pola kirim progres,
            invoice, dan reminder tugas yang tidak improvisasi terus.
          </p>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {communicationCards.map((item, index) => (
              <InteractiveInfoCard key={item.title} className="rounded-[24px] border border-[#d1e7d7] bg-white/78 p-5 shadow-[0_12px_30px_rgba(18,66,49,0.05)]">
                <span className="text-[11px] uppercase tracking-[0.18em] text-[#2d7b5f]">0{index + 1}</span>
                <h3 className="mt-3 text-lg font-semibold text-[#10231b]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#56665e]">{item.body}</p>
              </InteractiveInfoCard>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="rounded-[32px] border border-[#c8ead5] bg-[linear-gradient(160deg,#0f392c,#134735_55%,#185642)] p-7 shadow-[0_24px_80px_rgba(10,52,39,0.22)]">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[#bfe9d7]">Tanya fitur</span>
          <h2 className="mt-4 font-['Space_Grotesk'] text-3xl font-semibold tracking-[-0.05em] text-white">
            Masih bingung TeknikOS cocok untuk apa? Tanya cepat di sini.
          </h2>
          <p className="mt-4 text-sm leading-7 text-white/62">
            Saya ringkas dengan bahasa yang mudah dipahami, jadi calon client tidak perlu menebak-nebak
            fungsi setiap menu di aplikasi.
          </p>
          <div className="mt-8 rounded-[26px] border border-white/8 bg-black/20 p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#dff7ee] text-[#0b5f4e]">
                <MessageCircleMore size={18} />
              </div>
              <div>
                <strong className="block text-white">Asisten Fitur TeknikOS</strong>
                <p className="text-sm text-white/54">Pilih pertanyaan yang paling sering ditanyakan owner.</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap gap-3">
              {chatbotFaq.map((item) => (
                <button
                  key={item.question}
                  type="button"
                  className={`rounded-full border px-4 py-2 text-sm transition ${
                    activeChat?.question === item.question
                      ? "border-[#61d0a8] bg-[#61d0a8]/16 text-white"
                      : "border-white/12 bg-white/8 text-white/72 hover:border-white/24 hover:text-white"
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
            <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={handleChatSubmit}>
              <input
                type="text"
                value={draftQuestion}
                onChange={(event) => setDraftQuestion(event.target.value)}
                placeholder="Contoh: bisa atur stok sparepart?"
                className="min-h-12 flex-1 rounded-2xl border border-white/10 bg-black/25 px-4 text-white outline-none placeholder:text-white/35 focus:border-[#61d0a8]/40"
              />
              <button type="submit" className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-[#dff7ee] px-6 text-sm font-semibold text-[#0d523f]">
                Tanya
              </button>
            </form>
            <div className="mt-5 rounded-[24px] border border-white/8 bg-white/[0.03] p-5">
              <span className="text-[11px] uppercase tracking-[0.18em] text-white/42">Jawaban</span>
              <strong className="mt-3 block text-lg text-white">{activeChat?.question}</strong>
              <p className="mt-2 text-sm leading-7 text-white/60">{activeChat?.answer}</p>
            </div>
          </div>
        </div>

        <section id="fitur" className="landing-anchor-section scroll-mt-28 rounded-[32px] border border-[#d4e8da] bg-white/84 p-7 shadow-[0_24px_80px_rgba(18,66,49,0.08)]">
          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <article className="rounded-[28px] border border-[#d7eadc] bg-[linear-gradient(180deg,#f4fbf5,#ecf8ef)] p-6">
              <span className="text-[11px] uppercase tracking-[0.18em] text-[#2d7b5f]">Masalah lama</span>
              <h2 className="mt-4 font-['Space_Grotesk'] text-3xl font-semibold tracking-[-0.05em] text-[#10231b]">
                WhatsApp group, catatan manual, dan spreadsheet bikin bisnis susah scale.
              </h2>
              <ul className="mt-5 space-y-3 text-sm leading-7 text-[#56665e]">
                <li>Double booking karena jadwal tersebar di chat.</li>
                <li>Owner tidak tahu teknisi mana yang produktif.</li>
                <li>Invoice dan kontrak servis sering telat ditagih.</li>
              </ul>
            </article>

            <div className="grid gap-4 md:grid-cols-2">
              {featureCards.map((card) => (
                <InteractiveInfoCard key={card} className="rounded-[24px] border border-[#d7eadc] bg-[#f8fcf8] p-5 shadow-[0_12px_30px_rgba(18,66,49,0.05)]">
                  <FeatureIcon />
                  <h3 className="mt-4 text-xl font-semibold text-[#10231b]">{card}</h3>
                  <p className="mt-3 text-sm leading-7 text-[#56665e]">
                    {card === "Dispatch dan kalender kerja" &&
                      "Job dibuat, di-assign, dipantau, lalu dibaca juga dari kalender dan daftar deadline."}
                    {card === "Invoice dan billing lebih rapi" &&
                      "Invoice manual dan auto-generate dari job selesai, tanpa tulis ulang."}
                    {card === "CRM pelanggan yang hidup" &&
                      "Alamat, unit AC, job history, dan kontrak aktif tersimpan rapi."}
                    {card === "Inventori, kontrak, dan WAHA" &&
                      "Owner tahu item hampir habis, kontrak mana yang mendekat, dan nomor bisnis bisa disiapkan ke WAHA."}
                  </p>
                </InteractiveInfoCard>
              ))}
            </div>
          </div>
        </section>
      </section>

      <section className="mx-auto grid w-full max-w-7xl gap-6 px-6 py-6 lg:grid-cols-[0.88fr_1.12fr]">
        <section id="workflow" className="landing-anchor-section scroll-mt-28 rounded-[32px] border border-[#c8ead5] bg-[linear-gradient(160deg,#113c2e,#19503d_55%,#1d5b45)] p-7 shadow-[0_24px_80px_rgba(10,52,39,0.22)]">
          <span className="text-[11px] uppercase tracking-[0.18em] text-[#bfe9d7]">Alur inti</span>
          <h2 className="mt-4 font-['Space_Grotesk'] text-3xl font-semibold tracking-[-0.05em] text-white">
            Dari job masuk sampai invoice lunas, owner tetap pegang kontrol.
          </h2>
          <div className="mt-7 space-y-4">
            {[
              "Buat job dan assign teknisi dalam hitungan detik.",
              "Pantau status pending, on the way, in progress, done, atau cancelled.",
              "Baca jadwal dari kalender, cek deadline, lalu lanjutkan ke invoice atau follow up pembayaran.",
            ].map((text, index) => (
              <div key={text} className="group relative overflow-hidden rounded-[24px] border border-white/8 bg-black/20 p-5 shadow-[0_12px_30px_rgba(5,24,19,0.14)] transition-transform duration-300 ease-out hover:-translate-y-1">
                <GlowingEffect
                  spread={32}
                  proximity={100}
                  inactiveZone={0.35}
                  variant="white"
                  glow
                  disabled={false}
                  borderWidth={2}
                  movementDuration={0.9}
                  className="rounded-[24px]"
                />
                <div className="relative flex items-start gap-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-black">
                  {index + 1}
                </span>
                <p className="text-sm leading-7 text-white/62">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="harga" className="landing-anchor-section scroll-mt-28 rounded-[32px] border border-[#d4e8da] bg-white/88 p-7 shadow-[0_24px_80px_rgba(18,66,49,0.08)]">
          <div className="mb-6">
            <span className="text-[11px] uppercase tracking-[0.18em] text-[#2d7b5f]">Harga sederhana</span>
            <h2 className="mt-4 font-['Space_Grotesk'] text-3xl font-semibold tracking-[-0.05em] text-[#10231b]">
              Mulai gratis, upgrade saat bisnis makin sibuk.
            </h2>
            <p className="mt-4 text-sm leading-7 text-[#56665e]">
              Dirancang untuk bengkel kecil sampai tim multi-cabang dengan harga yang tidak menakutkan.
            </p>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <article className="relative overflow-hidden rounded-[28px] border border-[#d7eadc] bg-[#f7fbf8] p-5 shadow-[0_18px_60px_rgba(18,66,49,0.08)]">
              <GlowingEffect
                spread={28}
                blur={0}
                inactiveZone={0.4}
                proximity={80}
                glow
                disabled={false}
                className="rounded-[28px]"
              />
              <div className="relative">
              <h3 className="text-xl font-semibold text-[#10231b]">Starter</h3>
              <div className="mt-3 flex items-start gap-1">
                <span className="mt-1 text-sm font-semibold text-[#2d7b5f]">Rp</span>
                <strong className="font-['Space_Grotesk'] text-4xl tracking-tight text-[#10231b]">0</strong>
              </div>
              <p className="mt-2 text-sm text-[#56665e]">Solo teknisi yang baru mulai rapi.</p>
              <ul className="mt-4 space-y-3 text-sm text-[#56665e]">
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="shrink-0 text-[#8fceab]" /> Job dasar</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="shrink-0 text-[#8fceab]" /> Pelanggan</li>
                <li className="flex items-center gap-2"><CheckCircle2 size={16} className="shrink-0 text-[#8fceab]" /> Invoice manual</li>
              </ul>
              <button
                type="button"
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-[#cfe4d5] bg-white px-4 text-sm font-semibold text-[#0d523f]"
                onClick={() => navigate(buildPlanRegisterLink("Starter"))}
              >
                Pilih Starter
              </button>
              </div>
            </article>
            <article className="relative overflow-hidden rounded-[28px] border border-[#7ccfad] bg-[linear-gradient(180deg,#1f7b59,#0d5a44_70%,#0a4837)] p-5 shadow-[0_24px_80px_rgba(22,157,115,0.28)]">
              <GlowingEffect
                spread={40}
                blur={0}
                inactiveZone={0.25}
                proximity={120}
                glow
                disabled={false}
                className="rounded-[28px]"
              />
              <div className="relative">
              <div className="inline-flex rounded-full bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#0b5f4e]">
                Primary
              </div>
              <h3 className="mt-4 text-xl font-semibold text-white">Pro</h3>
              <div className="mt-3 flex items-start gap-1">
                <span className="mt-1 text-sm font-medium text-[#bfe9d7]">Rp</span>
                <strong className="font-['Space_Grotesk'] text-4xl tracking-tighter text-white">249<span className="text-2xl text-white/70">.000</span></strong>
                <span className="mb-[4px] self-end text-xs text-white/60">/bln</span>
              </div>
              <p className="mt-2 text-sm text-white/80">Untuk bengkel AC 4 teknisi seperti persona utama.</p>
              <ul className="mt-4 space-y-3 text-sm text-white/90">
                <li className="flex items-start gap-2 font-medium text-[#bfe9d7]"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#61d0a8]" /> Semua fitur Starter, plus:</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#61d0a8] opacity-70" /> Dashboard penuh</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#61d0a8] opacity-70" /> Job board</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#61d0a8] opacity-70" /> CRM, stok, kontrak</li>
              </ul>
              <ShimmerButton
                type="button"
                onClick={() => navigate(buildPlanRegisterLink("Pro"))}
                shimmerColor="#dff7ee"
                background="rgba(255,255,255,0.14)"
                className="mt-6 min-h-11 w-full rounded-2xl px-4 text-sm font-semibold text-white"
              >
                Pilih Plan Pro
              </ShimmerButton>
              </div>
            </article>
            <article className="relative overflow-hidden rounded-[28px] border border-[#d7eadc] bg-[#f7fbf8] p-5 shadow-[0_18px_60px_rgba(18,66,49,0.08)]">
              <GlowingEffect
                spread={28}
                blur={0}
                inactiveZone={0.4}
                proximity={80}
                glow
                disabled={false}
                className="rounded-[28px]"
              />
              <div className="relative">
              <h3 className="text-xl font-semibold text-[#10231b]">Bisnis</h3>
              <div className="mt-3 flex items-start gap-1">
                <span className="mt-1 text-sm font-medium text-[#2d7b5f]">Rp</span>
                <strong className="font-['Space_Grotesk'] text-4xl tracking-tighter text-[#10231b]">499<span className="text-2xl text-[#10231b]/60">.000</span></strong>
                <span className="mb-[4px] self-end text-xs text-[#10231b]/50">/bln</span>
              </div>
              <p className="mt-2 text-sm text-[#56665e]">Untuk multi-cabang yang butuh visibilitas lebih luas.</p>
              <ul className="mt-4 space-y-3 text-sm text-[#10231b]/80">
                <li className="flex items-start gap-2 font-medium text-[#2d7b5f]"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#2d7b5f]" /> Semua fitur Pro, plus:</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#8fceab]" /> Multi tim</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#8fceab]" /> Laporan konsolidasi</li>
                <li className="flex items-start gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-[#8fceab]" /> Visibility lintas kota</li>
              </ul>
              <button
                type="button"
                className="mt-6 inline-flex min-h-11 w-full items-center justify-center rounded-2xl border border-[#cfe4d5] bg-white px-4 text-sm font-semibold text-[#0d523f]"
                onClick={() => navigate(buildPlanRegisterLink("Bisnis"))}
              >
                Pilih Plan Bisnis
              </button>
              </div>
            </article>
          </div>
        </section>
      </section>

      <section className="mx-auto w-full max-w-7xl px-6 py-6">
        <div className="rounded-[32px] border border-[#8fceab] bg-[linear-gradient(135deg,#1a684b,#238b66_58%,#63c997)] p-8 shadow-[0_30px_100px_rgba(12,96,78,0.24)]">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <span className="text-[11px] uppercase tracking-[0.18em] text-white/70">Siap pindah</span>
              <h2 className="mt-4 font-['Space_Grotesk'] text-3xl font-semibold tracking-[-0.05em] text-white md:text-4xl">
                Kalau bisnis jasa teknikmu sudah capek hidup di chat, waktunya pindah ke sistem.
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/82">
                Mulai dari job pertama, tambah teknisi, dan lihat operasional lebih tenang minggu ini juga.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <ShimmerButton
                type="button"
                onClick={() => navigate("/register")}
                shimmerColor="#dff7ee"
                background="linear-gradient(135deg,#0f5f46,#15805d)"
                className="min-h-12 rounded-2xl border border-[#d8f6e8]/30 px-6 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(8,57,42,0.28)]"
              >
                Coba Gratis Sekarang
              </ShimmerButton>
              <Link
                to="/demo-owner-dashboard"
                className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#d8f6e8]/24 bg-[#0d4c39]/26 px-6 text-sm font-semibold text-white transition hover:bg-[#0d4c39]/38"
              >
                Lihat demo owner dashboard
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
          <div className="mt-8 grid gap-3 md:grid-cols-3">
            {[
              "Setup bisnis kurang dari 10 menit",
              "UI lokal yang mudah dipahami owner",
              "Siap dikembangkan ke BetterAuth dan API backend",
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-2xl border border-[#d8f6e8]/18 bg-[#0d4c39]/24 px-4 py-4 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                <CheckCircle2 size={18} className="shrink-0 text-[#dff7ee]" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

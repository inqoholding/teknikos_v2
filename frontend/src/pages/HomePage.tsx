import {
  ArrowRight,
  Boxes,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  MessageSquareQuote,
  ReceiptText,
  ShieldCheck,
  Users,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { LandingHeroTemplate } from "../components/marketing/LandingHeroTemplate";
import { MarketingFooter } from "../components/Layout";

type FeatureCard = {
  icon: LucideIcon;
  title: string;
  body: string;
};

type PricingPlan = {
  name: string;
  price: string;
  summary: string;
  highlight?: string;
  featured?: boolean;
  items: string[];
};

const outcomes = [
  {
    label: "Jadwal lebih jelas",
    title: "Owner cepat tahu job yang padat, telat, dan masih menggantung.",
    body: "Semua pekerjaan dibaca dari board dan kalender, jadi tim tidak lagi bergantung pada chat yang tercecer.",
  },
  {
    label: "Billing lebih cepat",
    title: "Invoice tidak lagi menunggu mood admin atau catatan lapangan.",
    body: "Job, sparepart, nilai tagihan, dan status pembayaran tersambung dalam satu alur yang lebih rapi.",
  },
  {
    label: "Client lebih tenang",
    title: "Update kerja terasa profesional, bukan improvisasi setiap kali ada pertanyaan.",
    body: "Riwayat pelanggan, unit, dan progres teknisi tersimpan supaya follow-up tidak mengulang dari nol.",
  },
];

const painPoints = [
  "Jadwal kerja tercecer di WhatsApp group dan catatan admin.",
  "Owner telat tahu job mana yang urgent, tertunda, atau belum ditagih.",
  "Client harus bertanya dulu baru dapat update progres dan invoice.",
];

const featureCards: FeatureCard[] = [
  {
    icon: ClipboardList,
    title: "Dispatch yang langsung terbaca",
    body: "Buat job, assign teknisi, lihat status kerja, lalu cek deadline tanpa pindah-pindah alat.",
  },
  {
    icon: CalendarClock,
    title: "Kalender operasional harian",
    body: "Jadwal visit dan tenggat job tampil berdampingan supaya bentrok cepat kelihatan.",
  },
  {
    icon: ReceiptText,
    title: "Billing yang ikut alur kerja",
    body: "Invoice manual atau dari job selesai bisa dipantau per status agar penagihan tidak tertunda.",
  },
  {
    icon: Users,
    title: "CRM yang punya konteks",
    body: "Pelanggan, histori servis, unit, kontrak, dan next action tersimpan dalam satu tempat.",
  },
  {
    icon: Boxes,
    title: "Stok dan sparepart lebih aman",
    body: "Item yang dipakai di lapangan tercatat supaya owner tahu stok menipis sebelum kehabisan.",
  },
  {
    icon: ShieldCheck,
    title: "Setup WhatsApp lebih jelas",
    body: "Rules dan koneksi WAHA dipisah supaya tim paham langkah setup tanpa nebak-nebak menu.",
  },
];

const workflowSteps = [
  {
    step: "01",
    title: "Job masuk dan langsung diassign",
    body: "Admin buat pekerjaan, pilih pelanggan, lalu assign teknisi dari satu alur yang singkat.",
  },
  {
    step: "02",
    title: "Owner pantau progres tanpa bongkar chat",
    body: "Status kerja, jadwal, deadline, dan catatan lapangan terlihat dari dashboard yang sama.",
  },
  {
    step: "03",
    title: "Invoice keluar saat pekerjaan selesai",
    body: "Penagihan mengikuti job yang selesai supaya cashflow tidak tertinggal di belakang operasional.",
  },
];

const roleCards = [
  {
    title: "Bengkel AC dan HVAC",
    body: "Cocok untuk tim yang menangani service rutin, komplain mendadak, dan kontrak maintenance.",
  },
  {
    title: "Plumbing dan electrical service",
    body: "Dipakai saat owner perlu kontrol dispatch cepat, teknisi lapangan, dan tagihan per pekerjaan.",
  },
  {
    title: "Kontraktor jasa multi-tim",
    body: "Lebih aman untuk bisnis yang mulai punya banyak job aktif dan butuh visibilitas lintas tim.",
  },
];

const testimonialCards = [
  {
    title: "Tim lebih cepat paham",
    body: "Bahasa dan alurnya dibuat sederhana agar owner dan admin langsung tahu apa yang harus ditindak hari ini.",
  },
  {
    title: "Client lebih cepat dapat kabar",
    body: "Status kerja, invoice, dan histori pelanggan tersusun lebih rapi sehingga follow-up tidak perlu improvisasi terus.",
  },
  {
    title: "Owner tetap pegang kontrol",
    body: "Saat job bertambah, owner tetap bisa membaca prioritas, teknisi aktif, dan pekerjaan yang belum ditagih dari satu dashboard.",
  },
];

const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    price: "Rp0",
    summary: "Untuk teknisi solo atau bisnis kecil yang mau mulai rapi dulu.",
    items: ["Job dasar", "Data pelanggan", "Invoice manual"],
  },
  {
    name: "Pro",
    price: "Rp249K",
    summary: "Plan utama untuk tim aktif yang butuh kontrol harian tanpa ribet.",
    highlight: "Paling cocok untuk operasional harian",
    featured: true,
    items: ["Dashboard owner", "Dispatch + kalender", "CRM, stok, kontrak"],
  },
  {
    name: "Bisnis",
    price: "Rp499K",
    summary: "Untuk tim yang lebih besar dan perlu visibilitas lebih luas.",
    items: ["Kontrol multi tim", "Monitoring lebih luas", "Skala operasional lebih aman"],
  },
];

const faqItems = [
  {
    question: "Apakah TeknikOS cocok untuk tim kecil dulu?",
    answer: "Cocok. Mulai dari Starter untuk membereskan job dan pelanggan dulu, lalu upgrade saat operasional makin padat.",
  },
  {
    question: "Apakah invoice harus dibuat manual semua?",
    answer: "Tidak. Invoice bisa dibuat manual atau mengikuti alur job yang sudah selesai agar proses tagih lebih cepat.",
  },
  {
    question: "Kalau masih pakai WhatsApp, apa tetap relevan?",
    answer: "Ya. TeknikOS justru membantu tim yang masih mengandalkan WhatsApp agar informasi operasionalnya tidak tercecer.",
  },
  {
    question: "Berapa cepat tim bisa mulai pakai?",
    answer: "Untuk use case awal, tim bisa mulai dari setup bisnis, input pelanggan, lalu membuat job pertama dalam waktu singkat.",
  },
];

function buildPlanRegisterLink(plan: string) {
  return `/register?plan=${encodeURIComponent(plan)}`;
}

const SALES_WHATSAPP_LINK =
  "https://wa.me/6281354444967?text=Halo%20sales%20TeknikOS,%20saya%20ingin%20tanya%20demo%20dan%20langganan.";

export default function HomePage() {
  return (
    <div className="landing-page">
      <LandingHeroTemplate salesWhatsappLink={SALES_WHATSAPP_LINK} />

      <section className="grid gap-4 lg:grid-cols-3">
        {outcomes.map((item) => (
          <article
            key={item.title}
            className="rounded-[28px] border border-[rgba(12,30,25,0.1)] bg-white/88 p-6 shadow-[0_18px_50px_rgba(14,52,43,0.08)] backdrop-blur-sm"
          >
            <span className="eyebrow">{item.label}</span>
            <h2 className="mt-3 font-['Space_Grotesk'] text-[1.45rem] leading-[1.08] tracking-[-0.04em] text-[#171a17]">
              {item.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#5b605c]">{item.body}</p>
          </article>
        ))}
      </section>

      <section
        id="fitur"
        className="grid gap-5 rounded-[32px] border border-[rgba(12,30,25,0.1)] bg-[linear-gradient(135deg,#09231d,#10352d_52%,#165444)] p-6 text-white shadow-[0_32px_90px_rgba(11,49,39,0.16)] lg:grid-cols-[0.9fr_1.1fr] lg:p-8"
      >
        <div>
          <span className="inline-flex min-h-8 items-center rounded-full border border-white/12 bg-white/8 px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#c9efdf]">
            Masalah yang paling sering bikin chaos
          </span>
          <h2 className="mt-4 max-w-xl font-['Space_Grotesk'] text-3xl leading-[1.02] tracking-[-0.05em] md:text-5xl">
            Bukan kekurangan kerjaan. Yang bikin berat biasanya informasi operasionalnya pecah ke banyak tempat.
          </h2>
          <p className="mt-4 max-w-lg text-sm leading-7 text-white/72 md:text-base">
            TeknikOS merapikan alur kerja harian supaya owner, admin, dan teknisi membaca konteks yang sama
            tanpa mengejar info dari chat, catatan manual, dan spreadsheet terpisah.
          </p>
        </div>
        <div className="grid gap-3">
          {painPoints.map((item) => (
            <div key={item} className="rounded-3xl border border-white/10 bg-white/8 px-5 py-4 text-sm leading-7 text-white/88">
              {item}
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-[32px] border border-[rgba(12,30,25,0.1)] bg-white/84 p-6 shadow-[0_18px_50px_rgba(14,52,43,0.08)] md:p-8">
        <div className="max-w-3xl">
          <span className="eyebrow">Fitur Inti</span>
          <h2 className="mt-3 font-['Space_Grotesk'] text-3xl leading-[1.02] tracking-[-0.05em] text-[#171a17] md:text-5xl">
            Modul inti yang paling sering dipakai owner untuk menjalankan operasional harian.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#5b605c] md:text-base">
            Fokusnya bukan menambah menu. Fokusnya membuat job lebih cepat dijalankan, billing lebih cepat
            keluar, dan komunikasi client lebih konsisten.
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {featureCards.map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="rounded-[26px] border border-[rgba(12,30,25,0.08)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,249,246,0.88))] p-6 transition-transform duration-200 hover:-translate-y-1"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dff7ee] text-[#0b5f4e]">
                  <Icon size={22} />
                </div>
                <h3 className="mt-4 font-['Space_Grotesk'] text-xl leading-tight tracking-[-0.03em] text-[#171a17]">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-[#5b605c]">{item.body}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-[0.86fr_1.14fr]">
        <article className="rounded-[30px] border border-[rgba(12,30,25,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(249,252,250,0.86))] p-6 shadow-[0_18px_50px_rgba(14,52,43,0.08)] md:p-8">
          <span className="eyebrow">Workflow</span>
          <h2 className="mt-3 font-['Space_Grotesk'] text-3xl leading-[1.02] tracking-[-0.05em] text-[#171a17] md:text-5xl">
            Dari job masuk sampai invoice lunas, alurnya tetap pendek.
          </h2>
          <p className="mt-4 text-sm leading-7 text-[#5b605c] md:text-base">
            Ini bagian yang penting untuk calon client: mereka tidak perlu mempelajari semua modul dulu.
            Cukup lihat alur kerja utamanya dan pahami bahwa sistem ini dibuat untuk operasional harian.
          </p>
        </article>

        <div className="grid gap-4">
          {workflowSteps.map((item) => (
            <article
              key={item.step}
              className="rounded-[28px] border border-[rgba(12,30,25,0.08)] bg-white/88 p-6 shadow-[0_18px_50px_rgba(14,52,43,0.08)]"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#dff7ee] font-['Space_Grotesk'] text-lg font-bold text-[#0b5f4e]">
                  {item.step}
                </div>
                <div>
                  <h3 className="font-['Space_Grotesk'] text-xl leading-tight tracking-[-0.03em] text-[#171a17]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-[#5b605c]">{item.body}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {roleCards.map((item) => (
          <article
            key={item.title}
            className="rounded-[28px] border border-[rgba(12,30,25,0.1)] bg-[linear-gradient(180deg,rgba(255,249,236,0.95),rgba(255,255,255,0.92))] p-6 shadow-[0_18px_50px_rgba(14,52,43,0.08)]"
          >
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff0d8] text-[#8a5a10]">
              <Wrench size={20} />
            </div>
            <h2 className="mt-4 font-['Space_Grotesk'] text-[1.35rem] leading-tight tracking-[-0.03em] text-[#171a17]">
              {item.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#5b605c]">{item.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[32px] border border-[rgba(12,30,25,0.1)] bg-white/86 p-6 shadow-[0_18px_50px_rgba(14,52,43,0.08)] md:p-8">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <span className="eyebrow">Kenapa Tim Service Cepat Cocok</span>
            <h2 className="mt-3 font-['Space_Grotesk'] text-3xl leading-[1.02] tracking-[-0.05em] text-[#171a17] md:text-5xl">
              Dibuat untuk bisnis jasa teknik yang butuh kontrol cepat, bukan sistem yang terasa berat dipelajari.
            </h2>
          </div>
          <Link
            to="/demo-owner-dashboard"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl bg-[#0b5f4e] px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5"
          >
            Lihat Demo Dashboard
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          {testimonialCards.map((item) => (
            <article
              key={item.title}
              className="rounded-[26px] border border-[rgba(12,30,25,0.08)] bg-[linear-gradient(180deg,rgba(239,247,243,0.96),rgba(255,255,255,0.92))] p-6"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#dff7ee] text-[#0b5f4e]">
                <MessageSquareQuote size={20} />
              </div>
              <h3 className="mt-4 font-['Space_Grotesk'] text-xl leading-tight tracking-[-0.03em] text-[#171a17]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[#5b605c]">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section
        id="harga"
        className="rounded-[32px] border border-[rgba(12,30,25,0.1)] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(250,252,249,0.84))] p-6 shadow-[0_18px_50px_rgba(14,52,43,0.08)] md:p-8"
      >
        <div className="grid gap-5 lg:grid-cols-[1.5fr_0.9fr] lg:items-end">
          <div className="max-w-3xl">
            <span className="eyebrow">Harga</span>
            <h2 className="mt-3 font-['Space_Grotesk'] text-3xl leading-[1.02] tracking-[-0.05em] text-[#171a17] md:text-5xl">
              Mulai gratis. Upgrade saat operasional memang sudah butuh kontrol lebih besar.
            </h2>
          </div>
          <p className="text-sm leading-7 text-[#5b605c] md:text-base">
            Naming dan copy plan dibuat lebih outcome-driven: mulai rapi, kontrol harian, lalu skala lebih luas.
          </p>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-3">
          {pricingPlans.map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col gap-4 rounded-[28px] border p-6 ${
                plan.featured
                  ? "border-[#0b5f4e] bg-[#0b5f4e] text-white shadow-[0_32px_90px_rgba(11,49,39,0.16)]"
                  : "border-[rgba(12,30,25,0.08)] bg-white/92 text-[#171a17]"
              }`}
            >
              {plan.highlight ? (
                <span className={`inline-flex w-fit rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${
                  plan.featured ? "bg-white/12 text-white/88" : "bg-[#dff7ee] text-[#0b5f4e]"
                }`}>
                  {plan.highlight}
                </span>
              ) : null}

              <div>
                <h3 className="font-['Space_Grotesk'] text-2xl tracking-[-0.03em]">{plan.name}</h3>
                <strong className="mt-2 block font-['Space_Grotesk'] text-5xl leading-none tracking-[-0.06em]">
                  {plan.price}
                </strong>
              </div>

              <p className={`text-sm leading-7 ${plan.featured ? "text-white/78" : "text-[#5b605c]"}`}>{plan.summary}</p>

              <div className="grid gap-3">
                {plan.items.map((item) => (
                  <div
                    key={item}
                    className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm ${
                      plan.featured
                        ? "border-white/10 bg-white/8 text-white/88"
                        : "border-[rgba(12,30,25,0.08)] bg-[rgba(247,251,248,0.88)] text-[#171a17]"
                    }`}
                  >
                    <CheckCircle2 size={16} className={plan.featured ? "text-[#c9efdf]" : "text-[#0b5f4e]"} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <Link
                className={`mt-2 inline-flex min-h-12 items-center justify-center rounded-2xl px-5 text-sm font-semibold transition hover:-translate-y-0.5 ${
                  plan.featured
                    ? "bg-white text-[#0b5f4e]"
                    : "border border-[rgba(12,30,25,0.12)] bg-white text-[#171a17]"
                }`}
                to={buildPlanRegisterLink(plan.name)}
              >
                Pilih {plan.name}
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        {faqItems.map((item) => (
          <article
            key={item.question}
            className="rounded-[28px] border border-[rgba(12,30,25,0.1)] bg-white/88 p-6 shadow-[0_18px_50px_rgba(14,52,43,0.08)]"
          >
            <h2 className="font-['Space_Grotesk'] text-[1.3rem] leading-tight tracking-[-0.03em] text-[#171a17]">
              {item.question}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[#5b605c]">{item.answer}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[32px] border border-[#8bcfae] bg-[linear-gradient(135deg,#176347,#23906a_58%,#6fd0a2)] p-6 text-white shadow-[0_32px_90px_rgba(11,49,39,0.18)] md:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <span className="text-[11px] uppercase tracking-[0.18em] text-white/70">Siap pindah</span>
            <h2 className="mt-4 font-['Space_Grotesk'] text-3xl font-semibold tracking-[-0.05em] text-white md:text-4xl">
              Kalau bisnis jasa teknik Anda sudah capek hidup di chat, waktunya pindah ke sistem.
            </h2>
            <p className="mt-4 text-sm leading-7 text-white/82">
              Mulai dari job pertama, tambah teknisi, dan lihat operasional lebih tenang minggu ini juga.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link
              to="/register"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#d8f6e8]/30 bg-[linear-gradient(135deg,#0f5f46,#15805d)] px-6 text-sm font-semibold text-white shadow-[0_18px_40px_rgba(8,57,42,0.28)] transition hover:-translate-y-0.5 hover:border-[#e6fff3]/40 hover:bg-[linear-gradient(135deg,#127353,#189468)]"
            >
              Coba Gratis Sekarang
            </Link>
            <Link
              to="/demo-owner-dashboard"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border border-[#d8f6e8]/24 bg-[#0d4c39]/34 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0d4c39]/46"
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
              className="flex items-center gap-3 rounded-2xl border border-[#d8f6e8]/18 bg-[#0d4c39]/26 px-4 py-4 text-sm text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
            >
              <CheckCircle2 size={18} className="shrink-0 text-[#dff7ee]" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <MarketingFooter />
    </div>
  );
}

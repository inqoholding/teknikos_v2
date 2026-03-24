import { ArrowRight, Menu, X } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const proofItems = [
  "Dispatch room",
  "Kalender kerja",
  "CRM pelanggan",
  "Invoice & billing",
  "Setup WAHA",
];

export function LandingHeroTemplate({ salesWhatsappLink }: { salesWhatsappLink: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <section className="relative overflow-hidden bg-[#081b17] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(81,196,152,0.22),_transparent_0_34%),radial-gradient(circle_at_top_right,_rgba(255,210,122,0.18),_transparent_0_24%),linear-gradient(180deg,_rgba(6,20,18,0.18),_rgba(6,20,18,0.62))]" />
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/10" />

      <header className="relative z-20 border-b border-white/10 bg-black/10 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b5f4e] via-[#169d73] to-[#61d0a8] text-lg font-extrabold text-white shadow-[0_18px_40px_rgba(22,157,115,0.28)]">
              T
            </div>
            <div>
              <strong className="block font-['Space_Grotesk'] text-xl font-bold tracking-[-0.04em]">TeknikOS</strong>
              <span className="block text-[11px] uppercase tracking-[0.18em] text-white/55">SaaS field service Indonesia</span>
            </div>
          </div>

          <div className="hidden items-center gap-8 text-sm text-white/65 md:flex">
            <a href="#fitur" className="transition-colors hover:text-white">Fitur</a>
            <a href="#harga" className="transition-colors hover:text-white">Harga</a>
            <Link to="/register" className="transition-colors hover:text-white">Daftar</Link>
            <Link to="/login" className="transition-colors hover:text-white">Login</Link>
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <a
              href={salesWhatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-white/14 bg-white/8 px-4 text-sm font-semibold text-white/88 transition hover:-translate-y-0.5 hover:bg-white/14"
            >
              Tanya Sales
            </a>
            <Link
              to="/demo-owner-dashboard"
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#d8f6e8]/28 bg-[linear-gradient(135deg,#0f5f46,#15805d)] px-4 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(10,62,46,0.24)] transition hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#127353,#189468)]"
            >
              Coba Gratis
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/14 bg-white/8 md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen((current) => !current)}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>

        {mobileMenuOpen ? (
          <div className="border-t border-white/10 bg-[#091f1a]/95 px-6 py-4 md:hidden">
            <div className="flex flex-col gap-3 text-sm text-white/78">
              <a href="#fitur" onClick={() => setMobileMenuOpen(false)}>Fitur</a>
              <a href="#harga" onClick={() => setMobileMenuOpen(false)}>Harga</a>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)}>Daftar</Link>
              <Link to="/login" onClick={() => setMobileMenuOpen(false)}>Login</Link>
              <Link
                to="/demo-owner-dashboard"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#d8f6e8]/28 bg-[linear-gradient(135deg,#0f5f46,#15805d)] px-4 font-semibold text-white"
                onClick={() => setMobileMenuOpen(false)}
              >
                Coba Gratis
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <div className="relative z-10 mx-auto flex max-w-7xl flex-col gap-12 px-6 pb-20 pt-12 md:pb-24 md:pt-18 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-16">
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/8 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#bfe9d7]">
            Untuk bengkel AC, plumber, listrik
            <span className="inline-flex items-center gap-1 text-white/60">
              Dashboard live
              <ArrowRight size={12} />
            </span>
          </div>

          <h1 className="max-w-3xl font-['Space_Grotesk'] text-4xl font-semibold leading-[1.02] tracking-[-0.06em] text-white md:text-6xl">
            Satu dashboard untuk menjalankan bisnis jasa teknik tanpa chaos operasional.
          </h1>

          <p className="mt-6 max-w-2xl text-base leading-7 text-white/70 md:text-lg">
            TeknikOS membantu owner membaca job, jadwal, pelanggan, invoice, dan stok dari satu alur yang
            lebih mudah dipahami tim Indonesia.
          </p>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-[#d8e4de]">
            Cocok untuk bengkel dan tim service yang ingin merapikan dispatch, follow-up client, dan
            billing tanpa memaksa tim belajar sistem yang terasa berat.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link
              to="/demo-owner-dashboard"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#d8f6e8]/28 bg-[linear-gradient(135deg,#0f5f46,#15805d)] px-6 text-sm font-semibold text-white shadow-[0_20px_42px_rgba(10,62,46,0.26)] transition hover:-translate-y-0.5 hover:bg-[linear-gradient(135deg,#127353,#189468)]"
            >
              Coba Gratis
            </Link>
            <Link
              to="/register"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#d8f6e8]/22 bg-[#0d4c39]/34 px-6 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-[#0d4c39]/46"
            >
              Buat Akun Gratis
            </Link>
            <a
              href={salesWhatsappLink}
              target="_blank"
              rel="noreferrer"
              className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#ffcc7a]/18 bg-[#ffcc7a]/10 px-6 text-sm font-semibold text-[#ffe4b3] transition hover:-translate-y-0.5"
            >
              Tanya via WhatsApp
            </a>
          </div>

          <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
              <span className="block text-[11px] uppercase tracking-[0.16em] text-white/45">Fokus</span>
              <strong className="mt-2 block text-2xl font-semibold">1 alur</strong>
              <small className="mt-1 block text-white/60">job sampai invoice</small>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
              <span className="block text-[11px] uppercase tracking-[0.16em] text-white/45">Target</span>
              <strong className="mt-2 block text-2xl font-semibold">Owner</strong>
              <small className="mt-1 block text-white/60">tim service aktif</small>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/8 p-4 backdrop-blur-sm">
              <span className="block text-[11px] uppercase tracking-[0.16em] text-white/45">Hasil</span>
              <strong className="mt-2 block text-2xl font-semibold">Lebih rapi</strong>
              <small className="mt-1 block text-white/60">lebih cepat ditindak</small>
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-x-8 top-[-32px] h-40 rounded-full bg-[#3dd2a0]/22 blur-3xl" />
          <div className="relative overflow-hidden rounded-[28px] border border-white/12 bg-[linear-gradient(180deg,rgba(255,255,255,0.12),rgba(255,255,255,0.04))] p-4 shadow-[0_36px_110px_rgba(0,0,0,0.35)] backdrop-blur-xl md:p-5">
            <div className="rounded-[24px] border border-white/10 bg-[#0b231f]/95 p-5">
              <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-4">
                <div>
                  <strong className="block text-lg">Owner Dashboard</strong>
                  <span className="text-sm text-white/50">Hari ini · 14 job · 4 teknisi aktif</span>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#dff7ee] font-bold text-[#0b5f4e]">
                  BS
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <span className="text-xs uppercase tracking-[0.16em] text-white/45">Revenue</span>
                  <strong className="mt-2 block text-2xl">Rp18,5jt</strong>
                  <small className="text-white/55">Naik 18% MoM</small>
                </div>
                <div className="rounded-2xl border border-white/8 bg-white/5 p-4">
                  <span className="text-xs uppercase tracking-[0.16em] text-white/45">Job aktif</span>
                  <strong className="mt-2 block text-2xl">6</strong>
                  <small className="text-white/55">2 urgent</small>
                </div>
              </div>

              <div className="mt-4 rounded-3xl border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] p-4">
                <div className="mb-3 flex items-center justify-between">
                  <div>
                    <strong className="block">Command Center</strong>
                    <span className="text-sm text-white/45">Dispatch, kalender, billing, CRM</span>
                  </div>
                  <span className="rounded-full bg-[#fff0d8] px-3 py-1 text-xs font-semibold text-[#6a4710]">Live</span>
                </div>
                <div className="grid gap-3">
                  {[
                    "Job masuk dan teknisi aktif langsung terbaca",
                    "Jadwal dan deadline terlihat dari satu pandangan",
                    "Pelanggan, histori unit, dan invoice tetap nyambung",
                    "WAHA, stok, dan kontrak tidak lagi tersebar di menu yang membingungkan",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-white/7 bg-black/15 px-4 py-3">
                      <span className="h-2.5 w-2.5 rounded-full bg-[#61d0a8]" />
                      <strong className="text-sm font-medium text-white/88">{item}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 border-t border-white/10 bg-black/12">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-8 gap-y-3 px-6 py-5 text-sm font-semibold text-white/72">
          <span className="text-white/45">Dirancang untuk operasi teknik sehari-hari</span>
          {proofItems.map((item) => (
            <span key={item}>{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

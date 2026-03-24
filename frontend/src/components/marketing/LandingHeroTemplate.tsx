import { ArrowRight, CircleDollarSign, LayoutGrid, Menu, Route, X } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { revenueBars, statusBreakdown } from "../../data/mock";
import { formatRupiah } from "../../utils/currency";
import { ShimmerButton } from "../ui/shimmer-button";
import { NavBar } from "../ui/tubelight-navbar";

const navLinks = [
  { href: "#fitur", label: "Fitur", icon: LayoutGrid },
  { href: "#harga", label: "Harga", icon: CircleDollarSign },
  { href: "#workflow", label: "Alur", icon: Route },
];

const billingPreview = [
  { label: "Job terkait", value: "JOB-014 · Cuci besar 4 unit" },
  { label: "Pelanggan", value: "PT Sinar Jaya" },
  { label: "Nilai invoice", value: formatRupiah(450_000) },
  { label: "Status", value: "Siap kirim" },
];

const showcaseItems = [
  { label: "Omzet", value: formatRupiah(18_500_000), note: "Naik 18% MoM" },
  { label: "Job aktif", value: "6", note: "2 urgent" },
  { label: "Teknisi aktif", value: "4", note: "siap assign" },
];

const revenueTrend = revenueBars.map((item) => ({
  day: item.label,
  value: item.value,
  amount: formatRupiah(item.value),
}));

const maxRevenueValue = Math.max(...revenueTrend.map((item) => item.value));
const totalRevenueValue = revenueTrend.reduce((sum, item) => sum + item.value, 0);
const averageRevenueValue = Math.round(totalRevenueValue / revenueTrend.length);
const peakRevenueDay = revenueTrend.reduce((peak, item) => (item.value > peak.value ? item : peak), revenueTrend[0]);

export function LandingHeroTemplate({ salesWhatsappLink }: { salesWhatsappLink: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedRevenueDay, setSelectedRevenueDay] = useState(revenueTrend[3]);
  const navigate = useNavigate();
  const billingStatusCopy =
    selectedRevenueDay.value >= 700_000 ? "Siap tagih prioritas" : selectedRevenueDay.value >= 500_000 ? "Siap kirim" : "Perlu follow up";

  return (
    <section className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,#e7f7eb_0%,#f7f6ef_42%,#edf7f1_100%)] text-[#10231b]">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_16%,rgba(39,152,109,0.18),transparent_0_24%),radial-gradient(circle_at_84%_10%,rgba(122,215,167,0.22),transparent_0_20%),radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.78),transparent_0_34%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-60 [background-image:linear-gradient(rgba(16,35,27,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(16,35,27,0.04)_1px,transparent_1px)] [background-size:42px_42px] [mask-image:radial-gradient(circle_at_center,black_45%,transparent_85%)]" />

      <header className="fixed inset-x-0 top-0 z-50 border-b border-[#cfe4d5] bg-[rgba(247,246,239,0.84)] backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b5f4e] via-[#169d73] to-[#61d0a8] text-base font-extrabold text-white">
              T
            </div>
            <div>
              <strong className="block font-['Space_Grotesk'] text-lg font-semibold tracking-[-0.04em] text-[#10231b]">TeknikOS</strong>
              <span className="block text-[11px] uppercase tracking-[0.16em] text-[#5d6d65]">SaaS jasa teknik Indonesia</span>
            </div>
          </div>

          <div className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 md:block">
            <NavBar
              items={navLinks.map((item) => ({
                name: item.label,
                url: item.href,
                icon: item.icon,
              }))}
            />
          </div>

          <div className="hidden items-center gap-3 md:flex">
            <Link to="/login" className="inline-flex min-h-10 items-center justify-center rounded-xl px-4 text-sm font-medium text-[#53635b] transition hover:bg-[#edf7ef] hover:text-[#10231b]">
              Login
            </Link>
            <Link
              to="/register"
              className="inline-flex min-h-10 items-center justify-center rounded-xl border border-[#6fc79b] bg-[linear-gradient(135deg,#1d6d50,#28996f_58%,#4dc58f)] px-5 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(24,106,76,0.22)] transition hover:scale-[1.03] hover:border-[#89d7b0]"
            >
              Daftar
            </Link>
          </div>

          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-[#cfe4d5] bg-white/70 md:hidden"
            aria-label="Toggle menu"
            onClick={() => setMobileMenuOpen((current) => !current)}
          >
            {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </nav>

        {mobileMenuOpen ? (
          <div className="border-t border-[#d4e8da] bg-[rgba(247,246,239,0.96)] px-6 py-4 md:hidden">
            <div className="flex flex-col gap-4">
              {navLinks.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="text-sm text-[#5d6d65]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Link to="/login" className="text-sm text-[#5d6d65]" onClick={() => setMobileMenuOpen(false)}>
                Login
              </Link>
              <Link
                to="/register"
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#6fc79b] bg-[linear-gradient(135deg,#1d6d50,#28996f_58%,#4dc58f)] px-4 text-sm font-semibold text-white shadow-[0_16px_34px_rgba(24,106,76,0.18)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Daftar
              </Link>
            </div>
          </div>
        ) : null}
      </header>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-start px-6 pb-20 pt-28 md:pt-32">
        <aside className="mb-8 inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full border border-[#d4e8da] bg-white/78 px-4 py-2 shadow-[0_12px_30px_rgba(18,66,49,0.08)] backdrop-blur-sm">
          <span className="text-center text-xs whitespace-nowrap text-[#55655d]">
            Kalender, deadline job, dan setup WAHA sekarang sudah masuk landing.
          </span>
          <Link
            to="/demo-owner-dashboard"
            className="inline-flex items-center gap-1 whitespace-nowrap text-xs text-[#0d6a50] transition hover:text-[#10231b]"
          >
            Lihat demo
            <ArrowRight size={12} />
          </Link>
        </aside>

        <h1 className="max-w-5xl px-4 text-center font-['Space_Grotesk'] text-4xl font-medium leading-[1.02] tracking-[-0.06em] text-[#10231b] md:text-6xl lg:text-7xl">
          Operasional jasa teknik yang tadinya ribet, sekarang terasa seterang dashboard owner.
        </h1>

        <p className="mt-6 max-w-3xl px-4 text-center text-sm leading-7 text-[#57685f] md:text-base">
          Ganti koordinasi job via WhatsApp group, invoice tulis tangan, dan stok yang suka hilang
          dengan satu owner dashboard yang terasa lokal, ringan, dan langsung siap dipakai tim Indonesia.
        </p>

        <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
          <ShimmerButton
            type="button"
            onClick={() => navigate("/demo-owner-dashboard")}
            shimmerColor="#dff7ee"
            background="linear-gradient(135deg,#1f7b59,#30a678)"
            className="min-h-12 rounded-2xl border border-[#52bc89] px-7 text-sm font-semibold text-white shadow-[0_20px_60px_rgba(31,123,89,0.28)]"
          >
            Coba Gratis
          </ShimmerButton>
          <a
            href={salesWhatsappLink}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl border border-[#d4e8da] bg-white/82 px-7 text-sm font-medium text-[#28443a] transition hover:border-[#a9d3ba] hover:bg-white"
          >
            Tanya via WhatsApp
          </a>
        </div>

        <div className="mt-16 w-full max-w-6xl pb-10">
          <div className="pointer-events-none absolute left-1/2 top-[24rem] z-0 w-[82%] -translate-x-1/2">
            <div className="h-44 rounded-full bg-[radial-gradient(circle_at_center,rgba(48,166,120,0.22),rgba(48,166,120,0.05)_45%,transparent_72%)] blur-3xl" />
          </div>

          <div className="relative z-10 rounded-[34px] border border-[#d4e8da] bg-[linear-gradient(180deg,rgba(255,255,255,0.94),rgba(236,247,241,0.92))] p-3 shadow-[0_30px_100px_rgba(18,66,49,0.14)] md:p-4">
            <div className="overflow-hidden rounded-[30px] border border-[#dbece0] bg-[#fbfcf8]">
              <div className="flex items-center justify-between border-b border-[#e2efe5] px-5 py-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#10231b] text-sm font-bold text-white">T</div>
                  <div>
                    <strong className="block text-sm font-semibold text-[#10231b]">Owner Dashboard</strong>
                    <span className="block text-xs text-[#65756d]">Hari ini · 14 job · 4 teknisi aktif</span>
                  </div>
                </div>
                <div className="hidden items-center gap-2 md:flex">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#61d0a8]" />
                  <span className="text-xs text-[#65756d]">Live sync</span>
                </div>
              </div>

              <div className="grid gap-4 p-5 lg:grid-cols-[1.2fr_0.8fr]">
                <div className="space-y-4">
                  <div className="grid gap-3 md:grid-cols-3">
                    {showcaseItems.map((item) => (
                      <article key={item.label} className="rounded-2xl border border-[#dbece0] bg-white p-4 shadow-[0_12px_30px_rgba(18,66,49,0.05)]">
                        <span className="block text-[11px] uppercase tracking-[0.16em] text-[#5e6f66]">{item.label}</span>
                        <strong className="mt-2 block text-2xl font-semibold text-[#10231b]">{item.value}</strong>
                        <small className="text-[#6a796f]">{item.note}</small>
                      </article>
                    ))}
                  </div>

                  <article className="rounded-[24px] border border-[#dbece0] bg-white p-5 shadow-[0_12px_30px_rgba(18,66,49,0.05)]">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="text-[11px] uppercase tracking-[0.16em] text-[#5e6f66]">Pendapatan 7 hari</span>
                        <strong className="mt-2 block text-[2rem] font-semibold leading-none tracking-[-0.04em] text-[#10231b]">{formatRupiah(totalRevenueValue)}</strong>
                        <small className="mt-2 block text-[#6a796f]">Trend invoice lunas dan pekerjaan selesai minggu ini</small>
                      </div>
                      <div className="rounded-[18px] border border-[#cfe4d5] bg-[linear-gradient(180deg,#f6fcf8,#ebf7f0)] px-4 py-3 text-right">
                        <span className="block text-[10px] uppercase tracking-[0.14em] text-[#708178]">vs minggu lalu</span>
                        <strong className="mt-1 block text-base font-semibold text-[#16694f]">+12,4%</strong>
                      </div>
                    </div>

                    <div className="mt-5 rounded-[24px] border border-[#e0eee4] bg-[linear-gradient(180deg,#fbfdfb,#eef8f2)] p-4">
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <span className="block text-[10px] uppercase tracking-[0.14em] text-[#708178]">Hari dipilih</span>
                          <strong className="mt-1 block text-[1.35rem] leading-none text-[#173428]">{selectedRevenueDay.amount}</strong>
                          <span className="mt-1 block text-sm text-[#5b6f65]">{selectedRevenueDay.day} menjadi fokus penagihan hari ini</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <div className="rounded-full border border-[#d9ebe0] bg-white/88 px-3 py-1.5 text-[11px] font-medium text-[#557067]">
                            Peak: {peakRevenueDay.day} · {peakRevenueDay.amount}
                          </div>
                          <div className="rounded-full border border-[#d9ebe0] bg-white/88 px-3 py-1.5 text-[11px] font-medium text-[#557067]">
                            Total: {formatRupiah(totalRevenueValue)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 rounded-[20px] border border-[#dcece3] bg-white p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                        <div className="grid grid-cols-[44px_minmax(0,1fr)] gap-3">
                          <div className="flex h-60 flex-col justify-between py-1 text-[11px] font-medium text-[#718279]">
                            <span>{formatRupiah(800_000)}</span>
                            <span>{formatRupiah(600_000)}</span>
                            <span>{formatRupiah(400_000)}</span>
                            <span>{formatRupiah(200_000)}</span>
                            <span>{formatRupiah(0)}</span>
                          </div>
                          <div className="relative h-60">
                            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
                              {[0, 1, 2, 3, 4].map((line) => (
                                <div key={line} className="border-t border-dashed border-[#dbe9e0]" />
                              ))}
                            </div>
                            <div className="relative z-10 grid h-full grid-cols-7 gap-3">
                              {revenueTrend.map((item) => {
                                const isSelected = selectedRevenueDay.day === item.day;
                                const height = Math.max((item.value / maxRevenueValue) * 100, 16);
                                return (
                                  <button
                                    key={item.day}
                                    type="button"
                                    onClick={() => setSelectedRevenueDay(item)}
                                    className="group flex h-full flex-col justify-end"
                                    aria-pressed={isSelected}
                                  >
                                    <div className="mb-2 min-h-10 text-center">
                                      <span
                                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold transition ${
                                          isSelected
                                            ? "bg-[#0b5f4e] text-white shadow-[0_12px_24px_rgba(11,95,78,0.18)]"
                                            : "bg-[#edf6f0] text-[#527066] group-hover:bg-[#e3f2e8]"
                                        }`}
                                      >
                                        {item.amount}
                                      </span>
                                    </div>
                                    <div className="relative flex-1 rounded-[22px] bg-[linear-gradient(180deg,#f3faf5,#edf4ef)] px-1.5 pb-1.5 pt-3">
                                      <div
                                        className={`absolute inset-x-1.5 bottom-1.5 rounded-[18px] transition-all duration-300 ${
                                          isSelected
                                            ? "bg-[linear-gradient(180deg,#0b5f4e,#30a678)] shadow-[0_18px_34px_rgba(27,115,84,0.28)]"
                                            : "bg-[linear-gradient(180deg,#79d3aa,#2fa177)] group-hover:bg-[linear-gradient(180deg,#66c99d,#248a64)]"
                                        }`}
                                        style={{ height: `${height}%` }}
                                      />
                                      {isSelected ? (
                                        <div className="absolute inset-x-3 bottom-[calc(100%+8px)] h-1 rounded-full bg-[#0b5f4e]/12" />
                                      ) : null}
                                    </div>
                                    <span className={`mt-3 text-center text-xs font-semibold ${isSelected ? "text-[#10231b]" : "text-[#6d7d75]"}`}>{item.day}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                        <div className="rounded-2xl border border-[#e0eee4] bg-white/88 px-4 py-3">
                          <span className="block text-[10px] uppercase tracking-[0.14em] text-[#708178]">Total 7 hari</span>
                          <strong className="mt-1 block text-sm text-[#173428]">{formatRupiah(totalRevenueValue)}</strong>
                        </div>
                        <div className="rounded-2xl border border-[#e0eee4] bg-white/88 px-4 py-3">
                          <span className="block text-[10px] uppercase tracking-[0.14em] text-[#708178]">Hari tertinggi</span>
                          <strong className="mt-1 block text-sm text-[#173428]">{peakRevenueDay.day} · {peakRevenueDay.amount}</strong>
                        </div>
                        <div className="rounded-2xl border border-[#e0eee4] bg-white/88 px-4 py-3">
                          <span className="block text-[10px] uppercase tracking-[0.14em] text-[#708178]">Rata-rata</span>
                          <strong className="mt-1 block text-sm text-[#173428]">{formatRupiah(averageRevenueValue)}</strong>
                        </div>
                      </div>
                    </div>
                  </article>

                  <article className="rounded-[24px] border border-[#dbece0] bg-[linear-gradient(180deg,#f6fbf7,#eef8f2)] p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <div>
                        <strong className="block text-lg text-[#10231b]">Pusat Kendali Dispatch</strong>
                        <span className="text-sm text-[#65756d]">Urgent, billing, follow up, dan deadline terbaca dari satu panel</span>
                      </div>
                      <span className="rounded-full border border-[#bfe6cf] bg-[#dff7ee] px-3 py-1 text-xs font-semibold text-[#16694f]">
                        Fokus owner
                      </span>
                    </div>

                    <div className="grid gap-3">
                      {[
                        "Dispatch board dengan status live",
                        "Kalender jadwal dan deadline job",
                        "CRM pelanggan dan histori unit",
                        "Invoice, kontrak, inventori, dan setup WAHA",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-3 rounded-2xl border border-[#d7eadc] bg-white px-4 py-3">
                          <span className="h-2.5 w-2.5 rounded-full bg-[#61d0a8]" />
                          <strong className="text-sm font-medium text-[#173428]">{item}</strong>
                        </div>
                      ))}
                    </div>
                  </article>
                </div>

                <div className="space-y-4">
                  <article className="rounded-[24px] border border-[#dbece0] bg-white p-5">
                    <span className="text-[11px] uppercase tracking-[0.16em] text-[#5e6f66]">Status job hari ini</span>
                    <div className="mt-4 space-y-3">
                      {statusBreakdown.map((item) => (
                        <div key={item.label} className="rounded-2xl border border-[#d7eadc] bg-[#f4fbf5] px-4 py-3">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-sm font-medium text-[#173428]">{item.label}</span>
                            <strong className="text-sm text-[#10231b]">{item.value} job</strong>
                          </div>
                          <div className="mt-2 h-2 rounded-full bg-white">
                            <div
                              className="h-2 rounded-full"
                              style={{
                                width: `${Math.max((item.value / 5) * 100, 28)}%`,
                                background: item.color ?? "#61d0a8",
                              }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </article>

                  <article className="rounded-[24px] border border-[#cfe4d5] bg-[linear-gradient(180deg,#eff9f2,#e3f3ea)] p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[11px] uppercase tracking-[0.16em] text-[#2d7b5f]">Quick billing</span>
                      <span className="rounded-full border border-[#bfe6cf] bg-white/88 px-3 py-1 text-[11px] font-semibold text-[#16694f]">UI app asli</span>
                    </div>
                    <div className="mt-4 grid gap-3">
                      {billingPreview.map((item) => (
                        <div key={item.label} className="rounded-2xl border border-[#d7eadc] bg-white/90 px-4 py-3">
                          <span className="block text-[10px] uppercase tracking-[0.14em] text-[#708178]">{item.label}</span>
                          <strong className="mt-1 block text-sm text-[#173428]">
                            {item.label === "Status"
                              ? billingStatusCopy
                              : item.label === "Nilai invoice"
                                ? selectedRevenueDay.amount
                                : item.value}
                          </strong>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 flex gap-2">
                      <button type="button" className="inline-flex min-h-10 items-center justify-center rounded-2xl border border-[#cfe4d5] bg-white px-4 text-sm font-semibold text-[#0d523f]">
                        Simulasi kirim
                      </button>
                      <button type="button" className="inline-flex min-h-10 items-center justify-center rounded-2xl bg-[#0b5f4e] px-4 text-sm font-semibold text-white">
                        Buka invoice
                      </button>
                    </div>
                  </article>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

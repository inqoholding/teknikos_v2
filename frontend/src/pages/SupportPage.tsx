import { Link } from "react-router-dom";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { SALES_WHATSAPP_LINK, SITE_NAME, SUPPORT_EMAIL, SUPPORT_URL } from "../lib/site";

export default function SupportPage() {
  useDocumentMeta({
    title: `Support | ${SITE_NAME}`,
    description: "Kanal dukungan resmi Coreveta untuk bantuan sales, onboarding, billing, dan kendala operasional.",
    path: "/support",
  });

  return (
    <div className="min-h-screen bg-[#03130f] px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <div className="rounded-[32px] border border-emerald-500/20 bg-white/5 p-8 shadow-2xl backdrop-blur">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300/80">Support</p>
          <h1 className="mt-3 font-['Space_Grotesk'] text-4xl font-semibold text-white">Kanal Bantuan Resmi Coreveta</h1>
          <p className="mt-4 max-w-3xl text-base leading-8 text-slate-300">
            Gunakan kanal ini untuk onboarding, kendala login, masalah billing, atau pertanyaan operasional harian.
          </p>

          <div className="mt-8 grid gap-5 md:grid-cols-2">
            <a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="rounded-[28px] border border-emerald-500/25 bg-emerald-500/10 p-6 transition hover:bg-emerald-500/15">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">WhatsApp Support</p>
              <p className="mt-3 text-lg font-semibold text-white">Respons cepat untuk isu operasional</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">Gunakan untuk pertanyaan penggunaan aplikasi, reset akses, dan troubleshooting harian.</p>
            </a>

            <a href={SALES_WHATSAPP_LINK} target="_blank" rel="noreferrer" className="rounded-[28px] border border-white/10 bg-zinc-950/80 p-6 transition hover:border-emerald-500/25">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-300">Sales & Onboarding</p>
              <p className="mt-3 text-lg font-semibold text-white">Demo produk dan paket langganan</p>
              <p className="mt-2 text-sm leading-7 text-slate-300">Gunakan untuk demo, konsultasi implementasi, dan pertanyaan paket.</p>
            </a>
          </div>

          <div className="mt-6 rounded-[28px] border border-white/10 bg-zinc-950/70 p-6">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-400">Email Operasional</p>
            <p className="mt-3 text-lg font-semibold text-white">{SUPPORT_EMAIL}</p>
            <p className="mt-2 text-sm leading-7 text-slate-300">Gunakan bila membutuhkan jejak tertulis untuk kebutuhan administrasi atau eskalasi formal.</p>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/privacy" className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/30 hover:text-emerald-200">Privacy Policy</Link>
            <Link to="/terms" className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/30 hover:text-emerald-200">Terms of Service</Link>
            <Link to="/" className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-emerald-400/30 hover:text-emerald-200">Kembali ke Landing</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

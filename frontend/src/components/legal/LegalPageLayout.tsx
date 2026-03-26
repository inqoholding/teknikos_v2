import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { DATA_HANDLING_URL, PRIVACY_URL, SITE_NAME, SUPPORT_URL, TERMS_URL } from "../../lib/site";

type LegalPageLayoutProps = {
  eyebrow: string;
  title: string;
  summary: string;
  children: ReactNode;
};

export function LegalPageLayout({ eyebrow, title, summary, children }: LegalPageLayoutProps) {
  return (
    <div className="min-h-screen bg-[#03130f] px-6 py-10 text-slate-100">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-[28px] border border-emerald-500/20 bg-white/5 px-6 py-4 backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-300/80">{eyebrow}</p>
            <h1 className="mt-2 font-['Space_Grotesk'] text-3xl font-semibold text-white md:text-4xl">{title}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-300">{summary}</p>
          </div>
          <Link
            to="/"
            className="rounded-full border border-emerald-400/30 bg-emerald-500/10 px-5 py-2 text-sm font-semibold text-emerald-200 transition hover:bg-emerald-500/20"
          >
            Kembali ke Landing
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
          <article className="rounded-[30px] border border-white/10 bg-zinc-950/70 p-7 shadow-2xl">
            <div className="max-w-none text-sm leading-7 text-slate-300 [&_h2]:font-['Space_Grotesk'] [&_h2]:text-white [&_p]:text-slate-300">
              {children}
            </div>
          </article>

          <aside className="rounded-[30px] border border-white/10 bg-white/5 p-6 backdrop-blur">
            <h2 className="font-['Space_Grotesk'] text-lg font-semibold text-white">Referensi Cepat</h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-300">
              <li><a href={PRIVACY_URL} className="transition hover:text-emerald-300">Privacy Policy</a></li>
              <li><a href={TERMS_URL} className="transition hover:text-emerald-300">Terms of Service</a></li>
              <li><a href={DATA_HANDLING_URL} className="transition hover:text-emerald-300">Data Handling</a></li>
              <li><a href={SUPPORT_URL} target="_blank" rel="noreferrer" className="transition hover:text-emerald-300">Support WhatsApp</a></li>
            </ul>

            <div className="mt-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-200/80">Dokumen Resmi</p>
              <p className="mt-3 text-sm leading-6 text-slate-200">
                Dokumen ini berlaku untuk penggunaan {SITE_NAME} pada situs publik, dashboard aplikasi, dan kanal dukungan resmi.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

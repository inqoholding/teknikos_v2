import { Link } from "react-router-dom";

type FooterLink = {
  text: string;
  url: string;
  external?: boolean;
};

type FooterSection = {
  title: string;
  links: FooterLink[];
};

type MarketingFooterProps = {
  tagline?: string;
  menuItems?: FooterSection[];
  copyright?: string;
  bottomLinks?: FooterLink[];
};

function FooterAnchor({ link }: { link: FooterLink }) {
  if (link.external) {
    return (
      <a href={link.url} target="_blank" rel="noreferrer">
        {link.text}
      </a>
    );
  }

  if (link.url.startsWith("/")) {
    return <Link to={link.url}>{link.text}</Link>;
  }

  return <a href={link.url}>{link.text}</a>;
}

export function MarketingFooter({
  tagline = "Sistem operasi digital untuk bisnis jasa teknik Indonesia.",
  menuItems = [
    {
      title: "Produk",
      links: [
        { text: "Fitur", url: "#fitur" },
        { text: "Harga", url: "#harga" },
        { text: "Alur kerja", url: "#workflow" },
        { text: "Demo owner", url: "/demo-owner-dashboard" },
      ],
    },
    {
      title: "Akun",
      links: [
        { text: "Daftar", url: "/register" },
        { text: "Login", url: "/login" },
        { text: "Tanya sales", url: "https://wa.me/6281354444967?text=Halo%20sales%20TeknikOS,%20saya%20ingin%20tanya%20demo%20dan%20langganan.", external: true },
      ],
    },
    {
      title: "Demo",
      links: [
        { text: "Dashboard owner", url: "/demo-owner-dashboard" },
        { text: "Lihat harga", url: "#harga" },
        { text: "Lihat fitur", url: "#fitur" },
      ],
    },
    {
      title: "Kontak",
      links: [
        { text: "WhatsApp Sales", url: "https://wa.me/6281354444967?text=Halo%20sales%20TeknikOS,%20saya%20ingin%20tanya%20demo%20dan%20langganan.", external: true },
        { text: "Mulai gratis", url: "/register" },
      ],
    },
  ],
  copyright = "© 2026 TeknikOS. All rights reserved.",
  bottomLinks = [
    { text: "Fitur", url: "#fitur" },
    { text: "Harga", url: "#harga" },
    { text: "Login", url: "/login" },
  ],
}: MarketingFooterProps) {
  return (
    <section className="mx-auto w-full max-w-7xl px-6 pb-16 pt-6">
      <div className="rounded-[32px] border border-emerald-500/20 bg-zinc-900/50 backdrop-blur-xl p-8 shadow-2xl md:p-10">
        <footer>
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-[1.35fr_repeat(4,0.85fr)]">
            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0b5f4e] via-[#169d73] to-[#61d0a8] text-base font-extrabold text-white">
                  T
                </div>
                <div>
                  <p className="font-['Space_Grotesk'] text-xl font-semibold tracking-[-0.04em] text-white">TeknikOS</p>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-emerald-500/80">SaaS jasa teknik Indonesia</p>
                </div>
              </div>
              <p className="mt-5 max-w-sm text-sm leading-7 text-zinc-400">{tagline}</p>
            </div>

            {menuItems.map((section) => (
              <div key={section.title}>
                <h3 className="mb-4 text-sm font-semibold uppercase tracking-[0.14em] text-white">{section.title}</h3>
                <ul className="space-y-3 text-sm text-zinc-400">
                  {section.links.map((link) => (
                    <li key={`${section.title}-${link.text}`} className="font-medium transition-colors hover:text-emerald-400">
                      <FooterAnchor link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm font-medium text-zinc-500 md:flex-row md:items-center md:justify-between">
            <p>{copyright}</p>
            <ul className="flex flex-wrap gap-4">
              {bottomLinks.map((link) => (
                <li key={`bottom-${link.text}`} className="transition-colors hover:text-emerald-400">
                  <FooterAnchor link={link} />
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </div>
    </section>
  );
}

import { LandingHeroTemplate } from "../components/marketing/LandingHeroTemplate";
import { CookieNotice } from "../components/marketing/CookieNotice";
import { MarketingFooter } from "../components/ui/marketing-footer";
import { useDocumentMeta } from "../hooks/useDocumentMeta";
import { SALES_WHATSAPP_LINK, SITE_DESCRIPTION, SITE_TITLE } from "../lib/site";

export default function HomePage() {
  useDocumentMeta({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    path: "/",
  });

  return (
    <div className="landing-page bg-[#01140E] text-slate-100 min-h-screen font-sans overflow-x-hidden">
      <LandingHeroTemplate salesWhatsappLink={SALES_WHATSAPP_LINK} />
      <CookieNotice />
      <MarketingFooter />
    </div>
  );
}

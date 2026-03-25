import { LandingHeroTemplate } from "../components/marketing/LandingHeroTemplate";
import { MarketingFooter } from "../components/ui/marketing-footer";

const SALES_WHATSAPP_LINK =
  "https://wa.me/6281354444967?text=Halo%20sales%20TeknikOS,%20saya%20ingin%20tanya%20demo%20dan%20langganan.";

export default function HomePage() {
  return (
    <div className="landing-page bg-[#01140E] text-slate-100 min-h-screen font-sans overflow-x-hidden">
      <LandingHeroTemplate salesWhatsappLink={SALES_WHATSAPP_LINK} />
      <MarketingFooter />
    </div>
  );
}

import { ArrowRight, LayoutGrid, CircleDollarSign, Route, Menu, X, CheckCircle2, Kanban, Users, Package, FileSignature } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { BrandLogo } from "../ui/BrandLogo";
import { ShimmerButton } from "@/components/ui/shimmer-button";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { motion } from "framer-motion";

export function LandingHeroTemplate({ salesWhatsappLink }: { salesWhatsappLink: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeFeature, setActiveFeature] = useState("dashboard");
  const navigate = useNavigate();

  const features = [
    { id: "dashboard", label: "Dashboard", icon: LayoutGrid, img: "/real-screenshots/user3_dashboard_1775610591207.png" },
    { id: "kanban", label: "Job Kanban", icon: Kanban, img: "/real-screenshots/user3_jobs_1775610591207.png" },
    { id: "teknisi", label: "Teknisi", icon: Users, img: "/real-screenshots/user3_technicians_1775610591207.png" },
    { id: "inventori", label: "Inventori", icon: Package, img: "/real-screenshots/inventory_list_1775531174266.png" },
    { id: "kontrak", label: "Kontrak B2B", icon: FileSignature, img: "/real-screenshots/contracts_list_1775531399253.png" },
  ];

  return (
    <div className="relative text-white font-sans selection:bg-emerald-500/30">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-green-600/20 blur-[120px] pointer-events-none" />

      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl rounded-full border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <BrandLogo size={32} />
          <span className="font-bold text-lg tracking-tight">Coreveta</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
          <a href="#fitur" className="hover:text-white transition">Fitur</a>
          <a href="#harga" className="hover:text-white transition">Harga</a>
          <Link to="/demo-owner-dashboard" className="hover:text-white transition">Demo App</Link>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition">Masuk</Link>
          <ShimmerButton 
            onClick={() => navigate('/register')} 
            className="text-sm font-bold shadow-2xl"
            background="rgba(16, 185, 129, 0.1)"
            shimmerColor="#10b981"
          >
            Daftar Gratis
          </ShimmerButton>
        </div>
        <button className="md:hidden text-zinc-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#01140E]/95 backdrop-blur-md pt-24 px-6 flex flex-col gap-6 md:hidden">
           <a href="#fitur" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-emerald-400">Fitur</a>
           <a href="#harga" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-emerald-400">Harga</a>
           <Link to="/demo-owner-dashboard" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold text-emerald-400">Demo App</Link>
           <Link to="/login" className="text-xl font-bold text-zinc-400">Masuk</Link>
           <ShimmerButton 
             onClick={() => navigate('/register')} 
             className="mt-4 w-full py-4 text-lg font-bold"
             background="rgba(16, 185, 129, 0.2)"
             shimmerColor="#10b981"
           >
             Daftar Sekarang
           </ShimmerButton>
        </div>
      )}

      <motion.section 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100, damping: 30, mass: 1 }}
        className="relative z-10 pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Buktikan kecanggihan operasional Anda dengan Demo Interaktif
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-[1.1]">
          Operasional lapangan yang <span className="bg-gradient-to-r from-emerald-400 to-green-500 bg-clip-text text-transparent">tadinya ribet</span>, kini terkendali penuh.
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          Ganti koordinasi WhatsApp group dan invoice kertas dengan satu dashboard. Presisi, cepat, dan profesional di mata pelanggan Anda.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <ShimmerButton 
            onClick={() => navigate('/register')} 
            className="w-full sm:w-auto px-10 py-5 text-lg font-bold shadow-[0_0_40px_-10px_rgba(16,185,129,0.4)]"
            background="rgba(16, 185, 129, 0.2)"
            shimmerColor="#10b981"
            shimmerSize="0.1em"
          >
            Mulai Tanpa Kartu Kredit
          </ShimmerButton>
          <a href={salesWhatsappLink} target="_blank" rel="noreferrer" className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
            Tanya via WhatsApp <ArrowRight size={18} />
          </a>
        </div>

        <div className="w-full flex justify-center mt-28 mb-12 overflow-x-auto no-scrollbar scroll-smooth">
          <div className="flex bg-white/5 border border-white/10 p-1.5 rounded-2xl backdrop-blur-md">
            {features.map((feature) => (
              <button
                key={feature.id}
                onClick={() => setActiveFeature(feature.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                  activeFeature === feature.id
                    ? "bg-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <feature.icon size={16} />
                {feature.label}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full max-w-4xl group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-green-600 rounded-[2.5rem] blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
          <div className="relative rounded-[2rem] border border-white/10 bg-zinc-950 overflow-hidden shadow-2xl">
            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent"></div>
            <div className="p-2 md:p-4 bg-zinc-900/50 backdrop-blur-sm border-b border-white/5 flex items-center gap-2">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40"></div>
                <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/40"></div>
              </div>
              <div className="mx-auto bg-white/5 rounded-lg px-4 py-1 text-[10px] text-zinc-500 border border-white/5 font-mono">
                coreveta.com/{activeFeature}
              </div>
            </div>
            <div className="relative aspect-video overflow-hidden bg-black/50">
              {features.map((f) => (
                <div
                  key={f.id}
                  className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                    activeFeature === f.id 
                      ? "opacity-100 scale-100 translate-y-0" 
                      : "opacity-0 scale-105 translate-y-4 pointer-events-none"
                  }`}
                >
                  <img 
                    src={f.img} 
                    alt={f.label} 
                    className="w-full h-full object-cover object-top hover:scale-[1.02] transition-transform duration-1000"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-zinc-950 via-zinc-950/50 to-transparent"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section 
        id="fitur" 
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100, damping: 30, mass: 1, delay: 0.2 }}
        className="py-24 px-6 max-w-7xl mx-auto relative z-10"
      >
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Semua yang Anda butuhkan,<br/>dalam satu <span className="text-emerald-400">Superapp</span></h2>
          <p className="text-zinc-400">Dirancang khusus untuk alur kerja bengkel dan jasa servis.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          <div className="md:col-span-2 rounded-[2rem] bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 p-8 flex flex-col justify-end relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <GlowingEffect disabled={false} spread={40} proximity={64} blur={10} />
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-3xl group-hover:bg-emerald-500/20 transition-colors"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mb-6">
                <LayoutGrid size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Pusat Dispatch Pintar</h3>
              <p className="text-zinc-400 max-w-md">Assign teknisi, pantau status job secara real-time, dan pastikan tidak ada jadwal yang bentrok dengan kalender operasional terintegrasi.</p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 p-8 flex flex-col justify-end relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <GlowingEffect disabled={false} spread={40} proximity={64} blur={10} />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center mb-6">
                <CircleDollarSign size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Automasi Invoice</h3>
              <p className="text-zinc-400 text-sm">Ubah status job jadi invoice lunas dalam satu klik pemrosesan aman.</p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 p-8 flex flex-col justify-end relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
            <GlowingEffect disabled={false} spread={40} proximity={64} blur={10} />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-green-500/20 text-green-400 flex items-center justify-center mb-6">
                <Route size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Live Tracking</h3>
              <p className="text-zinc-400 text-sm">Lacak posisi teknisi dan status pekerjaan dari jarak dekat.</p>
            </div>
          </div>

          <div className="md:col-span-2 rounded-[2rem] bg-gradient-to-tr from-emerald-950/40 to-black border border-emerald-500/20 p-8 flex flex-col justify-end relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <GlowingEffect disabled={false} spread={50} proximity={80} blur={15} />
            <div className="absolute bottom-0 right-0 w-[50%] h-full bg-gradient-to-l from-emerald-500/10 to-transparent"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-3 text-white">Integrasi WhatsApp (WAHA)</h3>
              <p className="text-emerald-200/70 max-w-lg mb-6">Kirim update progress otomatis ke pelanggan Anda melalui WhatsApp resmi bisnis Anda tanpa harus mengetik manual.</p>
              <Link to="/demo-owner-dashboard" className="flex items-center gap-2 text-emerald-400 font-bold hover:text-emerald-300 transition-colors">
                Lihat Cara Kerjanya <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </motion.section>

      <motion.section 
        id="harga" 
        initial={{ opacity: 0, scale: 0.95 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ type: "spring", stiffness: 100, damping: 30, mass: 1, delay: 0.2 }}
        className="py-24 px-6 max-w-7xl mx-auto relative z-10"
      >
        <div className="text-center mb-16">
          <span className="text-emerald-500 font-bold uppercase tracking-widest text-sm mb-2 block">Harga Sederhana</span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Mulai gratis, upgrade nanti.</h2>
          <p className="text-zinc-400">Dirancang untuk bengkel kecil sampai tim multi-cabang tanpa harga siluman.</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 flex flex-col">
            <h3 className="text-xl font-bold">Starter</h3>
            <div className="mt-4 flex items-start gap-1">
              <span className="mt-2 text-sm font-bold text-zinc-400">Rp</span>
              <strong className="text-5xl font-bold">0</strong>
            </div>
            <p className="mt-3 text-sm text-zinc-400 pb-6 border-b border-white/10 mb-6 flex-1">Solois baru mulai.</p>
            <ul className="space-y-4 text-sm text-zinc-300 mb-8 font-medium">
              <li className="flex gap-3"><CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> Job list Dasar (List & Kanban)</li>
              <li className="flex gap-3"><CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> Manajemen Teknisi & Skill Tags</li>
              <li className="flex gap-3"><CheckCircle2 size={18} className="text-emerald-500 shrink-0" /> CRM Pelanggan & Unit Aset</li>
            </ul>
            <button onClick={() => navigate('/register?plan=Starter')} className="w-full rounded-full border border-white/20 bg-white/5 py-3 text-sm font-bold hover:bg-white/10 transition-colors">
              Ambil Starter
            </button>
          </div>

          <div className="rounded-3xl border border-emerald-500/50 bg-gradient-to-b from-emerald-950/40 to-black p-8 flex flex-col relative transform md:-translate-y-4 md:scale-105 shadow-2xl shadow-emerald-900/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-2xl"></div>
            <div className="inline-block rounded-full bg-emerald-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-4 self-start border border-emerald-500/20">
              Paling Pas
            </div>
            <h3 className="text-xl font-bold text-white">Pro</h3>
            <div className="mt-2 flex items-start gap-1">
              <span className="mt-2 text-sm font-medium text-emerald-200">Rp</span>
              <strong className="text-5xl font-bold text-white">249<span className="text-2xl text-zinc-500">.k</span></strong>
              <span className="self-end pb-1 text-xs text-zinc-500">/bln</span>
            </div>
            <p className="mt-3 text-sm text-emerald-200/70 pb-6 border-b border-emerald-900/50 mb-6 flex-1">Untuk max 4 teknisi dan admin.</p>
            <ul className="space-y-4 text-sm text-white mb-8 font-medium">
              <li className="flex gap-3"><CheckCircle2 size={18} className="text-emerald-400 shrink-0" /> Semua fitur Starter +</li>
              <li className="flex gap-3 opacity-90"><CheckCircle2 size={18} className="text-emerald-400 shrink-0" /> Otomasi WhatsApp (WAHA)</li>
              <li className="flex gap-3 opacity-90"><CheckCircle2 size={18} className="text-emerald-400 shrink-0" /> Foto Sebelum & Sesudah Kerja</li>
              <li className="flex gap-3 opacity-90"><CheckCircle2 size={18} className="text-emerald-400 shrink-0" /> Inventori & Stok Sparepart</li>
              <li className="flex gap-3 opacity-90"><CheckCircle2 size={18} className="text-emerald-400 shrink-0" /> Invoice PDF via WhatsApp</li>
            </ul>
            <button onClick={() => navigate('/register?plan=Pro')} className="w-full rounded-full bg-gradient-to-r from-emerald-500 to-green-600 py-3 text-sm font-bold text-white hover:scale-[1.02] transition-transform">
              Mulai Berlangganan
            </button>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-8 flex flex-col">
            <h3 className="text-xl font-bold">Bisnis</h3>
            <div className="mt-4 flex items-start gap-1">
              <span className="mt-2 text-sm font-bold text-zinc-400">Rp</span>
              <strong className="text-5xl font-bold">499<span className="text-2xl text-zinc-400">.k</span></strong>
              <span className="self-end pb-1 text-xs text-zinc-400">/bln</span>
            </div>
            <p className="mt-3 text-sm text-zinc-400 pb-6 border-b border-white/10 mb-6 flex-1">Ekspansi lebih luas.</p>
            <ul className="space-y-4 text-sm text-zinc-300 mb-8 font-medium">
              <li className="flex gap-3"><CheckCircle2 size={18} className="text-zinc-500 shrink-0" /> Semua fitur Pro +</li>
              <li className="flex gap-3"><CheckCircle2 size={18} className="text-zinc-500 shrink-0" /> Manajemen Kontrak B2B (Recurring)</li>
              <li className="flex gap-3"><CheckCircle2 size={18} className="text-zinc-500 shrink-0" /> Asset Health & Service Frequency</li>
              <li className="flex gap-3"><CheckCircle2 size={18} className="text-zinc-500 shrink-0" /> Laporan Profitabilitas Berbasis Data</li>
              <li className="flex gap-3"><CheckCircle2 size={18} className="text-zinc-500 shrink-0" /> Dukungan Prioritas 24/7</li>
            </ul>
            <button onClick={() => navigate('/register?plan=Bisnis')} className="w-full rounded-full border border-white/20 bg-white/5 py-3 text-sm font-bold hover:bg-white/10 transition-colors">
              Ambil Bisnis
            </button>
          </div>
        </div>
      </motion.section>
    </div>
  );
}

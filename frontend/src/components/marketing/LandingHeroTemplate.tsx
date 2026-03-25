import { ArrowRight, LayoutGrid, CircleDollarSign, Route, Menu, X, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export function LandingHeroTemplate({ salesWhatsappLink }: { salesWhatsappLink: string }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="relative text-white font-sans selection:bg-rose-500/30">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-rose-600/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-red-600/20 blur-[120px] pointer-events-none" />

      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-5xl rounded-full border border-white/10 bg-white/5 backdrop-blur-xl px-6 py-3 flex items-center justify-between shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-500 to-red-600 flex items-center justify-center font-bold text-sm">
            T
          </div>
          <span className="font-bold text-lg tracking-tight">TeknikOS</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-300">
          <a href="#fitur" className="hover:text-white transition">Fitur</a>
          <a href="#harga" className="hover:text-white transition">Harga</a>
          <Link to="/demo-owner-dashboard" className="hover:text-white transition">Demo App</Link>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <Link to="/login" className="text-sm font-medium text-zinc-300 hover:text-white transition">Masuk</Link>
          <button onClick={() => navigate('/register')} className="bg-white text-black px-5 py-2 rounded-full text-sm font-bold hover:scale-105 transition-transform">
            Daftar Gratis
          </button>
        </div>
        <button className="md:hidden text-zinc-300" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X /> : <Menu />}
        </button>
      </nav>

      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 bg-[#0A0A0B]/95 backdrop-blur-md pt-24 px-6 flex flex-col gap-6 md:hidden">
           <a href="#fitur" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold">Fitur</a>
           <a href="#harga" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold">Harga</a>
           <Link to="/demo-owner-dashboard" onClick={() => setMobileMenuOpen(false)} className="text-xl font-bold">Demo App</Link>
           <Link to="/login" className="text-xl font-bold text-zinc-400">Masuk</Link>
           <button onClick={() => navigate('/register')} className="mt-4 bg-gradient-to-r from-rose-500 to-red-600 text-white py-4 rounded-xl font-bold text-lg">Daftar Sekarang</button>
        </div>
      )}

      <section className="relative z-10 pt-40 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-300 text-sm font-medium mb-8">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
          Platform B2B SaaS Jasa Teknik Indonesia
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl leading-[1.1]">
          Operasional lapangan yang <span className="bg-gradient-to-r from-rose-400 to-red-500 bg-clip-text text-transparent">tadinya ribet</span>, kini terkendali penuh.
        </h1>
        <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mb-10 leading-relaxed">
          Ganti koordinasi WhatsApp group dan invoice kertas dengan satu dashboard. Presisi, cepat, dan profesional di mata pelanggan Anda.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center">
          <button onClick={() => navigate('/register')} className="w-full sm:w-auto px-8 py-4 rounded-full bg-gradient-to-r from-rose-500 to-red-600 text-white font-bold text-lg shadow-[0_0_40px_-10px_rgba(244,63,94,0.6)] hover:scale-105 hover:shadow-[0_0_60px_-15px_rgba(244,63,94,0.8)] transition-all">
            Mulai Tanpa Kartu Kredit
          </button>
          <a href={salesWhatsappLink} target="_blank" rel="noreferrer" className="w-full sm:w-auto px-8 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-md text-white font-bold text-lg hover:bg-white/10 transition-colors flex items-center justify-center gap-2">
            Tanya via WhatsApp <ArrowRight size={18} />
          </a>
        </div>

        <div className="mt-20 relative w-full max-w-5xl mx-auto perspective-[2000px]">
          <div className="absolute inset-0 bg-gradient-to-b from-rose-500/20 to-transparent blur-3xl rounded-[3rem] -z-10 transform scale-105"></div>
          <div className="rounded-[2rem] p-2 bg-white/5 border border-white/10 backdrop-blur-sm shadow-2xl relative">
             <div className="absolute top-4 left-4 flex gap-2 z-20">
               <div className="w-3 h-3 rounded-full bg-rose-500/50"></div>
               <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
               <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
             </div>
             <img 
               src="/teknikos-dashboard-mockup.png" 
               alt="TeknikOS Dashboard Live" 
               className="w-full max-h-[400px] md:max-h-[550px] object-cover object-top flex rounded-[1.5rem] border border-white/5 shadow-inner"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0B] via-transparent to-[#0A0A0B]/10 rounded-[2rem] pointer-events-none"></div>
          </div>
        </div>
      </section>

      <section id="fitur" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold mb-4">Semua yang Anda butuhkan,<br/>dalam satu <span className="text-rose-400">Superapp</span></h2>
          <p className="text-zinc-400">Dirancang khusus untuk alur kerja bengkel dan jasa servis.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          <div className="md:col-span-2 rounded-[2rem] bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 p-8 flex flex-col justify-end relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/10 blur-3xl group-hover:bg-rose-500/20 transition-colors"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center mb-6">
                <LayoutGrid size={24} />
              </div>
              <h3 className="text-2xl font-bold mb-2">Pusat Dispatch Pintar</h3>
              <p className="text-zinc-400 max-w-md">Assign teknisi, pantau status job secara real-time, dan pastikan tidak ada jadwal yang bentrok dengan kalender operasional terintegrasi.</p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 p-8 flex flex-col justify-end relative overflow-hidden group">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center mb-6">
                <CircleDollarSign size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Automasi Invoice</h3>
              <p className="text-zinc-400 text-sm">Ubah status job jadi invoice lunas dalam satu klik pemrosesan aman.</p>
            </div>
          </div>

          <div className="rounded-[2rem] bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 p-8 flex flex-col justify-end relative overflow-hidden group">
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center mb-6">
                <Route size={24} />
              </div>
              <h3 className="text-xl font-bold mb-2">Live Tracking</h3>
              <p className="text-zinc-400 text-sm">Lacak posisi teknisi dan status pekerjaan dari jarak dekat.</p>
            </div>
          </div>

          <div className="md:col-span-2 rounded-[2rem] bg-gradient-to-tr from-rose-950/40 to-black border border-rose-500/20 p-8 flex flex-col justify-end relative overflow-hidden">
            <div className="absolute bottom-0 right-0 w-[50%] h-full bg-gradient-to-l from-rose-500/10 to-transparent"></div>
            <div className="relative z-10">
              <h3 className="text-3xl font-bold mb-3 text-white">Integrasi WhatsApp (WAHA)</h3>
              <p className="text-rose-200/70 max-w-lg mb-6">Kirim update progress otomatis ke pelanggan Anda melalui WhatsApp resmi bisnis Anda tanpa harus mengetik manual.</p>
              <Link to="/demo-owner-dashboard" className="flex items-center gap-2 text-rose-400 font-bold hover:text-rose-300">
                Lihat Cara Kerjanya <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section id="harga" className="py-24 px-6 max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="text-rose-500 font-bold uppercase tracking-widest text-sm mb-2 block">Harga Sederhana</span>
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
              <li className="flex gap-3"><CheckCircle2 size={18} className="text-rose-500 shrink-0" /> Job list dasar</li>
              <li className="flex gap-3"><CheckCircle2 size={18} className="text-rose-500 shrink-0" /> List Pelanggan</li>
              <li className="flex gap-3"><CheckCircle2 size={18} className="text-rose-500 shrink-0" /> Invoice statis</li>
            </ul>
            <button onClick={() => navigate('/register')} className="w-full rounded-full border border-white/20 bg-white/5 py-3 text-sm font-bold hover:bg-white/10 transition-colors">
              Ambil Starter
            </button>
          </div>

          <div className="rounded-3xl border border-rose-500/50 bg-gradient-to-b from-rose-950/40 to-black p-8 flex flex-col relative transform md:-translate-y-4 md:scale-105 shadow-2xl shadow-rose-900/20">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/20 blur-2xl"></div>
            <div className="inline-block rounded-full bg-rose-500/20 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-400 mb-4 self-start border border-rose-500/20">
              Paling Pas
            </div>
            <h3 className="text-xl font-bold text-white">Pro</h3>
            <div className="mt-2 flex items-start gap-1">
              <span className="mt-2 text-sm font-medium text-rose-200">Rp</span>
              <strong className="text-5xl font-bold text-white">249<span className="text-2xl text-zinc-500">.k</span></strong>
              <span className="self-end pb-1 text-xs text-zinc-500">/bln</span>
            </div>
            <p className="mt-3 text-sm text-rose-200/70 pb-6 border-b border-rose-900/50 mb-6 flex-1">Untuk max 4 teknisi dan admin.</p>
            <ul className="space-y-4 text-sm text-white mb-8 font-medium">
              <li className="flex gap-3"><CheckCircle2 size={18} className="text-rose-400 shrink-0" /> Semua Starter +</li>
              <li className="flex gap-3 opacity-90"><CheckCircle2 size={18} className="text-rose-400 shrink-0" /> Live Dashboard</li>
              <li className="flex gap-3 opacity-90"><CheckCircle2 size={18} className="text-rose-400 shrink-0" /> CRM & Histori</li>
              <li className="flex gap-3 opacity-90"><CheckCircle2 size={18} className="text-rose-400 shrink-0" /> Otomasi WAHA</li>
            </ul>
            <button onClick={() => navigate('/register')} className="w-full rounded-full bg-gradient-to-r from-rose-500 to-red-600 py-3 text-sm font-bold text-white hover:scale-[1.02] transition-transform">
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
              <li className="flex gap-3"><CheckCircle2 size={18} className="text-zinc-500 shrink-0" /> Semua fitur Pro</li>
              <li className="flex gap-3"><CheckCircle2 size={18} className="text-zinc-500 shrink-0" /> Multi tim lapangan</li>
              <li className="flex gap-3"><CheckCircle2 size={18} className="text-zinc-500 shrink-0" /> Konsolidasi laporan</li>
              <li className="flex gap-3"><CheckCircle2 size={18} className="text-zinc-500 shrink-0" /> Limit API extra</li>
            </ul>
            <button onClick={() => navigate('/register')} className="w-full rounded-full border border-white/20 bg-white/5 py-3 text-sm font-bold hover:bg-white/10 transition-colors">
              Ambil Bisnis
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

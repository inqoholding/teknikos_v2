import {
  Bell,
  BriefcaseBusiness,
  ClipboardList,
  FileCheck,
  FileText,
  LayoutDashboard,
  LogOut,
  Package,
  Settings,
  ShieldCheck,
  UserCircle,
  Users,
} from "lucide-react";
import { Link, NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useBusinessQuery, useLogoutMutation, useSessionQuery } from "../api/hooks";

const appNav: Array<{ label: string; to: string; feature?: string }> = [
  { label: "Dashboard", to: "/dashboard" },
  { label: "Job Order", to: "/jobs" },
  { label: "Teknisi", to: "/technicians" },
  { label: "Pelanggan", to: "/customers" },
  { label: "Invoice", to: "/invoices" },
  { label: "Inventori", to: "/inventory", feature: "inventoryEnabled" },
  { label: "Kontrak", to: "/contracts", feature: "contractsEnabled" },
  { label: "Pengaturan", to: "/settings" },
];

const technicianNav: Array<{ label: string; to: string; feature?: string }> = [
  { label: "Job Order", to: "/jobs" },
  { label: "Pengaturan", to: "/settings" },
];

const adminNav = [{ label: "Kelola Subscription", to: "/admin" }];

const navIcons = {
  Dashboard: LayoutDashboard,
  "Job Order": ClipboardList,
  Teknisi: Users,
  Pelanggan: UserCircle,
  Invoice: FileText,
  Inventori: Package,
  Kontrak: FileCheck,
  Pengaturan: Settings,
};

const titleMap: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "Dashboard",
    subtitle: "Pantau performa bisnis dan operasional teknisi hari ini",
  },
  "/jobs": {
    title: "Job Order",
    subtitle: "Kelola antrian kerja, penugasan teknisi, dan perubahan status job",
  },
  "/technicians": {
    title: "Teknisi",
    subtitle: "Pantau kapasitas tim lapangan, skill, rating, dan status kerja",
  },
  "/customers": {
    title: "Pelanggan",
    subtitle: "Kelola database pelanggan, alamat, histori servis, dan unit terpasang",
  },
  "/invoices": {
    title: "Invoice",
    subtitle: "Lacak tagihan, jatuh tempo, dan pembayaran yang sudah masuk",
  },
  "/inventory": {
    title: "Inventori",
    subtitle: "Kontrol stok sparepart, nilai persediaan, dan item yang hampir habis",
  },
  "/contracts": {
    title: "Kontrak Servis",
    subtitle: "Pantau kontrak rutin, jadwal berikutnya, dan peluang perpanjangan",
  },
  "/settings": {
    title: "Pengaturan",
    subtitle: "Atur profil bisnis, preferensi invoice, dan notifikasi operasional",
  },
};

function resolveHeading(pathname: string) {
  if (pathname.startsWith("/jobs/")) {
    return {
      title: "Detail Job",
      subtitle: "Lihat progres, teknisi, item pekerjaan, dan aksi lanjutan per job",
    };
  }

  if (pathname.startsWith("/customers/")) {
    return {
      title: "Detail Pelanggan",
      subtitle: "Riwayat servis, kontrak aktif, dan konteks pelanggan dalam satu panel",
    };
  }

  return titleMap[pathname] ?? titleMap["/dashboard"];
}

export function AppShellLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const heading = resolveHeading(location.pathname);
  const sessionQuery = useSessionQuery();
  const businessQuery = useBusinessQuery();
  const logoutMutation = useLogoutMutation();
  const business = businessQuery.data;
  const owner = sessionQuery.data?.user;
  const isTechnician = owner?.role === "technician";
  const entitlements = business?.entitlements;
  const initials =
    owner?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "TS";

  const visibleNav = isTechnician ? technicianNav : appNav;

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <Link to="/" className="brand-mark">
          <div className="brand-mark__icon">T</div>
          <div>
            <strong>TeknikOS</strong>
            <span>{business?.name ?? "Business"}</span>
          </div>
        </Link>
        <div className="sidebar-intro">
          <span>Workspace</span>
          <strong>{business?.plan ?? "Starter"} plan</strong>
          <small>
            {business?.subscriptionStatusLabel ?? "Aktif"} · {business?.city ?? "Makassar"}
          </small>
        </div>
        <nav className="app-nav">
          {visibleNav.map((item) => {
            const Icon = navIcons[item.label as keyof typeof navIcons];
            const isLocked =
              item.feature && entitlements ? !entitlements[item.feature as keyof typeof entitlements] : false;

            if (isLocked) {
              return (
                <div key={item.to} className="app-nav__link app-nav__link--locked">
                  <Icon size={18} />
                  <span>{item.label}</span>
                  <small>Upgrade</small>
                </div>
              );
            }

            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `app-nav__link ${isActive ? "app-nav__link--active" : ""}`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
        <div className="app-shell__account">
          <div className="avatar">{initials}</div>
          <div>
            <strong>{owner?.name ?? "Owner"}</strong>
            <span>{isTechnician ? "Teknisi" : "Owner"}</span>
          </div>
          <button className="ghost-button" onClick={handleLogout} disabled={logoutMutation.isPending}>
            <LogOut size={16} />
            {logoutMutation.isPending ? "Keluar..." : "Keluar"}
          </button>
        </div>
      </aside>
      <div className="app-shell__body">
        <header className="app-shell__topbar">
          <div>
            <span className="page-kicker">
              {business?.plan ?? "Starter"} plan · {business?.subscriptionStatusLabel ?? "Aktif"}
            </span>
            <h1>{heading.title}</h1>
            <p>{heading.subtitle}</p>
            {business?.whatsapp?.canUseAutomation ? (
              <div className="form-helper" style={{ marginTop: 8 }}>
                WhatsApp bisnis sudah terhubung. Tombol kirim otomatis siap dipakai dari job dan invoice.
              </div>
            ) : null}
          </div>
          <div className="topbar-actions">
            <div className="status-pill">
              <span className="status-pill__dot" />
              Operasional live
            </div>
            <button className="icon-button">
              <Bell size={18} />
            </button>
            <div className="profile-pill">
              <div className="avatar avatar--small">{initials}</div>
              <div>
                <strong>{owner?.name ?? "Owner"}</strong>
                <span>
                  {isTechnician ? "Akun Teknisi" : business?.city ?? business?.address ?? "Makassar"}
                </span>
              </div>
            </div>
          </div>
        </header>
        <main className="app-shell__content">
          <Outlet />
        </main>
        <div className="mobile-nav">
          <NavLink to={isTechnician ? "/jobs" : "/dashboard"}>Home</NavLink>
          <NavLink to="/jobs">Jobs</NavLink>
          {!isTechnician ? <NavLink to="/customers">CRM</NavLink> : null}
          <NavLink to="/settings">Menu</NavLink>
        </div>
      </div>
    </div>
  );
}

export function AdminShellLayout() {
  const navigate = useNavigate();
  const sessionQuery = useSessionQuery();
  const logoutMutation = useLogoutMutation();
  const owner = sessionQuery.data?.user;
  const initials =
    owner?.name
      ?.split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() ?? "AD";

  async function handleLogout() {
    await logoutMutation.mutateAsync();
    navigate("/login", { replace: true });
  }

  return (
    <div className="app-shell">
      <aside className="app-shell__sidebar">
        <Link to="/" className="brand-mark">
          <div className="brand-mark__icon">T</div>
          <div>
            <strong>TeknikOS Admin</strong>
            <span>Control room</span>
          </div>
        </Link>
        <div className="sidebar-intro">
          <span>Admin Workspace</span>
          <strong>{owner?.role === "moderator" ? "Moderator" : "Admin"}</strong>
          <small>Kelola plan, trial, dan status client</small>
        </div>
        <nav className="app-nav">
          {adminNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `app-nav__link ${isActive ? "app-nav__link--active" : ""}`
              }
            >
              <ShieldCheck size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="app-shell__account">
          <div className="avatar">{initials}</div>
          <div>
            <strong>{owner?.name ?? "Admin"}</strong>
            <span>{owner?.role === "moderator" ? "Moderator" : "Admin"}</span>
          </div>
          <button className="ghost-button" onClick={handleLogout} disabled={logoutMutation.isPending}>
            <LogOut size={16} />
            {logoutMutation.isPending ? "Keluar..." : "Keluar"}
          </button>
        </div>
      </aside>
      <div className="app-shell__body">
        <header className="app-shell__topbar">
          <div>
            <span className="page-kicker">Admin subscription console</span>
            <h1>Kelola Client & Subscription</h1>
            <p>Pantau siapa yang trial, siapa yang aktif, dan paket mana yang perlu di-upgrade.</p>
          </div>
          <div className="topbar-actions">
            <div className="status-pill">
              <span className="status-pill__dot" />
              Staff access
            </div>
            <div className="profile-pill">
              <div className="avatar avatar--small">{initials}</div>
              <div>
                <strong>{owner?.name ?? "Admin"}</strong>
                <span>{owner?.email ?? "staff@teknikos.id"}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="app-shell__content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function AuthScaffold({
  title,
  subtitle,
  eyebrow,
  children,
}: {
  title: string;
  subtitle: string;
  eyebrow: string;
  children: React.ReactNode;
}) {
  return (
    <div className="auth-page">
      <div className="auth-page__hero">
        <div className="brand-mark brand-mark--hero">
          <div className="brand-mark__icon">T</div>
          <div>
            <strong>TeknikOS</strong>
            <span>Field Service Operating System</span>
          </div>
        </div>
        <span className="eyebrow-pill">{eyebrow}</span>
        <h1>{title}</h1>
        <p>{subtitle}</p>
        <div className="hero-stats">
          <div className="hero-stat">
            <span>Job Hari Ini</span>
            <strong>Live API</strong>
            <small>Session + business ready</small>
          </div>
          <div className="hero-stat">
            <span>Kontrak Aktif</span>
            <strong>Backend Sync</strong>
            <small>Owner dashboard tersambung</small>
          </div>
        </div>
        <div className="auth-hero-list">
          <div className="auth-hero-list__item">
            <strong>Dispatch, invoice, dan CRM</strong>
            <p>Masuk ke satu workspace yang menyatukan antrian job, teknisi, billing, dan follow-up pelanggan.</p>
          </div>
          <div className="auth-hero-list__item">
            <strong>Workflow WhatsApp yang jelas</strong>
            <p>Testing koneksi WAHA, kirim notifikasi otomatis, dan pantau komunikasi operasional dari panel yang lebih rapi.</p>
          </div>
          <div className="auth-hero-list__item">
            <strong>Konteks operasional lengkap</strong>
            <p>Deadline, foto before-after, item pekerjaan, dan status invoice terbaca dari alur kerja yang lebih mudah dipahami.</p>
          </div>
        </div>
      </div>
      <div className="auth-page__panel">{children}</div>
    </div>
  );
}

export function MarketingFooter() {
  return (
    <footer className="landing-footer">
      <div>
        <strong>TeknikOS</strong>
        <span>Sistem operasi digital untuk bisnis jasa teknik Indonesia.</span>
      </div>
      <div className="landing-footer__links">
        <a href="#fitur">Fitur</a>
        <a href="#harga">Harga</a>
        <Link to="/login">Login</Link>
      </div>
    </footer>
  );
}

export function FeatureIcon() {
  return (
    <div className="feature-icon">
      <BriefcaseBusiness size={18} />
    </div>
  );
}

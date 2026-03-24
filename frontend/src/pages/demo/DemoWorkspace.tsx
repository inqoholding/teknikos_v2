import {
  Bell,
  ClipboardList,
  FileCheck,
  FileText,
  LayoutDashboard,
  MessageCircle,
  Package,
  Settings,
  UserCircle,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useParams, useSearchParams } from "react-router-dom";
import { Badge, DonutSummary, MiniBarChart, SectionCard, StatCard } from "../../components/UI";
import { whatsappDonts, whatsappRules } from "../settings/whatsappContent";
import {
  business,
  contracts,
  customers,
  dashboardStats,
  inventory,
  invoices,
  jobs,
  revenueBars,
  statusBreakdown,
  technicians,
} from "../../data/mock";

const waLink =
  "https://wa.me/6281354444967?text=Halo%20TeknikOS,%20saya%20ingin%20lanjut%20demo%20atau%20berlangganan.";

const demoNav = [
  { to: "/demo-owner-dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/demo-owner-dashboard/jobs", label: "Job Order", icon: ClipboardList },
  { to: "/demo-owner-dashboard/technicians", label: "Teknisi", icon: Users },
  { to: "/demo-owner-dashboard/customers", label: "Pelanggan", icon: UserCircle },
  { to: "/demo-owner-dashboard/invoices", label: "Invoice", icon: FileText },
  { to: "/demo-owner-dashboard/inventory", label: "Inventori", icon: Package },
  { to: "/demo-owner-dashboard/contracts", label: "Kontrak", icon: FileCheck },
  { to: "/demo-owner-dashboard/settings", label: "Pengaturan", icon: Settings },
];

const queueCards = [
  { title: "Dispatch", value: "3 job", text: "Belum ada teknisi dan perlu assignment cepat.", tone: "warning" as const },
  { title: "Ready To Bill", value: "5 job", text: "Pekerjaan sudah berjalan dan siap lanjut invoice.", tone: "info" as const },
  { title: "CRM Follow Up", value: "7 akun", text: "Pelanggan dengan kontrak due atau invoice tertunda.", tone: "success" as const },
];

const calendarCards = [
  { day: "Sen", jobs: "4 job", deadline: "1 deadline sore" },
  { day: "Sel", jobs: "3 job", deadline: "2 urgent" },
  { day: "Rab", jobs: "5 job", deadline: "Normal" },
  { day: "Kam", jobs: "2 job", deadline: "1 kontrak visit" },
];

const wahaSteps = [
  "Pilih mode WhatsApp dasar atau otomasi WAHA",
  "Hubungkan session WAHA agar QR muncul",
  "Scan QR dan tes koneksi nomor bisnis",
];

const deadlineCards = [
  { title: "JOB-014 · PT Sinar Jaya", meta: "Hari ini · 16:30", tone: "danger" as const },
  { title: "JOB-011 · Outdoor unit rooftop", meta: "Besok · 11:00", tone: "warning" as const },
  { title: "Kontrak Klinik Arafah", meta: "26 Mar 2026", tone: "info" as const },
];

const quickBillingPreview = [
  { label: "Job terkait", value: "JOB-014 · Cuci besar 4 unit cassette" },
  { label: "Pelanggan", value: "PT Sinar Jaya" },
  { label: "Estimasi total", value: "Rp450rb" },
  { label: "Status invoice", value: "Sent" },
];

const autoSendPreview = [
  { label: "Status WAHA", value: "Siap dipakai setelah connect" },
  { label: "Pelanggan", value: "PT Sinar Jaya" },
  { label: "Teknisi", value: "Ardiansyah, Fadli" },
];

function titleForPath(pathname: string) {
  if (pathname.includes("/jobs/")) {
    return {
      title: "Demo Detail Job",
      subtitle: "Mode demo read-only untuk melihat action panel, item kerja, dan konteks job.",
    };
  }

  if (pathname.endsWith("/jobs")) {
    return { title: "Demo Job Order", subtitle: "Filter, list, dan kanban tetap bisa dijelajahi tanpa mengubah data asli." };
  }

  if (pathname.endsWith("/customers")) {
    return { title: "Demo Pelanggan", subtitle: "Lihat CRM, health pelanggan, dan potensi follow-up dalam mode demo." };
  }

  if (pathname.endsWith("/technicians")) {
    return { title: "Demo Teknisi", subtitle: "Pantau kapasitas tim lapangan, skill, rating, dan status kerja dari mode demo." };
  }

  if (pathname.endsWith("/invoices")) {
    return { title: "Demo Invoice", subtitle: "Review billing, overdue, dan alur invoice read-only." };
  }

  if (pathname.endsWith("/inventory")) {
    return { title: "Demo Inventori", subtitle: "Stok, kategori, dan prioritas restock tetap bisa dipreview." };
  }

  if (pathname.endsWith("/contracts")) {
    return { title: "Demo Kontrak", subtitle: "Kontrak aktif dan jadwal berikutnya bisa dilihat dari demo." };
  }

  if (pathname.endsWith("/settings")) {
    return { title: "Demo Pengaturan", subtitle: "Preview struktur pengaturan bisnis dan halaman WAHA seperti di app utama." };
  }

  if (pathname.endsWith("/settings/whatsapp-rules")) {
    return { title: "Rules WhatsApp", subtitle: "Versi demo dari halaman rules WhatsApp untuk membantu client memahami batas aman pemakaian." };
  }

  if (pathname.endsWith("/settings/whatsapp-connect")) {
    return { title: "Hubungkan WAHA", subtitle: "Versi demo dari langkah connect WAHA, scan QR, dan tes koneksi." };
  }

  return {
    title: "Dashboard",
    subtitle: "Pantau performa bisnis dan operasional teknisi hari ini",
  };
}

export function DemoWorkspaceLayout() {
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const pathname = location.pathname;
  const heading = titleForPath(pathname);
  const demoState = searchParams.get("state") ?? "read-only";

  return (
    <div className="app-shell demo-workspace">
      <aside className="app-shell__sidebar">
        <Link to="/" className="brand-mark">
          <div className="brand-mark__icon">T</div>
          <div>
            <strong>TeknikOS</strong>
            <span>{business.name}</span>
          </div>
        </Link>
        <div className="sidebar-intro">
          <span>Workspace</span>
          <strong>{business.plan} plan</strong>
          <small>{business.subscriptionStatusLabel} · {business.city}</small>
        </div>
        <nav className="app-nav">
          {demoNav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/demo-owner-dashboard"} className={({ isActive }) => `app-nav__link ${isActive ? "app-nav__link--active" : ""}`}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="app-shell__account">
          <div className="avatar">BS</div>
          <div>
            <strong>Budi Santoso</strong>
            <span>Demo owner</span>
          </div>
          <a href={waLink} className="btn btn--primary" target="_blank" rel="noreferrer">
            <MessageCircle size={16} />
            Chat Sales
          </a>
        </div>
      </aside>

      <div className="app-shell__body">
        <header className="app-shell__topbar">
          <div>
            <span className="page-kicker">{business.plan} plan · {business.subscriptionStatusLabel}</span>
            <h1>{heading.title}</h1>
            <p>{heading.subtitle}</p>
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
              <div className="avatar avatar--small">BS</div>
              <div>
                <strong>Budi Santoso</strong>
                <span>{business.city}</span>
              </div>
            </div>
          </div>
        </header>
        <main className="app-shell__content">
          <div className="demo-banner">
            <strong>Demo interaktif aktif</strong>
            <p>
              Layout, istilah, dan urutan panel mengikuti business app utama. Data tetap read-only
              agar aman untuk demo dan closing.
            </p>
          </div>
          <div className="demo-sales-card">
            <div>
              <strong>Butuh dibantu closing atau setup cepat?</strong>
              <p>Hubungi sales TeknikOS langsung. Nomor ini sengaja selalu tampil di demo agar client tidak bingung cari akses lanjutan.</p>
            </div>
            <a href={waLink} className="btn btn--primary" target="_blank" rel="noreferrer">
              <MessageCircle size={16} />
              Hubungi Sales 0813-5444-4967
            </a>
          </div>
          <Outlet />
        </main>
        <div className="mobile-nav">
          <NavLink to="/demo-owner-dashboard" end>Home</NavLink>
          <NavLink to="/demo-owner-dashboard/jobs">Jobs</NavLink>
          <NavLink to="/demo-owner-dashboard/customers">CRM</NavLink>
          <NavLink to="/demo-owner-dashboard/settings">Menu</NavLink>
        </div>
      </div>
    </div>
  );
}

export function DemoDashboardPage() {
  return (
    <div className="page-stack">
      <div className="stats-grid">
        {dashboardStats.map((item) => (
          <StatCard key={item.label} label={item.label} value={item.value} hint={item.hint} tone={item.tone} />
        ))}
      </div>

      <div className="dashboard-grid dashboard-grid--balanced">
        <SectionCard title="Operations Cockpit" description="Panel pertama di dashboard live: dispatch, billing, dan CRM follow up dibaca dari satu layar.">
          <div className="ops-grid">
            {queueCards.map((card) => (
              <article key={card.title} className={`ops-queue-card ops-queue-card--${card.tone}`}>
                <div className="ops-queue-card__count">{card.value}</div>
                <strong>{card.title}</strong>
                <p>{card.text}</p>
                <span>Demo read-only</span>
              </article>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Dispatch Hari Ini" description="Ringkas, cepat dibaca, dan fokus ke siapa berangkat ke mana seperti dashboard live.">
          <div className="dispatch-list">
            {jobs.slice(0, 3).map((job) => (
              <Link key={job.id} to={`/demo-owner-dashboard/jobs/${job.id}`} className="dispatch-item">
                <div className="dispatch-item__time">
                  <strong>{job.schedule.split("·")[1]?.trim() ?? job.schedule}</strong>
                  <span>{job.number}</span>
                </div>
                <div className="dispatch-item__body">
                  <strong>{job.title}</strong>
                  <p>{job.customer} · {job.location}</p>
                  <small>{job.technician}</small>
                  <div className="dispatch-item__tags">
                    <span>{job.type}</span>
                    <span>{job.price}</span>
                    <span>{job.priority ?? "Normal"}</span>
                  </div>
                </div>
                <div className="dispatch-item__status">
                  <Badge tone={job.priority === "Urgent" ? "danger" : job.status === "done" ? "success" : job.status === "pending" ? "warning" : "info"}>
                    {job.priority === "Urgent" ? `Urgent · ${job.status.replaceAll("_", " ")}` : job.status.replaceAll("_", " ")}
                  </Badge>
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="dashboard-grid dashboard-grid--balanced">
        <SectionCard title="Kalender Jadwal & Deadline" description="Preview tampilan kalender kerja yang sekarang ada di app utama.">
          <div className="demo-feature-list">
            {calendarCards.map((item) => (
              <div key={item.day} className="demo-feature-list__item">
                <span className="demo-feature-list__dot" />
                <strong>{item.day} · {item.jobs}</strong>
                <p>{item.deadline}</p>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Deadline Mendekat" description="Daftar deadline yang perlu langsung dibaca owner atau admin.">
          <div className="stack-list">
            {deadlineCards.map((item) => (
              <div key={item.title} className="stack-list__item">
                <strong>{item.title}</strong>
                <p>{item.meta}</p>
                <Badge tone={item.tone}>{item.tone === "danger" ? "Perlu aksi" : item.tone === "warning" ? "Mendekat" : "Terjadwal"}</Badge>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="dashboard-grid dashboard-grid--balanced">
        <SectionCard title="Revenue 7 Hari" description="Preview ritme pendapatan mingguan.">
          <MiniBarChart items={revenueBars.map((item) => ({ ...item, valueLabel: `Rp${item.value}00rb` }))} />
        </SectionCard>

        <SectionCard title="Status Job" description="Distribusi kerja aktif di demo.">
          <DonutSummary items={statusBreakdown} />
        </SectionCard>

        <SectionCard title="Fitur Inti" description="Semua modul utama yang bisa dijelajahi dari demo ini.">
          <div className="demo-feature-list">
            {[
              "Dashboard owner dan queue operasional",
              "Kalender jadwal dan deadline job",
              "Job list, kanban, dan detail pekerjaan",
              "CRM pelanggan dan histori unit",
              "Invoice dan status pembayaran",
              "Inventori sparepart, kontrak servis, dan setup WAHA",
            ].map((item) => (
              <div key={item} className="demo-feature-list__item">
                <span className="demo-feature-list__dot" />
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="dashboard-grid dashboard-grid--balanced">
        <SectionCard title="Setup WAHA" description="Di aplikasi utama, pengaturan WAHA sekarang dibikin bertahap dan lebih mudah diikuti client.">
          <div className="demo-feature-list">
            {wahaSteps.map((item) => (
              <div key={item} className="demo-feature-list__item">
                <span className="demo-feature-list__dot" />
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Action Panel yang Sekarang Ada" description="Demo ini sekarang juga mewakili panel terbaru di halaman detail job dan pengaturan.">
          <div className="demo-feature-list">
            {[
              "Set deadline tugas langsung dari detail job",
              "Upload before-after photo untuk bukti kerja",
              "Lihat rules WhatsApp dan halaman connect WAHA terpisah",
            ].map((item) => (
              <div key={item} className="demo-feature-list__item">
                <span className="demo-feature-list__dot" />
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <div className="dashboard-grid dashboard-grid--balanced">
        <SectionCard title="Kirim Otomatis via WAHA" description="Panel ini dipakai untuk testing kirim notifikasi otomatis ke pelanggan atau teknisi setelah nomor bisnis terhubung.">
          <div className="summary-list">
            {autoSendPreview.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
          <div className="button-row button-row--left">
            <button className="btn btn--secondary" disabled>Kirim ke Pelanggan</button>
            <button className="btn btn--secondary" disabled>Kirim ke Teknisi</button>
          </div>
        </SectionCard>

        <SectionCard title="Quick Billing" description="Di dashboard live owner bisa langsung pilih job, isi total, lalu kirim invoice dari panel cepat.">
          <div className="summary-list">
            {quickBillingPreview.map((item) => (
              <div key={item.label}>
                <span>{item.label}</span>
                <strong>{item.value}</strong>
              </div>
            ))}
          </div>
          <div className="button-row button-row--left">
            <button className="btn btn--secondary" disabled>Buat Invoice Cepat</button>
          </div>
        </SectionCard>
      </div>
    </div>
  );
}

export function DemoJobsPage() {
  const [view, setView] = useState<"list" | "kanban">("list");
  const [search, setSearch] = useState("");

  const filteredJobs = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return jobs;
    return jobs.filter((job) =>
      `${job.number} ${job.title} ${job.customer} ${job.technician} ${job.location}`.toLowerCase().includes(q),
    );
  }, [search]);

  const statusBuckets = [
    { key: "pending", title: "Menunggu" },
    { key: "assigned", title: "Ditugaskan" },
    { key: "on_the_way", title: "Perjalanan" },
    { key: "in_progress", title: "Dikerjakan" },
    { key: "done", title: "Selesai" },
  ];

  return (
    <div className="page-stack">
      <div className="toolbar">
        <div className="segmented">
          <button className={view === "list" ? "segmented__active" : ""} onClick={() => setView("list")}>List</button>
          <button className={view === "kanban" ? "segmented__active" : ""} onClick={() => setView("kanban")}>Kanban</button>
        </div>
        <input className="toolbar__search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari job, pelanggan, atau teknisi" />
        <div className="toolbar__actions">
          <button className="btn btn--secondary" disabled>Read-only demo</button>
        </div>
      </div>

      {view === "list" ? (
        <SectionCard title="List Job Demo" description={`${filteredJobs.length} job tampil.`}>
          <div className="table-card">
            <div className="data-table data-table--head data-table--jobs">
              <span>#</span>
              <span>Job</span>
              <span>Pelanggan</span>
              <span>Teknisi</span>
              <span>Jenis</span>
              <span>Jadwal</span>
              <span>Status</span>
              <span className="align-right">Harga</span>
            </div>
            {filteredJobs.map((job) => (
              <div key={job.id} className="data-table data-table--jobs">
                <span className="mono">{job.number.replace("JOB-", "")}</span>
                <span>
                  <Link to={`/demo-owner-dashboard/jobs/${job.id}`}><strong>{job.title}</strong></Link>
                  <small>{job.location}</small>
                </span>
                <span>{job.customer}</span>
                <span>{job.technician}</span>
                <span>{job.type}</span>
                <span>{job.schedule.split("·")[1]?.trim() ?? job.schedule}</span>
                <span>
                  <Badge tone={job.status === "pending" ? "warning" : job.status === "done" ? "success" : "info"}>
                    {job.status.replaceAll("_", " ")}
                  </Badge>
                </span>
                <span className="align-right">{job.price}</span>
              </div>
            ))}
          </div>
        </SectionCard>
      ) : (
        <div className="kanban-grid">
          {statusBuckets.map((bucket) => {
            const bucketJobs = filteredJobs.filter((job) => job.status === bucket.key);
            return (
              <SectionCard key={bucket.key} title={bucket.title} action={<Badge tone="info">{bucketJobs.length}</Badge>}>
                <div className="kanban-stack">
                  {bucketJobs.map((job) => (
                    <Link key={job.id} to={`/demo-owner-dashboard/jobs/${job.id}`} className="kanban-card">
                      <strong>{job.title}</strong>
                      <p>{job.customer}</p>
                      <div className="kanban-card__meta">
                        <span>{job.technician}</span>
                        <span>{job.price}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </SectionCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function DemoJobDetailPage() {
  const { id } = useParams();
  const job = jobs.find((item) => item.id === id) ?? jobs[0];
  const relatedCustomer = customers.find((item) => item.id === job.customerId);
  const relatedInvoice = invoices.find((item) => item.job === job.number);

  return (
    <div className="page-stack">
      <div className="detail-grid">
        <div className="detail-grid__main">
          <SectionCard title={`${job.number} · ${job.title}`} description={job.description}>
            <div className="detail-pair">
              <span>{job.customer}</span>
              <span>{job.location}</span>
            </div>
            <div className="summary-list">
              <div><span>Teknisi</span><strong>{job.technician}</strong></div>
              <div><span>Jadwal</span><strong>{job.schedule}</strong></div>
              <div><span>Deadline</span><strong>Hari yang sama · 17:00</strong></div>
              <div><span>Status</span><strong>{job.status.replaceAll("_", " ")}</strong></div>
              <div><span>Harga</span><strong>{job.price}</strong></div>
            </div>
          </SectionCard>

          <SectionCard title="Action Panel Demo" description="Tampilan aksi utama tetap bisa dipreview, namun tidak menyimpan perubahan.">
            <div className="field-grid">
              <label className="field">
                <span>Status job</span>
                <select defaultValue={job.status} disabled>
                  <option>pending</option>
                  <option>assigned</option>
                  <option>on_the_way</option>
                  <option>in_progress</option>
                  <option>done</option>
                </select>
              </label>
              <label className="field">
                <span>Teknisi</span>
                <input value={job.technician} readOnly />
              </label>
              <label className="field">
                <span>Deadline tugas</span>
                <input value="2026-03-24T17:00" readOnly />
              </label>
            </div>
            <div className="button-row button-row--left">
              <button className="btn btn--secondary" disabled>Update Status</button>
              <button className="btn btn--secondary" disabled>Buat Invoice</button>
            </div>
          </SectionCard>

          <SectionCard title="Panel Operasional Baru" description="Preview area yang sekarang ada di halaman detail job aplikasi utama.">
            <div className="demo-feature-list">
              {[
                "Before / after photo untuk bukti kerja",
                "Item service dan sparepart yang terpakai",
                "Panel WhatsApp otomatis WAHA saat nomor bisnis sudah terhubung",
              ].map((item) => (
                <div key={item} className="demo-feature-list__item">
                  <span className="demo-feature-list__dot" />
                  <strong>{item}</strong>
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard title="WhatsApp Manual" description="Preview pengiriman progress, invoice, dan reminder teknisi dari detail job.">
            <div className="summary-list">
              <div><span>Client</span><strong>{relatedCustomer?.name ?? job.customer}</strong></div>
              <div><span>Nomor</span><strong>{relatedCustomer?.phone ?? "-"}</strong></div>
              <div><span>Teknisi</span><strong>{job.technician}</strong></div>
            </div>
            <div className="button-row button-row--left">
              <button className="btn btn--secondary" disabled>Kirim Progress ke Client</button>
              <button className="btn btn--secondary" disabled>Kirim Invoice ke Client</button>
              <button className="btn btn--secondary" disabled>Kirim Tugas via WA</button>
            </div>
          </SectionCard>

          <SectionCard title="WhatsApp Otomatis WAHA" description="Di app utama, panel ini dipakai untuk testing kirim pesan otomatis setelah koneksi WAHA aktif.">
            <div className="summary-list">
              <div><span>Status WAHA</span><strong>Terhubung</strong></div>
              <div><span>Pelanggan</span><strong>{relatedCustomer?.name ?? job.customer}</strong></div>
              <div><span>Invoice</span><strong>{relatedInvoice?.number ?? "Belum ada"}</strong></div>
            </div>
            <div className="button-row button-row--left">
              <button className="btn btn--secondary" disabled>Kirim Progress Otomatis</button>
              <button className="btn btn--secondary" disabled>Kirim Invoice Otomatis</button>
              <button className="btn btn--secondary" disabled>Kirim Tugas Otomatis</button>
            </div>
          </SectionCard>
        </div>

        <div className="detail-grid__side">
          <SectionCard title="Ringkasan Job Live-style">
            <div className="summary-list">
              <div><span>Prioritas</span><strong>{job.priority ?? "Normal"}</strong></div>
              <div><span>Jenis pekerjaan</span><strong>{job.type}</strong></div>
              <div><span>Status invoice</span><strong>{relatedInvoice?.status ?? "Belum ada"}</strong></div>
            </div>
          </SectionCard>
          <SectionCard title="Pelanggan">
            <div className="stack-list">
              <div className="stack-list__item">
                <strong>{relatedCustomer?.name ?? job.customer}</strong>
                <p>{relatedCustomer?.address ?? job.location}</p>
              </div>
            </div>
          </SectionCard>
          <SectionCard title="Invoice">
            {relatedInvoice ? (
              <div className="callout callout--success">
                <div>
                  <strong>{relatedInvoice.number}</strong>
                  <p>{relatedInvoice.total} · {relatedInvoice.status}</p>
                </div>
              </div>
            ) : (
              <div className="callout">
                <div>
                  <strong>Belum ada invoice</strong>
                  <p>Di demo ini kamu bisa lihat alur job dan billing tanpa membuat data baru.</p>
                </div>
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </div>
  );
}

export function DemoCustomersPage() {
  const [search, setSearch] = useState("");
  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((customer) =>
      `${customer.name} ${customer.phone} ${customer.address}`.toLowerCase().includes(q),
    );
  }, [search]);

  return (
    <div className="page-stack">
      <div className="toolbar">
        <input className="toolbar__search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari nama, WA, atau alamat" />
      </div>
      <SectionCard title="Database Pelanggan Demo" description="Versi demo ini sekarang juga menunjukkan area tempat aksi WAHA otomatis muncul di app utama.">
        <div className="customer-list">
          {filteredCustomers.map((customer) => (
            <article key={customer.id} className="customer-card">
              <div className="customer-card__head">
                <div>
                  <strong>{customer.name}</strong>
                  <p>{customer.address}</p>
                </div>
                <Badge tone={customer.contract === "Tidak ada" ? "neutral" : "success"}>{customer.contract}</Badge>
              </div>
              <div className="customer-card__meta">
                <span>WA {customer.phone}</span>
                <span>{customer.email}</span>
                <span>{customer.totalJobs} job</span>
                <span>Servis terakhir {customer.lastService}</span>
              </div>
              <div className="customer-card__units">
                {customer.units.map((unit) => <span key={unit}>{unit}</span>)}
              </div>
              <div className="customer-card__actions">
                <button className="btn btn--secondary" disabled>Chat WA</button>
                <button className="btn btn--secondary" disabled>Kirim WAHA</button>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export function DemoTechniciansPage() {
  return (
    <div className="page-stack">
      <SectionCard title="Daftar Teknisi Demo" description="Struktur halaman mengikuti modul teknisi di business app utama.">
        <div className="customer-list">
          {technicians.map((technician) => (
            <article key={technician.id} className="customer-card">
              <div className="customer-card__head">
                <div>
                  <strong>{technician.name}</strong>
                  <p>{technician.phone}</p>
                </div>
                <Badge tone={technician.status === "Aktif" ? "success" : technician.status === "Bertugas" ? "info" : "warning"}>
                  {technician.status}
                </Badge>
              </div>
              <div className="customer-card__meta">
                <span>Rating {technician.rating}</span>
                <span>{technician.jobsCompleted} job selesai</span>
              </div>
              <div className="customer-card__units">
                {technician.specialties.map((item) => <span key={item}>{item}</span>)}
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export function DemoInvoicesPage() {
  const [status, setStatus] = useState("");
  const filteredInvoices = status ? invoices.filter((invoice) => invoice.status === status) : invoices;

  return (
    <div className="page-stack">
      <div className="toolbar">
        <select className="field-like" value={status} onChange={(event) => setStatus(event.target.value)}>
          <option value="">Status: semua</option>
          <option value="Draft">Draft</option>
          <option value="Sent">Sent</option>
          <option value="Paid">Paid</option>
          <option value="Overdue">Overdue</option>
        </select>
      </div>
      <SectionCard title="Daftar Invoice Demo" description="Aksi WA manual dan WAHA otomatis ikut dipreview di tabel ini seperti di aplikasi utama.">
        <div className="table-card">
          <div className="data-table data-table--head">
            <span>Invoice#</span>
            <span>Pelanggan</span>
            <span>Job</span>
            <span>Total</span>
            <span>Status</span>
            <span>Jatuh Tempo</span>
            <span>Aksi</span>
          </div>
          {filteredInvoices.map((invoice) => (
            <div key={invoice.id} className="data-table">
              <span className="mono">{invoice.number}</span>
              <span>{invoice.customer}</span>
              <span>{invoice.job}</span>
              <span>{invoice.total}</span>
              <span>
                <Badge tone={invoice.status === "Paid" ? "success" : invoice.status === "Overdue" ? "danger" : invoice.status === "Sent" ? "info" : "neutral"}>
                  {invoice.status}
                </Badge>
              </span>
              <span>{invoice.dueDate}</span>
              <span className="row-actions">
                <button className="ghost-button" disabled>Lihat PDF</button>
                <button className="ghost-button" disabled>Kirim WA</button>
                <button className="ghost-button" disabled>Kirim WAHA</button>
              </span>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export function DemoInventoryPage() {
  return (
    <div className="page-stack">
      <SectionCard title="Inventori Demo" description="Preview sparepart yang tersedia dan item yang perlu restock.">
        <div className="customer-list">
          {inventory.map((item) => (
            <article key={item.id} className="inventory-card">
              <div className="inventory-card__head">
                <div>
                  <strong>{item.name}</strong>
                  <p>{item.sku} · {item.category}</p>
                </div>
                <Badge tone={item.status === "Aman" ? "success" : item.status === "Rendah" ? "warning" : "danger"}>{item.status}</Badge>
              </div>
              <div className="inventory-card__meta">
                <span>Stok {item.stock}</span>
                <span>Min {item.minStock}</span>
                <span>Beli {item.buyPrice}</span>
                <span>Jual {item.sellPrice}</span>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export function DemoContractsPage() {
  return (
    <div className="page-stack">
      <SectionCard title="Kontrak Demo" description="Kontrak aktif, hampir jatuh tempo, dan expired tetap bisa direview dari demo.">
        <div className="customer-list">
          {contracts.map((contract) => (
            <article key={contract.id} className="contract-card">
              <div className="contract-card__head">
                <div>
                  <strong>{contract.customer}</strong>
                  <p>{contract.plan}</p>
                </div>
                <Badge tone={contract.status === "Aktif" ? "success" : contract.status === "Hampir Jatuh Tempo" ? "warning" : "danger"}>{contract.status}</Badge>
              </div>
              <div className="contract-card__meta">
                <span>Nilai {contract.value}</span>
                <span>Next {contract.nextService}</span>
              </div>
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}

export function DemoSettingsPage() {
  return (
    <div className="page-stack">
      <SectionCard title="Profil Bisnis" description="Preview struktur pengaturan bisnis yang sama dengan app utama.">
        <div className="summary-list">
          <div><span>Nama bisnis</span><strong>{business.name}</strong></div>
          <div><span>WhatsApp</span><strong>0812 4455 8899</strong></div>
          <div><span>Alamat</span><strong>Jl. Urip Sumoharjo No. 55, Makassar</strong></div>
          <div><span>Paket aktif</span><strong>{business.plan}</strong></div>
        </div>
      </SectionCard>

      <div className="cards-grid cards-grid--two">
        <article className="settings-link-card">
          <span className="eyebrow">WhatsApp Rules</span>
          <strong>Rules Penggunaan WhatsApp</strong>
          <p>Halaman rules dipisah agar client memahami batas aman penggunaan WhatsApp bisnis.</p>
          <Link className="btn btn--secondary" to="/demo-owner-dashboard/settings/whatsapp-rules">Buka Rules WhatsApp</Link>
        </article>

        <article className="settings-link-card">
          <span className="eyebrow">WAHA Connection</span>
          <strong>Hubungkan ke WAHA</strong>
          <p>Langkah connect WAHA, scan QR, dan tes koneksi dibuat terpisah seperti di app live.</p>
          <Link className="btn btn--primary" to="/demo-owner-dashboard/settings/whatsapp-connect">Buka Halaman WAHA</Link>
        </article>
      </div>
    </div>
  );
}

export function DemoWhatsappRulesPage() {
  return (
    <div className="page-stack">
      <SectionCard title="Rules WhatsApp" description="Versi demo yang bisa dibuka client untuk memahami aturan penggunaan WhatsApp di TeknikOS.">
        <div className="rules-grid">
          {whatsappRules.map((rule) => (
            <article key={rule.title} className="rule-card">
              <strong>{rule.title}</strong>
              <p>{rule.description}</p>
            </article>
          ))}
        </div>
        <div className="callout callout--warning">
          <strong>Yang sebaiknya dihindari</strong>
          <ul className="settings-list">
            {whatsappDonts.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
        <div className="demo-sales-inline">
          <strong>Perlu dibantu aktivasi atau konsultasi?</strong>
          <a href={waLink} target="_blank" rel="noreferrer">Chat sales TeknikOS</a>
        </div>
      </SectionCard>
    </div>
  );
}

export function DemoWhatsappConnectPage() {
  return (
    <div className="page-stack">
      <SectionCard title="Menghubungkan ke WAHA" description="Versi demo dari halaman connect WAHA untuk preview alur setup dan testing koneksi.">
        <div className="page-stack">
          <div className="callout callout--success">
            <strong>Mode aktif sekarang: Otomasi WAHA</strong>
            <p>Ini hanya preview demo. Di app live, langkah ini akan memanggil session WAHA bisnis Anda.</p>
          </div>

          <div className="waha-stepper">
            <article className="waha-step-card">
              <div className="waha-step-card__header">
                <div>
                  <span className="eyebrow">Langkah 1</span>
                  <strong>Pilih cara pakai WhatsApp</strong>
                  <p>Di demo ini mode sudah dipilih ke Otomasi WAHA agar client bisa langsung melihat alurnya.</p>
                </div>
                <Badge tone="success">Sudah disimpan</Badge>
              </div>
              <div className="integration-choice-grid">
                <label className="integration-choice">
                  <input type="radio" checked={false} readOnly />
                  <div>
                    <strong>WhatsApp Dasar</strong>
                    <p>Dipakai jika hanya ingin tombol chat dan pesan manual.</p>
                  </div>
                </label>
                <label className="integration-choice integration-choice--active">
                  <input type="radio" checked readOnly />
                  <div>
                    <strong>Otomasi WAHA</strong>
                    <p>Dipakai jika ingin pesan otomatis dari dashboard dan detail job.</p>
                  </div>
                </label>
              </div>
            </article>

            <article className="waha-step-card">
              <div className="waha-step-card__header">
                <div>
                  <span className="eyebrow">Langkah 2</span>
                  <strong>Hubungkan session WAHA</strong>
                  <p>Di demo ini statusnya dibuat siap tersambung agar client paham urutannya.</p>
                </div>
                <Badge tone="warning">Siap disambungkan</Badge>
              </div>
              <div className="summary-list">
                <div><span>Mode di sistem</span><strong>Otomasi WAHA</strong></div>
                <div><span>Nomor bisnis</span><strong>0812 4455 8899</strong></div>
                <div><span>Runtime WAHA</span><strong>WAHA Docker</strong></div>
                <div><span>Status</span><strong>Menunggu QR</strong></div>
              </div>
              <div className="button-row button-row--left">
                <button className="btn btn--primary" disabled>Hubungkan WAHA</button>
                <button className="btn btn--secondary" disabled>Refresh Status</button>
              </div>
            </article>

            <article className="waha-step-card">
              <div className="waha-step-card__header">
                <div>
                  <span className="eyebrow">Langkah 3</span>
                  <strong>Scan QR dan tes koneksi</strong>
                  <p>Client bisa melihat dengan jelas bahwa langkah berikutnya adalah scan QR lalu tes koneksi.</p>
                </div>
                <Badge tone="warning">Menunggu scan QR</Badge>
              </div>
              <div className="qr-panel">
                <div className="photo-box photo-box--success">QR Demo</div>
                <div>
                  <strong>Preview area QR</strong>
                  <p>Di app live, area ini akan menampilkan QR dari session WAHA bisnis Anda. Setelah scan, tombol tes koneksi dipakai untuk verifikasi.</p>
                </div>
              </div>
              <div className="button-row button-row--left">
                <button className="btn btn--secondary" disabled>Tampilkan QR Lagi</button>
                <button className="btn btn--primary" disabled>Tes Koneksi WAHA</button>
              </div>
            </article>
          </div>

          <div className="demo-sales-inline">
            <strong>Perlu bantuan setup WAHA setelah demo?</strong>
            <a href={waLink} target="_blank" rel="noreferrer">Hubungi sales TeknikOS</a>
          </div>
        </div>
      </SectionCard>
    </div>
  );
}

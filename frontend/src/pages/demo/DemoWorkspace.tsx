import { ArrowLeft, MessageCircle } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, NavLink, Outlet, useLocation, useParams, useSearchParams } from "react-router-dom";
import { Badge, DonutSummary, MiniBarChart, SectionCard, StatCard } from "../../components/UI";
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
  { to: "/demo-owner-dashboard", label: "Dashboard" },
  { to: "/demo-owner-dashboard/jobs", label: "Job Order" },
  { to: "/demo-owner-dashboard/customers", label: "Pelanggan" },
  { to: "/demo-owner-dashboard/invoices", label: "Invoice" },
  { to: "/demo-owner-dashboard/inventory", label: "Inventori" },
  { to: "/demo-owner-dashboard/contracts", label: "Kontrak" },
];

const queueCards = [
  { title: "Dispatch", value: "3 job", text: "Belum ada teknisi dan perlu assignment cepat.", tone: "warning" as const },
  { title: "Ready To Bill", value: "5 job", text: "Pekerjaan sudah berjalan dan siap lanjut invoice.", tone: "info" as const },
  { title: "CRM Follow Up", value: "7 akun", text: "Pelanggan dengan kontrak due atau invoice tertunda.", tone: "success" as const },
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

  if (pathname.endsWith("/invoices")) {
    return { title: "Demo Invoice", subtitle: "Review billing, overdue, dan alur invoice read-only." };
  }

  if (pathname.endsWith("/inventory")) {
    return { title: "Demo Inventori", subtitle: "Stok, kategori, dan prioritas restock tetap bisa dipreview." };
  }

  if (pathname.endsWith("/contracts")) {
    return { title: "Demo Kontrak", subtitle: "Kontrak aktif dan jadwal berikutnya bisa dilihat dari demo." };
  }

  return {
    title: "Demo Owner Dashboard",
    subtitle: "Demo interaktif read-only agar calon pengguna tetap bisa menjelajah fitur utama TeknikOS.",
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
          <span>Demo workspace</span>
          <strong>Interactive read-only</strong>
          <small>{business.location}</small>
        </div>
        <nav className="app-nav">
          {demoNav.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === "/demo-owner-dashboard"} className={({ isActive }) => `app-nav__link ${isActive ? "app-nav__link--active" : ""}`}>
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
            Tanya via WA
          </a>
        </div>
      </aside>

      <div className="app-shell__body">
        <header className="app-shell__topbar">
          <div>
            <span className="page-kicker">Demo mode · {demoState}</span>
            <h1>{heading.title}</h1>
            <p>{heading.subtitle}</p>
          </div>
          <div className="topbar-actions">
            <div className="status-pill">
              <span className="status-pill__dot" />
              Tidak mengubah data asli
            </div>
            <Link to="/" className="btn btn--secondary">
              <ArrowLeft size={16} />
              Kembali ke landing
            </Link>
          </div>
        </header>
        <main className="app-shell__content">
          <div className="demo-banner">
            <strong>Demo interaktif aktif</strong>
            <p>
              Kamu bisa pindah halaman, cari data, ganti tab, lihat detail, dan memahami alur fitur.
              Action berat seperti simpan data tetap dikunci agar aman.
            </p>
          </div>
          <Outlet />
        </main>
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

      <div className="dashboard-grid">
        <SectionCard title="Queue Operasional" description="Prioritas yang biasa dicek owner saat memulai hari.">
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

        <SectionCard title="Revenue 7 Hari" description="Preview ritme pendapatan mingguan.">
          <MiniBarChart items={revenueBars.map((item) => ({ ...item, valueLabel: `Rp${item.value}00rb` }))} />
        </SectionCard>
      </div>

      <div className="dashboard-grid">
        <SectionCard title="Status Job" description="Distribusi kerja aktif di demo.">
          <DonutSummary items={statusBreakdown} />
        </SectionCard>

        <SectionCard title="Fitur Inti" description="Semua modul utama yang bisa dijelajahi dari demo ini.">
          <div className="demo-feature-list">
            {[
              "Dashboard owner dan queue operasional",
              "Job list, kanban, dan detail pekerjaan",
              "CRM pelanggan dan histori unit",
              "Invoice dan status pembayaran",
              "Inventori sparepart dan kontrak servis",
            ].map((item) => (
              <div key={item} className="demo-feature-list__item">
                <span className="demo-feature-list__dot" />
                <strong>{item}</strong>
              </div>
            ))}
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Dispatch Hari Ini" description="Klik job untuk melihat detail demo.">
        <div className="dispatch-list">
          {jobs.map((job) => (
            <Link key={job.id} to={`/demo-owner-dashboard/jobs/${job.id}`} className="dispatch-item">
              <div className="dispatch-item__time">
                <strong>{job.schedule.split("·")[1]?.trim() ?? job.schedule}</strong>
                <span>{job.number}</span>
              </div>
              <div className="dispatch-item__body">
                <strong>{job.title}</strong>
                <p>{job.customer} · {job.location}</p>
                <small>{job.technician}</small>
              </div>
              <div className="dispatch-item__status">
                <Badge tone={job.priority === "Urgent" ? "danger" : job.status === "done" ? "success" : job.status === "pending" ? "warning" : "info"}>
                  {job.status.replaceAll("_", " ")}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </SectionCard>
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
            </div>
            <div className="button-row button-row--left">
              <button className="btn btn--secondary" disabled>Update Status</button>
              <button className="btn btn--secondary" disabled>Buat Invoice</button>
            </div>
          </SectionCard>
        </div>

        <div className="detail-grid__side">
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
      <SectionCard title="Database Pelanggan Demo">
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
      <SectionCard title="Daftar Invoice Demo">
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

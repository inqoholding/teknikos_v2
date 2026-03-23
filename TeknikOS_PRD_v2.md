# TeknikOS — Product Requirements Document
**Version:** 2.0 · **Status:** Active Development · **Tanggal:** Maret 2026

---

## Daftar Isi
1. [Overview & Visi](#1-overview--visi)
2. [Target Pengguna & Persona](#2-target-pengguna--persona)
3. [Arsitektur Sistem](#3-arsitektur-sistem)
4. [Design System](#4-design-system)
5. [Frontend — Spesifikasi Halaman](#5-frontend--spesifikasi-halaman)
6. [Backend — API Specification](#6-backend--api-specification)
7. [Database Schema](#7-database-schema)
8. [Autentikasi — BetterAuth](#8-autentikasi--betterauth)
9. [Fitur Produk Lengkap](#9-fitur-produk-lengkap)
10. [Roadmap & MVP](#10-roadmap--mvp)
11. [Metrik Keberhasilan](#11-metrik-keberhasilan)
12. [Risiko & Mitigasi](#12-risiko--mitigasi)
13. [Vibe Coding Guide — Paper MCP + Codex](#13-vibe-coding-guide--paper-mcp--codex)

---

## 1. Overview & Visi

### 1.1 Visi Produk
Menjadi sistem operasi digital untuk setiap bisnis jasa teknik di Indonesia — dari bengkel AC rumahan hingga kontraktor multi-cabang — sehingga mereka bisa fokus pada pekerjaan, bukan administrasi.

### 1.2 Misi
Menggantikan WhatsApp group, buku tulis, dan spreadsheet sebagai alat operasional utama bisnis jasa teknik (AC, plumber, listrik) dengan platform SaaS yang mobile-first, terjangkau, dan semudah WhatsApp.

### 1.3 Problem Statement
Lebih dari 800.000 usaha jasa teknik aktif di Indonesia masih mengandalkan cara manual:

| Problem | Dampak Bisnis |
|---------|--------------|
| Koordinasi job via WhatsApp group | Double booking, job terlewat, teknisi bingung |
| Invoice ditulis tangan | Susah ditagih, tidak ada rekap, tidak profesional |
| Tidak ada sistem kontrak servis rutin | Kehilangan Rp 2–3 jt/bulan per bengkel |
| Owner tidak bisa pantau teknisi | Tidak tahu produktivitas, tidak bisa scale |
| Stok sparepart tidak tercatat | Kehabisan saat job, delay pelanggan |
| Tidak ada data historis pelanggan | Tidak bisa upsell, tidak ada reminder servis |

### 1.4 Solusi
TeknikOS adalah platform SaaS **field service management** dengan dua interface:
- **Dashboard Owner** (web PWA) — kelola bisnis dari kantor atau rumah
- **App Teknisi** (Android, fase 2) — terima job, navigasi, catat servis, terima bayar di lapangan

### 1.5 Competitive Positioning

| | Seekmi/Sejasa | HashMicro | TeknikOS |
|---|---|---|---|
| Model | Marketplace (B2C) | ERP Enterprise | SaaS Field Service (B2B) |
| Target | End consumer | Perusahaan besar | Pemilik bengkel kecil-menengah |
| Harga | Komisi per job | Jutaan/bulan | Rp 0–499K/bulan |
| Setup | N/A | Berminggu-minggu | < 10 menit |
| GPS Dispatch | Tidak ada | Tidak ada | **Ada** |
| Kontrak Rutin | Tidak ada | Ada (rumit) | **Ada (simpel)** |
| Bahasa | Indonesia | Indonesia | **Indonesia + UI lokal** |

---

## 2. Target Pengguna & Persona

### Persona 1 — Budi (Plan Pro) ⭐ Primary
- **Profil:** Pemilik bengkel AC, 38 tahun, 4 teknisi, 80–120 job/bulan
- **Pain utama:** Double booking, invoice manual, kontrak servis tidak diingat
- **Goal:** Operasional rapi, pendapatan dari kontrak rutin meningkat
- **Tech literacy:** Menengah, familiar WhatsApp & GoPay
- **Willingness to pay:** Rp 150–250K/bulan jika terbukti hemat waktu

### Persona 2 — Rizky (Plan Bisnis)
- **Profil:** Kontraktor multi-cabang, 44 tahun, 3 kota, 15 teknisi
- **Pain utama:** Tidak bisa pantau semua cabang, tidak ada laporan konsolidasi
- **Goal:** Visibility penuh, efisiensi operasional, laporan per cabang
- **Tech literacy:** Tinggi, sudah pakai beberapa software
- **Willingness to pay:** Rp 400–600K/bulan

### Persona 3 — Sinta (Starter → Pro)
- **Profil:** Solo teknisi yang mulai scale, 29 tahun, 20–30 job/bulan
- **Pain utama:** Terlihat tidak profesional, susah atur jadwal sendiri
- **Goal:** Tampil profesional, dapat pelanggan repeat lebih banyak
- **Tech literacy:** Tinggi, aktif TikTok dan Instagram
- **Willingness to pay:** Mulai gratis, upgrade ke Pro jika omzet meningkat

---

## 3. Arsitektur Sistem

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                         │
│                                                         │
│  ┌──────────────────────┐  ┌────────────────────────┐  │
│  │  Owner Dashboard     │  │  Technician App        │  │
│  │  Vite + React + TS   │  │  React Native Android  │  │
│  │  TailwindCSS v4      │  │  (Phase 2)             │  │
│  │  TanStack Query v5   │  │                        │  │
│  │  Zustand + Axios     │  │                        │  │
│  └──────────┬───────────┘  └───────────┬────────────┘  │
└─────────────┼─────────────────────────┼───────────────┘
              │ HTTP/REST + WebSocket    │
┌─────────────▼─────────────────────────▼───────────────┐
│                    API LAYER                            │
│                                                        │
│  Express.js + BetterAuth + DrizzleORM                  │
│  Port: 3001                                            │
│                                                        │
│  /api/auth/*        BetterAuth (email+password)        │
│  /api/business/*    Business CRUD                      │
│  /api/jobs/*        Job Order management               │
│  /api/technicians/* Technician management              │
│  /api/customers/*   Customer CRM                       │
│  /api/invoices/*    Invoice management                 │
│  /api/inventory/*   Stock management                   │
│  /api/dashboard/*   Stats & analytics                  │
└────────────────────────┬───────────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────┐
│                   DATA LAYER                            │
│                                                        │
│  SQLite (better-sqlite3) via DrizzleORM                │
│  File: ./teknikos.db                                   │
│                                                        │
│  Tables: user, session, account, verification          │
│           businesses, technicians, customers           │
│           jobs, job_items, invoices                    │
│           contracts, inventory                         │
└────────────────────────────────────────────────────────┘
                         │
┌────────────────────────▼───────────────────────────────┐
│                EXTERNAL SERVICES                        │
│                                                        │
│  Google Maps API   — GPS tracking & navigation         │
│  Xendit/Midtrans   — QRIS & payment processing         │
│  Fonnte/WablasSend — WhatsApp notifications            │
│  Claude API        — AI pricing suggestions            │
└────────────────────────────────────────────────────────┘
```

### 3.1 Tech Stack Detail

#### Frontend
| Layer | Library | Version | Alasan |
|-------|---------|---------|--------|
| Build Tool | Vite | ^6.x | Fast HMR, ESM native |
| UI Framework | React | ^19.x | Ekosistem terluas |
| Language | TypeScript | ^5.x | Type safety, DX baik |
| Styling | TailwindCSS | v4 | Utility-first, dark mode |
| Routing | React Router | v7 | File-based routing |
| Data Fetching | TanStack Query | v5 | Cache, background refetch |
| State | Zustand | ^5.x | Simple, no boilerplate |
| HTTP | Axios | ^1.x | Interceptors, instances |
| Auth Client | better-auth | ^1.x | Match backend auth |
| Icons | lucide-react | latest | Consistent icon set |
| Charts | Recharts | ^2.x | React-native charts |
| Dates | date-fns | ^4.x | Lightweight, tree-shakeable |

#### Backend
| Layer | Library | Version | Alasan |
|-------|---------|---------|--------|
| Runtime | Node.js | v22.x | LTS, native fetch |
| Framework | Express | ^4.x | Mature, minimal, familiar |
| Auth | BetterAuth | ^1.2.x | Modern, session+cookie |
| ORM | DrizzleORM | ^0.41.x | TypeScript-first, fast |
| Database | better-sqlite3 | ^11.x | Embedded, zero-config |
| Validation | Zod | ^3.x | Schema validation |
| Security | Helmet + CORS | latest | HTTP security headers |

---

## 4. Design System

### 4.1 Color Palette

```css
/* Primary — Green (TeknikOS brand) */
--green-light:   #E1F5EE;   /* bg tints, badges */
--green-mid:     #5DCAA5;   /* hover states */
--green-default: #1D9E75;   /* primary buttons, active nav */
--green-dark:    #0F6E56;   /* hover on primary, text on light */

/* Secondary — Amber (warnings, urgent) */
--amber-light:   #FAEEDA;   /* bg tint */
--amber-default: #EF9F27;   /* badges, alerts */

/* Neutral */
--bg:      #F7F6F2;   /* page background */
--surface: #FFFFFF;   /* cards, panels */
--border:  rgba(0,0,0,0.08);

/* Text */
--text-default: #1A1A18;   /* headings, primary text */
--text-muted:   #5A5A56;   /* body, secondary */
--text-hint:    #9A9A94;   /* placeholders, captions */

/* Status */
--status-pending:     #FAEEDA / #633806   /* amber */
--status-assigned:    #E6F1FB / #0C447C   /* blue */
--status-in-progress: #E6F1FB / #185FA5   /* blue darker */
--status-done:        #E1F5EE / #085041   /* green */
--status-paid:        #F1EFE8 / #444441   /* gray */
--status-cancelled:   #FCEBEB / #791F1F   /* red */
```

### 4.2 Typography
```
Font Family: "Plus Jakarta Sans" (Google Fonts)
  - Display: 800 weight, -2px letter-spacing
  - Heading: 700 weight, -1px letter-spacing
  - Body: 400 weight, 1.6 line-height
  - Label: 500 weight, 0.07em letter-spacing (uppercase)
  - Code/Mono: "JetBrains Mono" (version numbers, job IDs)

Scale:
  xs:   12px  — captions, badges
  sm:   13px  — table cells, secondary text
  base: 14px  — body text, form labels
  md:   16px  — default body
  lg:   18px  — card titles
  xl:   22px  — metric values
  2xl:  28px  — page headings
  3xl:  36px  — hero numbers
```

### 4.3 Spacing & Radius
```
Spacing: 4px base unit
  xs: 4px   sm: 8px   md: 12px   lg: 16px
  xl: 24px  2xl: 32px  3xl: 48px

Border Radius:
  sm:  8px   — buttons, inputs, badges
  md:  12px  — cards, panels
  lg:  16px  — modals, large cards
  xl:  24px  — hero sections
  full: 9999px — pills, avatars
```

### 4.4 Component Specifications

#### Button
```
Primary:   bg-green text-white h-10 px-4 rounded-xl font-semibold
           hover: bg-green-dark
Secondary: bg-white text-text border border-border h-10 px-4 rounded-xl
           hover: border-gray-300
Danger:    bg-red-50 text-red-700 border border-red-200 h-10 px-4 rounded-xl
Ghost:     bg-transparent text-text-muted h-10 px-3 rounded-xl hover:bg-gray-100
Size SM:   h-8 px-3 text-sm
```

#### Input / Form Field
```
Height: 44px
Border: 1px solid var(--border)
Radius: 12px
Padding: 0 14px
Focus: ring-2 ring-green-500/20 border-green-500
Error: border-red-400 bg-red-50
Label: text-sm font-medium text-text-muted mb-1.5
```

#### Card
```
Background: white
Border: 1px solid var(--border)
Radius: 16px
Padding: 20px 24px
Shadow: none (flat design)
Hover (clickable): border-color transition, translateY(-2px)
```

#### Badge / Status
```
Padding: 2px 10px
Radius: 99px
Font: 11px font-semibold
Colors: match status color system above
```

#### Sidebar Navigation
```
Width: 224px (w-56)
Background: white
Border: 1px solid var(--border) right only
Item height: 40px
Item radius: 12px (with 8px horizontal margin)
Active: bg-green-light text-green-dark font-semibold
Inactive: text-text-muted hover:bg-gray-50
Icon size: 18px
```

---

## 5. Frontend — Spesifikasi Halaman

### 5.1 Route Structure
```
/login                    → LoginPage
/register                 → RegisterPage
/onboarding               → SetupBusinessPage (protected, no businessId)
/dashboard                → DashboardPage (protected)
/jobs                     → JobsPage (protected)
/jobs/:id                 → JobDetailPage (protected)
/technicians              → TechniciansPage (protected)
/customers                → CustomersPage (protected)
/customers/:id            → CustomerDetailPage (protected)
/invoices                 → InvoicesPage (protected)
/inventory                → InventoryPage (protected)
/contracts                → ContractsPage (protected)
/settings                 → SettingsPage (protected)
```

### 5.2 Auth Guard Logic
```typescript
// Route protection middleware
const ProtectedRoute = () => {
  const { user, loading } = useAuthStore()
  if (loading) return <FullPageSpinner />
  if (!user) return <Navigate to="/login" />
  if (!user.businessId) return <Navigate to="/onboarding" />
  return <Outlet />
}

const GuestRoute = () => {
  const { user } = useAuthStore()
  if (user?.businessId) return <Navigate to="/dashboard" />
  return <Outlet />
}
```

### 5.3 LoginPage
**Path:** `/login`  
**Layout:** AuthLayout (centered card, max-w-md)

**Elements:**
- Logo + "TeknikOS" wordmark (top center)
- Tagline: "Sistem operasi bisnis jasa teknik kamu"
- Form:
  - Email input (type="email", autocomplete="email")
  - Password input (type="password", toggle visibility button)
  - "Ingat saya" checkbox (left) + "Lupa password?" link (right)
  - Submit button: "Masuk" (full width, loading state)
- Divider
- "Belum punya akun? Daftar sekarang" link → /register

**API:** `POST /api/auth/sign-in/email` via authClient
**On success:** fetch /api/business/me → redirect /dashboard or /onboarding
**On error:** show inline error message below form

### 5.4 RegisterPage
**Path:** `/register`  
**Layout:** AuthLayout

**Elements:**
- Form:
  - Nama lengkap (required)
  - Email (required)
  - Nomor WhatsApp (optional, placeholder: 0812xxxx)
  - Password (min 8 chars, strength indicator)
  - Konfirmasi password
  - Submit: "Buat Akun" (full width)
- "Sudah punya akun? Masuk" link → /login

**API:** `POST /api/auth/sign-up/email`
**On success:** redirect /onboarding

### 5.5 SetupBusinessPage
**Path:** `/onboarding`  
**Layout:** Centered, max-w-lg, step wizard

**Step 1 — Info Bisnis:**
- Progress: "Langkah 1 dari 2" indicator (dot/line style)
- Input: Nama bisnis (required)
- Input: Nomor WA bisnis
- Input: Alamat lengkap (textarea)
- Service type cards (checkbox multi-select, 2-col grid):
  - AC (icon: Thermometer)
  - Plumber (icon: Droplets)
  - Listrik (icon: Zap)
  - Lainnya (icon: Wrench)
- Button: "Lanjutkan →"

**Step 2 — Konfirmasi:**
- Summary card: nama, WA, alamat, jenis layanan
- Button: "Buat Bisnis Saya" → `POST /api/business/setup`
- Back button
- On success: save businessId to Zustand, redirect /dashboard

### 5.6 AppLayout
**Components:**

**Sidebar (fixed left, w-56):**
```
[Logo] TeknikOS
[Business name — truncated]
───────────────────────
[LayoutDashboard] Dashboard
[ClipboardList]   Job Order
[Users]           Teknisi
[UserCircle]      Pelanggan
[FileText]        Invoice
[Package]         Inventori
[FileCheck]       Kontrak
───────────────────────
[Settings]        Pengaturan
───────────────────────
[Avatar] Nama Owner
[LogOut] Keluar
```

**Topbar (fixed top, h-16, ml-56):**
- Page title (dynamic, from route config)
- Right: [Bell icon notification] [Avatar + name dropdown]

**Main content:** `ml-56 mt-16 p-6 bg-bg min-h-screen`

### 5.7 DashboardPage
**Path:** `/dashboard`
**Data source:** `GET /api/dashboard/stats`

**Layout (top → bottom):**

**1. Metric Cards Row (grid-cols-4, gap-3):**
| Card | Value | Icon | Color accent |
|------|-------|------|-------------|
| Job Hari Ini | todayJobs | ClipboardList | green |
| Job Aktif | activeJobs | Clock | amber if >5 |
| Teknisi Aktif | activeTechnicians | Users | green |
| Revenue Bulan Ini | monthlyRevenue (Rp format) | TrendingUp | green |

Each card: `bg-surface rounded-2xl p-5 border border-border`

**2. Chart Row (grid-cols-3):**
- Revenue 7 hari (BarChart, col-span-2): X=hari, Y=Rp, bar fill=green
- Status Job (PieChart, col-span-1): pending=amber, active=blue, done=green, paid=gray

**3. Recent Jobs Table:**
Columns: `#Job | Pelanggan | Teknisi | Jenis | Status | Jadwal | Harga`
- Status column: `<StatusBadge>` component
- Row click → navigate to /jobs/:id
- "Lihat Semua Job →" link bottom right

**4. Low Stock Warning (conditional):**
- Show amber banner if `lowStockCount > 0`
- Content: "⚠ {n} item stok hampir habis" + "Kelola Inventori →" link

**Loading state:** Skeleton components for all sections

### 5.8 JobsPage
**Path:** `/jobs`
**Data source:** `GET /api/jobs?status=&technicianId=&from=&to=`

**Header:**
- Title: "Job Order"
- Right: [View toggle: List | Kanban] + [+ Buat Job] button

**Filter Bar:**
- Status dropdown (semua / pending / assigned / in_progress / done / paid)
- Teknisi dropdown (populated from /api/technicians)
- Date range picker (from / to)
- Search input (search by customer name or job number)

**List View (default):**

Table columns:
| # | Job | Pelanggan | Teknisi | Jenis | Jadwal | Status | Harga | Aksi |
|---|-----|-----------|---------|-------|--------|--------|-------|------|

- Pagination: 20 per page, prev/next buttons
- Row hover: light bg tint
- Aksi: [Eye icon → detail] [Pencil → edit] [More → dropdown: assign, cancel]

**Kanban View:**

5 columns with horizontal scroll:
```
[Menunggu] [Ditugaskan] [Perjalanan] [Dikerjakan] [Selesai]
  count↑      count↑       count↑       count↑      count↑
 ─────────   ─────────   ──────────   ──────────   ────────
  JobCard     JobCard      JobCard      JobCard     JobCard
  JobCard                              JobCard
```

JobCard: `bg-surface border rounded-xl p-3`
- Job number (mono font, gray)
- Customer name (bold)
- Technician name (muted) + avatar circle
- Scheduled time
- Price (right aligned)
- Drag-to-move between columns (drag-and-drop updates status via PATCH)

**Create Job Modal (triggered by "+ Buat Job"):**
- Form fields:
  - Pilih pelanggan (searchable dropdown + "Tambah Baru" option)
  - Pilih teknisi (dropdown with status indicator)
  - Jenis pekerjaan (AC / Plumber / Listrik / Lainnya)
  - Judul pekerjaan (text)
  - Deskripsi (textarea)
  - Alamat (text + "Sama dengan alamat pelanggan" toggle)
  - Jadwal tanggal & jam (datetime-local)
  - Prioritas (Normal / Urgent)
  - Estimasi harga (number, Rp prefix)
  - Catatan internal (textarea)
- Submit: `POST /api/jobs`
- On success: close modal, refresh job list, show toast

### 5.9 JobDetailPage
**Path:** `/jobs/:id`
**Data source:** `GET /api/jobs/:id`

**Layout — 2 columns:**

**Left Column (2/3):**
- Job header: Job number (large, mono) + status badge + priority badge
- Customer card: nama, phone (click to WA), alamat
- Technician card: nama, foto, skills, status indicator, phone
- Timeline: status history dengan timestamps
- Before/After photo gallery (grid-2)
- Technician notes card
- Job items table (layanan + sparepart + harga)
- Subtotal / tax / total

**Right Column (1/3):**
- Action panel:
  - Status update dropdown + "Update Status" button
  - "Assign Teknisi" button (if unassigned)
  - "Buat Invoice" button (if done)
  - "Cetak / Download PDF" button
- Map preview (static image Google Maps embed, if lat/lng available)
- Timestamps: dibuat, diperbarui, dijadwalkan, selesai

### 5.10 TechniciansPage
**Path:** `/technicians`
**Data source:** `GET /api/technicians`

**Layout:**
- Header: "Teknisi" + "Tambah Teknisi" button
- Stats row: Total | Aktif | Sedang Bertugas | Tidak Aktif
- Grid cards (grid-cols-3):

TechnicianCard:
```
[Avatar circle with initials]
Nama Teknisi
Spesialis: AC, Plumber
Rating: ★ 4.8 · 124 job
Status: [badge]
Phone: 0812xxx
[Edit] [Lihat Job]
```

- Click card → slide-out panel with full profile + job history
- "Tambah Teknisi" modal: nama, WA, keahlian (checkbox), status

### 5.11 CustomersPage
**Path:** `/customers`

- Search bar (search by name, phone, address)
- Table: Nama | WA | Alamat | Total Job | Terakhir Servis | Aksi
- Row click → CustomerDetailPage
- "Tambah Pelanggan" button + modal form

**CustomerDetailPage `/customers/:id`:**
- Customer header card: nama, WA, email, alamat, unit info
- Unit info: list of units (AC brand/capacity, etc)
- Job history table (last 10 jobs)
- Active contracts list
- "Buat Job Baru" shortcut button

### 5.12 InvoicesPage
**Path:** `/invoices`

- Filter: status (draft/sent/paid/overdue)
- Table: Invoice# | Pelanggan | Job | Total | Status | Jatuh Tempo | Aksi
- Status badges: draft=gray, sent=blue, paid=green, overdue=red
- Actions: [Lihat] [Tandai Lunas] [Download PDF]
- "Buat Invoice Manual" button

### 5.13 InventoryPage
**Path:** `/inventory`

- Stats: Total Item | Total Nilai Stok | Stok Rendah count
- Filter: kategori dropdown (freon/sparepart/consumable/tool)
- Table: Nama | SKU | Kategori | Stok | Min Stok | Harga Beli | Harga Jual | Status Stok
- Status Stok: badge green=aman, amber=rendah, red=habis
- "Tambah Item" button + modal
- Row: "Sesuaikan Stok" button → modal with +/- adjustment

### 5.14 API Integration Layer

```typescript
// src/api/client.ts
import axios from "axios"

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001",
  withCredentials: true,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.response.use(
  res => res.data,
  err => {
    if (err.response?.status === 401) {
      window.location.href = "/login"
    }
    return Promise.reject(err.response?.data || err)
  }
)
```

```typescript
// src/api/jobs.ts — TanStack Query hooks
export const useJobs = (filters) =>
  useQuery({ queryKey: ["jobs", filters], queryFn: () => api.get("/api/jobs", { params: filters }) })

export const useJob = (id) =>
  useQuery({ queryKey: ["jobs", id], queryFn: () => api.get(`/api/jobs/${id}`) })

export const useCreateJob = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data) => api.post("/api/jobs", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["jobs"] }),
  })
}

export const useUpdateJobStatus = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, status }) => api.patch(`/api/jobs/${id}`, { status }),
    onSuccess: (_, { id }) => {
      qc.invalidateQueries({ queryKey: ["jobs"] })
      qc.invalidateQueries({ queryKey: ["jobs", id] })
    },
  })
}
```

---

## 6. Backend — API Specification

### 6.1 Base URL
- Development: `http://localhost:3001`
- All endpoints require `Content-Type: application/json`
- Authenticated endpoints require session cookie (set by BetterAuth)

### 6.2 Authentication Endpoints (BetterAuth)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/api/auth/sign-up/email` | Register dengan email + password |
| POST | `/api/auth/sign-in/email` | Login |
| POST | `/api/auth/sign-out` | Logout (clear session) |
| GET | `/api/auth/get-session` | Get current session & user |

**Request — Sign Up:**
```json
{ "name": "Budi Santoso", "email": "budi@example.com", "password": "password123" }
```

**Request — Sign In:**
```json
{ "email": "budi@example.com", "password": "password123" }
```

### 6.3 Business Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/business/setup` | ✅ | Setup bisnis baru setelah register |
| GET | `/api/business/me` | ✅ | Get profil bisnis milik user |
| PATCH | `/api/business/me` | ✅ | Update profil bisnis |

### 6.4 Jobs Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/jobs` | ✅ | List jobs (filter: status, technicianId, from, to) |
| GET | `/api/jobs/:id` | ✅ | Detail job + items |
| POST | `/api/jobs` | ✅ | Buat job baru |
| PATCH | `/api/jobs/:id` | ✅ | Update job (status, assign, dll) |
| DELETE | `/api/jobs/:id` | ✅ | Hapus job |
| POST | `/api/jobs/:id/invoice` | ✅ | Auto-generate invoice dari job |

**Job Status Flow:**
```
pending → assigned → on_the_way → in_progress → done → paid
                                               ↘ cancelled
```

### 6.5 Technicians Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/technicians` | ✅ | List semua teknisi bisnis |
| POST | `/api/technicians` | ✅ | Tambah teknisi |
| PATCH | `/api/technicians/:id` | ✅ | Update teknisi (incl. GPS update) |
| DELETE | `/api/technicians/:id` | ✅ | Hapus teknisi |

### 6.6 Customers Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/customers` | ✅ | List pelanggan |
| GET | `/api/customers/:id` | ✅ | Detail + job history |
| POST | `/api/customers` | ✅ | Tambah pelanggan |
| PATCH | `/api/customers/:id` | ✅ | Update pelanggan |
| DELETE | `/api/customers/:id` | ✅ | Hapus pelanggan |

### 6.7 Inventory Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/inventory` | ✅ | List stok |
| POST | `/api/inventory` | ✅ | Tambah item |
| PATCH | `/api/inventory/:id` | ✅ | Update item |
| PATCH | `/api/inventory/:id/adjust-stock` | ✅ | Tambah/kurangi stok |
| DELETE | `/api/inventory/:id` | ✅ | Hapus item |

### 6.8 Dashboard Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/api/dashboard/stats` | ✅ | Semua metrics utama |
| GET | `/api/dashboard/technicians-live` | ✅ | GPS data teknisi aktif |

**Response — /api/dashboard/stats:**
```json
{
  "data": {
    "todayJobs": 14,
    "activeJobs": 6,
    "doneToday": 8,
    "activeTechnicians": 4,
    "totalCustomers": 128,
    "activeContracts": 23,
    "monthlyRevenue": 18500000,
    "lowStockCount": 2,
    "lowStockItems": [...],
    "recentJobs": [...],
    "business": {...}
  }
}
```

### 6.9 Error Response Format
```json
{
  "error": "Deskripsi error",
  "message": "Pesan human-readable dalam Bahasa Indonesia",
  "details": [...]  // Zod validation errors jika ada
}
```

---

## 7. Database Schema

### Tables Overview
```sql
user              — BetterAuth + custom fields (role, businessId, phone)
session           — BetterAuth sessions
account           — BetterAuth OAuth accounts
verification      — BetterAuth email verification tokens
businesses        — Profil bisnis owner
technicians       — Teknisi per bisnis (dengan GPS coords)
customers         — Database pelanggan + unit info (JSON)
jobs              — Job orders dengan full lifecycle
job_items         — Line items per job (layanan + sparepart)
invoices          — Invoice dengan status & payment tracking
contracts         — Kontrak servis rutin
inventory         — Stok sparepart & material
```

### Key Relationships
```
businesses ──< technicians
businesses ──< customers
businesses ──< jobs
businesses ──< invoices
businesses ──< contracts
businesses ──< inventory
customers  ──< jobs
customers  ──< contracts
customers  ──< invoices
technicians ──< jobs
jobs ──< job_items
jobs ──< invoices
```

### Job Status Lifecycle
```sql
-- Valid status transitions
pending     → assigned, cancelled
assigned    → on_the_way, pending, cancelled
on_the_way  → in_progress
in_progress → done
done        → paid
any         → cancelled (with reason)
```

---

## 8. Autentikasi — BetterAuth

### 8.1 Setup
```javascript
// backend/src/db/index.js
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "sqlite", schema }),
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL,
  trustedOrigins: [process.env.FRONTEND_URL],
  emailAndPassword: { enabled: true, requireEmailVerification: false },
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      role: { type: "string", defaultValue: "owner" },
      businessId: { type: "string", required: false },
      phone: { type: "string", required: false },
    }
  }
})
```

### 8.2 Frontend Auth Client
```typescript
// src/api/auth.ts
import { createAuthClient } from "better-auth/react"

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3001"
})

export const { signIn, signUp, signOut, useSession } = authClient
```

### 8.3 Zustand Auth Store
```typescript
// src/store/authStore.ts
interface AuthStore {
  user: User | null
  loading: boolean
  setUser: (user: User | null) => void
  logout: () => Promise<void>
}
```

---

## 9. Fitur Produk Lengkap

### 9.1 Job Management
- [x] Buat job order dengan assign teknisi
- [x] Status lifecycle: pending → assigned → on_the_way → in_progress → done → paid
- [x] Filter & search job (status, teknisi, tanggal, nama pelanggan)
- [x] Tampilan list (tabel) dan Kanban (drag-and-drop)
- [x] Auto-generate nomor job (JOB-001, JOB-002, ...)
- [x] Detail job dengan before/after photos, catatan teknisi, items
- [x] Auto-generate invoice dari job selesai
- [ ] Notifikasi WA ke teknisi saat job di-assign (Fase 2)
- [ ] GPS live tracking teknisi (Fase 2)
- [ ] Tanda tangan digital pelanggan (Fase 2)

### 9.2 Customer CRM
- [x] Database pelanggan dengan info unit (AC brand, kapasitas, dll)
- [x] Riwayat job per pelanggan
- [x] Tambah/edit/hapus pelanggan
- [ ] WA blast reminder servis otomatis (Fase 2)
- [ ] Segmentasi pelanggan (VIP, tidak aktif > 6 bulan) (Fase 2)

### 9.3 Technician Management
- [x] Profil teknisi dengan keahlian dan status
- [x] Rating teknisi (aggregat dari job selesai)
- [x] Total job counter per teknisi
- [x] GPS koordinat (update via PATCH)
- [ ] GPS live tracking real-time (Fase 2)
- [ ] Absensi digital (Fase 2)
- [ ] App mobile Android (Fase 2)

### 9.4 Invoice & Pembayaran
- [x] Auto-generate invoice dari job
- [x] Invoice manual
- [x] Status: draft → sent → paid (+ overdue)
- [x] Tracking pembayaran (paid_amount, payment_method)
- [ ] QRIS payment integration via Xendit (Fase 2)
- [ ] PDF export invoice (Fase 2)

### 9.5 Inventory / Stok
- [x] Katalog sparepart & material
- [x] Adjust stok (tambah/kurangi dengan reason)
- [x] Alert stok rendah (min_stock threshold)
- [x] Catat harga beli & jual
- [ ] Penggunaan stok otomatis dari job_items (Fase 2)

### 9.6 Kontrak Servis Rutin
- [x] Buat kontrak bulanan/kuartalan/tahunan
- [x] Tracking status aktif/expired
- [x] next_service_at field
- [ ] Auto-reminder WA ke pelanggan (Fase 2)
- [ ] Renewal alert ke owner (Fase 2)

### 9.7 Analytics & Dashboard
- [x] Revenue harian & bulanan
- [x] Job stats (hari ini, aktif, selesai)
- [x] Teknisi aktif count
- [x] Kontrak aktif count
- [x] Low stock alert
- [x] Recent jobs table
- [ ] Revenue chart 7 hari (Fase 1 frontend)
- [ ] Job status donut chart (Fase 1 frontend)
- [ ] Heatmap area pekerjaan (Fase 3)
- [ ] Export laporan PDF/Excel (Fase 3)

---

## 10. Roadmap & MVP

### Phase 1 — MVP (Bulan 1–3)
**Goal:** 50 beta user, validasi core loop

**Backend (sudah dibangun):**
- [x] Express server setup
- [x] BetterAuth (email + password)
- [x] DrizzleORM + SQLite schema (11 tables)
- [x] Jobs CRUD + status lifecycle
- [x] Auto-generate invoice dari job
- [x] Technicians CRUD + GPS field
- [x] Customers CRUD + unit info
- [x] Inventory CRUD + stock adjustment
- [x] Dashboard stats API
- [x] Business setup endpoint

**Frontend (to build dengan Codex + Paper MCP):**
- [ ] Vite + React + TS setup
- [ ] Auth pages (Login, Register)
- [ ] Onboarding wizard (business setup)
- [ ] AppLayout (sidebar + topbar)
- [ ] Dashboard page (metrics + charts + recent jobs)
- [ ] Jobs page (list view + kanban)
- [ ] Job detail page
- [ ] Create/edit job modal
- [ ] Technicians page
- [ ] Customers page
- [ ] Inventory page
- [ ] Invoice page

### Phase 2 — Core Features (Bulan 4–6)
**Goal:** 500 paying user, churn < 8%
- [ ] GPS live tracking (Socket.io)
- [ ] QRIS via Xendit
- [ ] WA notifications via Fonnte
- [ ] Invoice PDF export
- [ ] Kontrak servis + auto-reminder
- [ ] Mobile app Android (React Native)
- [ ] Customer signature digital
- [ ] WA blast dari dashboard

### Phase 3 — Growth (Bulan 7–12)
**Goal:** 2.000 paying user, NPS > 50
- [ ] Multi-cabang support
- [ ] AI pricing suggestion (Claude API)
- [ ] Integrasi akuntansi (Jurnal/Accurate)
- [ ] Marketplace sparepart B2B
- [ ] Custom branding app teknisi
- [ ] Heatmap area pekerjaan
- [ ] iOS app teknisi

---

## 11. Metrik Keberhasilan

### Product Metrics
| Metrik | M3 | M6 | M12 |
|--------|----|----|-----|
| MAU | 200 | 1.000 | 5.000 |
| Paying Users | 50 | 500 | 2.000 |
| Jobs Diproses/Bulan | 5.000 | 40.000 | 200.000 |
| Churn Rate/Bulan | <12% | <8% | <5% |
| NPS | >30 | >40 | >55 |

### Business Metrics
| Metrik | M3 | M6 | M12 |
|--------|----|----|-----|
| MRR | Rp 5 jt | Rp 50 jt | Rp 300 jt |
| CAC | <Rp 150K | <Rp 100K | <Rp 75K |
| LTV | Rp 1,2 jt | Rp 1,8 jt | Rp 2,5 jt |
| LTV:CAC | 8:1 | 18:1 | 33:1 |

### Activation Metrics (Target)
- User buat job pertama < 24 jam setelah register: **> 60%**
- User assign teknisi dalam minggu pertama: **> 75%**
- User generate invoice pertama < 7 hari: **> 50%**

---

## 12. Risiko & Mitigasi

| Risiko | Prob | Dampak | Mitigasi |
|--------|------|--------|---------|
| Adopsi lambat (literasi digital rendah) | Tinggi | Tinggi | Onboarding video, WA support, free tier |
| Kompetitor masuk (Gojek, Seekmi) | Sedang | Tinggi | Depth fitur field service, data lock-in |
| GPS tidak akurat area pelosok | Sedang | Rendah | Manual location update fallback |
| WhatsApp API berubah policy | Sedang | Sedang | Backup SMS + email notification |
| Churn tinggi karena harga | Sedang | Tinggi | Generous free tier + onboarding intensif |
| SQLite tidak cukup saat skala besar | Rendah | Tinggi | Migrate ke PostgreSQL saat > 10K users |

---

## 13. Vibe Coding Guide — Paper MCP + Codex

### 13.1 Setup Paper MCP
```bash
# Install Paper Desktop App dari https://paper.design/
# Buka Paper, buat project baru "TeknikOS"
# Di terminal, tambahkan MCP ke Codex/Claude Code:
claude mcp add paper --transport http http://127.0.0.1:29979/mcp --scope user
```

### 13.2 MCP Tools Yang Tersedia
| Tool | Kegunaan |
|------|----------|
| `get_selection` | Baca frame yang sedang dipilih di Paper |
| `get_screenshot` | Screenshot visual frame |
| `get_jsx` | Dapatkan struktur HTML/JSX dari frame |
| `get_computed_styles` | Extract spacing, colors, typography eksak |
| `write_html` | Push generated code kembali ke Paper canvas |
| `list_frames` | Lihat semua frame yang tersedia |

### 13.3 Workflow Optimal
```
1. Buat desain frame di Paper (gunakan flex layout + auto-layout)
2. Pilih frame yang ingin di-build
3. Jalankan prompt di Codex
4. Codex baca Paper frame via MCP → generate komponen
5. Verifikasi di browser
6. Gunakan write_html untuk push kembali ke Paper jika perlu iterate
```

### 13.4 Tips Paper Design untuk AI Code Gen
- Gunakan **auto-layout** di semua frame (bukan absolute positioning)
- Beri nama layer yang deskriptif: `sidebar-nav-item-active`, `job-card`, dll
- Gunakan **component instances** untuk elemen yang repeat
- Pakai **design tokens** untuk warna (bukan hardcode hex)
- Frame yang bersih = kode yang bersih — hindari nested groups berlebihan

### 13.5 Prompt Sequence (Codex)

Jalankan prompt berikut secara berurutan:

```
Prompt 1: Project setup (Vite + deps + folder structure)
Prompt 2: Auth pages (Login + Register) — pilih LoginPage frame di Paper
Prompt 3: Onboarding wizard — pilih SetupBusiness frame
Prompt 4: AppLayout + Sidebar — pilih Layout frame
Prompt 5: Dashboard page — pilih Dashboard frame
Prompt 6: Jobs page (list + kanban) — pilih Jobs frame
Prompt 7: Job detail page — pilih JobDetail frame
Prompt 8: Technicians page — pilih Technicians frame
Prompt 9: Customers page — pilih Customers frame
Prompt 10: Inventory + Invoice pages — pilih masing-masing frame
```

### 13.6 Environment Variables Frontend
```
# frontend/.env
VITE_API_URL=http://localhost:3001
VITE_APP_NAME=TeknikOS
VITE_GOOGLE_MAPS_KEY=your-key-here (Fase 2)
```

---

## Appendix — Running The Project

### Backend
```bash
cd backend
cp .env.example .env
# Edit .env: set BETTER_AUTH_SECRET (min 32 chars random string)
npm install
npm run dev
# Server: http://localhost:3001
# Health check: http://localhost:3001/api/health
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# App: http://localhost:5173
```

### First Run Flow
```
1. Buka http://localhost:5173/register
2. Daftar akun baru
3. Isi form setup bisnis di /onboarding
4. Dashboard siap digunakan
5. Tambah teknisi di /technicians
6. Tambah pelanggan di /customers
7. Buat job pertama di /jobs
```

---

*PRD Version 2.0 — TeknikOS · Confidential*  
*Backend: Express + BetterAuth + DrizzleORM + SQLite*  
*Frontend: Vite + React + TypeScript + TailwindCSS v4*  
*Design: Paper.design MCP + Codex vibe coding*

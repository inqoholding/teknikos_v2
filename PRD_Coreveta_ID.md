# Product Requirements Document (PRD): Coreveta v2.0 (Bahasa Indonesia)

**Status**: Siap Luncur (Audit Produksi Selesai)

---

## 1. Ringkasan Eksekutif
Coreveta adalah platform Manajemen Jasa Lapangan (Field Service Management/FSM) ujung-ke-ujung yang dirancang untuk bisnis jasa teknis (AC, Listrik, Pipa, IT, dll). Coreveta memposisikan diri sebagai "dapur operasional" yang mengelola backend bisnis, memastikan efisiensi mulai dari prospek hingga penagihan (invoice).

## 2. Target Audiens
- **Penyedia Jasa Teknis Skala Kecil hingga Menengah**: 5-50 teknisi.
- **Segmen Layanan**: HVAC (AC), Listrik, Plambing, Infrastruktur IT, dan Pemeliharaan Umum.

## 3. Persyaratan Fungsional Inti

### 3.1. Manajemen Pesanan Kerja (Job Order)
- **Pelacakan Status**: Alur kerja multi-tahap (Menunggu, Ditugaskan, Dalam Perjalanan, Dikerjakan, Selesai).
- **Penugasan**: Mendukung penugasan beberapa teknisi per satu pekerjaan (job).
- **Manajemen Prioritas**: Dukungan untuk tugas "Urgent" dengan penanda visual.

### 3.2. Manajemen Pelanggan (CRM)
- **Profil Klien**: Riwayat layanan, detail unit (aset), dan informasi kontak.
- **Intelijen Lokasi**: Integrasi Google Maps untuk survei dan rute perjalanan.
- **Riwayat Unit**: Mencatat spesifikasi perangkat/unit di lokasi klien untuk persiapan teknis.

### 3.3. Operasional Teknis (Absensi)
- **Bukti Kerja**: Koordinat GPS dan verifikasi foto wajib untuk check-in/out.
- **Pemantauan Live**: Dashboard real-time bagi pemilik bisnis untuk melacak lokasi dan aktivitas staf lapangan.

### 3.4. Inventori & Pengadaan
- **Manajemen Stok**: Peringatan stok rendah dan katalog master dengan harga bertingkat.
- **Kategorisasi Item**: Perbedaan antara Suku Cadang (Stok) dan Jasa (Non-stok).

### 3.5. Komunikasi Otomatis (WAHA)
- **Update Pelanggan**: Notifikasi WhatsApp otomatis saat terjadi perubahan status pekerjaan.
- **Dispatch Teknisi**: Detail tugas instan dikirim melalui WhatsApp kepada teknisi.
- **Reminder Follow-up**: Pesan otomatis untuk jadwal servis rutin berkala.

### 3.6. Keuangan & Penagihan
- **Generasi PDF**: Invoice profesional yang mencakup rincian jasa dan material.
- **Quick Billing**: Alur kerja langsung dari dashboard ke pembuatan invoice.

## 4. Persyaratan Teknis

### 4.1. Keamanan & Stabilitas
- **Rate Limiting**: Proteksi pada endpoint publik (`/api/support/public`, `/api/auth`).
- **Resiliensi**: `ErrorBoundary` global untuk mencegah crash runtime pada frontend.
- **Autentikasi**: Rute terproteksi berdasarkan peran (Pemilik vs. Teknisi).

### 4.2. Monitoring & Kesehatan Sistem
- **Diagnostik Live**: Endpoint `/api/health` dengan pengecekan konektivitas database aktif (`sql SELECT 1`).
- **Audit Logs**: Kemampuan melacak perubahan status pekerjaan dan kehadiran teknisi.

## 5. Peran Pengguna
- **Owner (Pemilik)**: Akses penuh, monitoring dashboard, laporan keuangan, dan HR/Absensi.
- **Teknisi**: Tampilan yang dioptimalkan untuk mobile untuk absensi dan manajemen tugas.

## 6. Metrik Keberhasilan (KPI)
- Pengurangan beban kerja administratif operasional bagi pemilik.
- Peningkatan akurasi penagihan (mengurangi suku cadang yang lupa dicatat).
- Komunikasi pelanggan yang lebih profesional melalui otomatisasi WA.

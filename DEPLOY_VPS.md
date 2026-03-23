# Deploy TeknikOS ke VPS Linux

Panduan ini ditulis untuk struktur project saat ini:

- `frontend`: Vite React
- `backend`: Express + Better Auth + Drizzle + SQLite
- reverse proxy: Nginx
- process manager: PM2

## Plan Deploy

### Plan A: MVP Public Cepat

Pakai ini kalau targetmu adalah online secepat mungkin.

- 1 VPS Ubuntu 22.04/24.04
- frontend dibuild jadi static file
- backend berjalan di port internal `3001`
- Nginx melayani domain publik
- PM2 menjaga backend tetap hidup
- SQLite tetap dipakai

Spec minimum yang aman:

- 2 vCPU
- 4 GB RAM
- 40-80 GB SSD

### Plan B: Public Lebih Aman

Pakai ini saat mulai ada client aktif.

- semua isi Plan A
- backup database harian
- firewall `ufw`
- log rotation
- user deploy non-root
- staging branch sebelum update ke production

### Plan C: Scale Up

Pakai ini saat subscription dan traffic mulai naik.

- frontend tetap static
- backend tetap Node/Express
- migrasi database dari SQLite ke PostgreSQL
- object storage untuk upload file
- monitoring dan alerting

## Struktur Folder Production

```text
/var/www/teknikos
├── backend
│   ├── data
│   │   └── teknikos.db
│   └── .env
├── deploy
├── frontend
│   └── dist
└── ecosystem.config.cjs
```

## Step 1: Siapkan VPS

Masuk ke VPS lalu install dependency dasar:

```bash
sudo apt update
sudo apt install -y nginx git curl build-essential sqlite3
```

Install Node.js 20 LTS:

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

Install PM2:

```bash
sudo npm install -g pm2
pm2 -v
```

## Step 2: Clone Project

```bash
sudo mkdir -p /var/www
sudo chown -R $USER:$USER /var/www
cd /var/www
git clone <repo-kamu> teknikos
cd /var/www/teknikos
```

Install dependency:

```bash
npm install
npm run install:frontend
npm run install:backend
```

## Step 3: Siapkan Env Production

Backend:

```bash
mkdir -p /var/www/teknikos/backend/data
cp /var/www/teknikos/backend/.env.production.example /var/www/teknikos/backend/.env
nano /var/www/teknikos/backend/.env
```

Yang wajib diganti:

- `BETTER_AUTH_SECRET`
- `BETTER_AUTH_URL`
- `FRONTEND_URL`
- `ADMIN_PASSWORD`
- `MODERATOR_PASSWORD`
- `DEMO_OWNER_PASSWORD` jika demo tetap dipakai

Frontend:

```bash
cp /var/www/teknikos/frontend/.env.production.example /var/www/teknikos/frontend/.env.production
```

Untuk production sekarang cukup pakai:

```env
VITE_API_URL=/api
```

## Step 4: Build App

Dari root project:

```bash
cd /var/www/teknikos
npm run build:all
```

Push schema dan seed data awal:

```bash
npm run db:push:backend
npm run seed:backend
```

Catatan:

- `seed` akan membuat akun demo/admin/moderator berdasarkan env
- kalau nanti production sudah berisi data real, jangan jalankan seed sembarangan

## Step 5: Jalankan Backend dengan PM2

Jalankan dari root project:

```bash
cd /var/www/teknikos
pm2 start ecosystem.config.cjs
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

Cek:

```bash
pm2 status
curl http://127.0.0.1:3001/api/health
```

## Step 6: Hubungkan Nginx

Copy template config:

```bash
sudo cp /var/www/teknikos/deploy/nginx.teknikos.conf /etc/nginx/sites-available/teknikos
sudo nano /etc/nginx/sites-available/teknikos
```

Ganti:

- `server_name app.example.com;` menjadi domain kamu

Aktifkan:

```bash
sudo ln -s /etc/nginx/sites-available/teknikos /etc/nginx/sites-enabled/teknikos
sudo nginx -t
sudo systemctl reload nginx
```

## Step 7: Pasang SSL

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d app.example.com
```

Setelah SSL aktif, pastikan di `backend/.env`:

```env
BETTER_AUTH_URL=https://app.example.com
FRONTEND_URL=https://app.example.com
```

Lalu restart backend:

```bash
cd /var/www/teknikos
pm2 restart teknikos-backend
```

## Step 8: Firewall Dasar

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
sudo ufw status
```

## Backup SQLite

Script backup sudah disiapkan di:

- `deploy/backup-sqlite.sh`

Aktifkan cron harian:

```bash
chmod +x /var/www/teknikos/deploy/backup-sqlite.sh
crontab -e
```

Tambahkan:

```cron
0 2 * * * /var/www/teknikos/deploy/backup-sqlite.sh >> /var/www/teknikos/backups/backup.log 2>&1
```

## Cara Update Aplikasi

Di VPS:

```bash
cd /var/www/teknikos
git pull origin main
npm install
npm run install:frontend
npm run install:backend
npm run build:all
npm run db:push:backend
pm2 restart teknikos-backend
```

Kalau update hanya frontend:

```bash
cd /var/www/teknikos
git pull origin main
npm run build
sudo systemctl reload nginx
```

## Cara Rollback Cepat

Kalau deploy baru bermasalah:

1. checkout commit stabil sebelumnya
2. build ulang
3. restart PM2

Contoh:

```bash
cd /var/www/teknikos
git log --oneline -n 5
git checkout <commit-stabil>
npm run build:all
pm2 restart teknikos-backend
```

## Checklist Sebelum Go Public

- domain sudah mengarah ke VPS
- `BETTER_AUTH_SECRET` sudah diganti
- password admin/moderator/demo sudah diganti
- file database ada di folder persistent `backend/data`
- `curl http://127.0.0.1:3001/api/health` sukses
- halaman frontend terbuka
- login owner/admin berhasil
- backup database aktif

## Rekomendasi Operasional

- mulai dari Plan A sekarang
- naik ke Plan B saat client mulai aktif
- migrasi ke PostgreSQL saat mulai butuh concurrency lebih besar

Untuk kondisi project TeknikOS saat ini, Plan A + backup harian adalah titik mulai yang paling masuk akal.

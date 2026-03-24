# Security Checklist

## Authentication

- Pastikan `BETTER_AUTH_SECRET` panjang dan acak.
- Gunakan `https` untuk `BETTER_AUTH_URL` dan `FRONTEND_URL` di production.
- Ganti password default admin, moderator, dan owner demo.
- Jangan bagikan password temporary client di channel publik.

## Authorization

- `admin` boleh ubah subscription dan reset password client.
- `moderator` hanya boleh akses read-only panel admin.
- Owner hanya boleh mengubah data bisnisnya sendiri.

## Transport and Cookies

- SSL harus aktif sebelum aplikasi dibuka publik.
- Pastikan Nginx hanya expose `80/443`; backend tetap internal di `127.0.0.1:3001`.
- Setelah domain aktif, verifikasi cookie auth memakai prefix secure.

## Abuse Protection

- Auth rate limit aktif dan disimpan di `backend/data/rate-limit.sqlite`.
- Jika perlu reset counter auth setelah test internal:
  - `bash deploy/reset-auth-rate-limit.sh`
- Jangan reset rate limit rutin tanpa alasan operasional yang jelas.

## Data Handling

- Backup SQLite aktif dan diuji restore-nya.
- Jangan jalankan `seed` ulang di production.
- Hapus data QA setelah hard test:
  - `bash deploy/cleanup-qa-data.sh`

## Deploy Verification

- Jalankan `npm run build`
- Jalankan `npm run build:backend`
- Jalankan `npm run smoke:test -- http://156.67.220.110` atau domain final
- Cek `pm2 logs teknikos-backend` bila ada `502` dari Nginx

## Periodic Review

- Jalankan `npm audit --omit=dev` di frontend dan backend setelah upgrade dependency.
- Review role access jika ada route admin baru.
- Review upload limits dan endpoint write jika ada fitur file upload atau public API baru.

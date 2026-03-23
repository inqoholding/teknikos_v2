export const whatsappRules = [
  {
    title: "Jangan kirim spam",
    description: "Gunakan WhatsApp untuk update pekerjaan, pengingat, atau follow up yang memang relevan. Jangan blast promosi ke banyak nomor.",
  },
  {
    title: "Utamakan nomor yang sudah pernah chat",
    description: "Risiko blokir lebih rendah jika pesan dikirim ke pelanggan yang sudah pernah berinteraksi dengan bisnis Anda.",
  },
  {
    title: "Nomor baru jangan langsung dipakai otomasi",
    description: "Nomor baru lebih rawan diblokir. Pakai dulu secara normal beberapa hari sebelum dihubungkan ke WAHA.",
  },
  {
    title: "Kalau harus kirim ke nomor baru, beri jeda",
    description: "Jangan kirim rapat-rapat. Gunakan jeda sekitar 120-300 detik. Jika masih berisiko, naikkan ke 250-600 detik.",
  },
  {
    title: "Cek pesan pending sebelum connect",
    description: "Jika ada pesan tertunda, sistem bisa langsung mengirimnya saat device tersambung dan terlihat seperti broadcast.",
  },
  {
    title: "Nomor yang pernah diblokir lebih berisiko",
    description: "Kalau sebelumnya pernah kena banned, nomor itu biasanya lebih mudah diblokir lagi saat dipakai terlalu agresif.",
  },
];

export const whatsappDonts = [
  "Jangan hubungkan nomor baru lalu langsung kirim banyak pesan.",
  "Jangan kirim massal ke kontak yang belum kenal bisnis Anda.",
  "Jangan biarkan banyak pesan pending menumpuk sebelum connect.",
  "Jangan anggap WhatsApp otomatis aman dari banned. Risiko tetap ada dan hanya bisa dikurangi.",
];

import { LegalPageLayout } from "../components/legal/LegalPageLayout";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function DataHandlingPage() {
  useDocumentMeta({
    title: "Penanganan Data | Coreveta",
    description: "Informasi teknis mengenai bagaimana Coreveta menangani, menyimpan, dan melindungi data operasional bisnis Anda.",
    path: "/data-handling",
  });

  return (
    <LegalPageLayout
      eyebrow="Compliance"
      title="Penanganan Data"
      summary="Halaman ini memberikan transparansi mengenai klasifikasi data, kontrol akses, dan kebijakan retensi yang diterapkan pada platform Coreveta."
    >
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">1. Klasifikasi Data</h2>
        <ul className="list-disc ml-6 space-y-2 text-slate-300">
          <li><strong>Data Identitas:</strong> Nama pengguna, peran (role), nomor WhatsApp bisnis, dan email administrator.</li>
          <li><strong>Data Bisnis:</strong> Informasi pelanggan, riwayat servis, inventori sukucadang, kontrak pemeliharaan, dan catatan penagihan.</li>
          <li><strong>Data Teknis:</strong> Log aktivitas sistem, session cookie untuk autentikasi, metadata keamanan, dan metrik performa aplikasi.</li>
        </ul>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">2. Kontrol Keamanan Teknis</h2>
        <p>Coreveta menerapkan lapisan keamanan berikut untuk menjaga integritas data Anda:</p>
        <ul className="list-disc ml-6 space-y-2 text-slate-300">
          <li><strong>Role-Based Access Control (RBAC):</strong> Pembatasan akses fitur berdasarkan peran pengguna (Owner, Admin, Teknisi).</li>
          <li><strong>Enkripsi:</strong> Semua komunikasi antara browser dan server dilindungi protokol HTTPS/TLS 1.3.</li>
          <li><strong>Proteksi Sesi:</strong> Penggunaan Secure Cookie dan proteksi terhadap serangan Cross-Site Request Forgery (CSRF).</li>
          <li><strong>Rate Limiting:</strong> Pembatasan frekuensi permintaan untuk mencegah serangan brute-force dan Denial of Service (DoS).</li>
        </ul>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">3. Kebijakan Retensi</h2>
        <p>Data operasional disimpan selama akun organisasi Anda aktif. Jika Anda memutuskan untuk berhenti berlangganan, data akan dipertahankan selama periode tenggang 30 hari sebelum dihapus secara permanen dari server aktif Kami, kecuali diwajibkan lain oleh hukum perpajakan atau regulasi pemerintah Indonesia.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">4. Penanganan Integrasi Pihak Ketiga</h2>
        <p>Untuk fitur otomasi WhatsApp, Coreveta berintegrasi dengan layanan WAHA. Kredensial API (API Keys) disimpan dengan aman di sisi server menggunakan variabel lingkungan (environment variables) dan tidak pernah diekspos ke sisi klien (browser) untuk mencegah kebocoran akses.</p>
      </section>
    </LegalPageLayout>
  );
}

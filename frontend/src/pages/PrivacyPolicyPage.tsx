import { LegalPageLayout } from "../components/legal/LegalPageLayout";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function PrivacyPolicyPage() {
  useDocumentMeta({
    title: "Privacy Policy | TeknikOS",
    description: "Kebijakan privasi TeknikOS untuk data akun, pelanggan, teknisi, invoice, dan komunikasi dukungan.",
    path: "/privacy",
  });

  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Privacy Policy"
      summary="Dokumen ini menjelaskan data apa yang dikumpulkan TeknikOS, alasan pemrosesannya, kontrol yang dimiliki pengguna, dan cara kami menjaga keamanan data operasional bisnis."
    >
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">1. Data yang Kami Kumpulkan</h2>
        <p>Kami memproses data akun seperti nama, email, nomor telepon, peran pengguna, dan kredensial login terenkripsi.</p>
        <p>Kami juga memproses data operasional yang dimasukkan pengguna, termasuk pelanggan, job, teknisi, invoice, inventori, kontrak, lokasi teknisi saat fitur aktif, dan log dukungan.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">2. Tujuan Pemrosesan</h2>
        <p>Data dipakai untuk menyediakan dashboard operasional, mengelola autentikasi, menjaga keamanan layanan, mendukung billing, dan menjalankan komunikasi status pekerjaan.</p>
        <p>Kami tidak menjual data pengguna ke pihak ketiga dan tidak menggunakan tracker iklan pihak ketiga pada landing page publik saat ini.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">3. Cookie dan Session</h2>
        <p>TeknikOS memakai cookie esensial untuk autentikasi, keamanan CSRF, dan kesinambungan sesi pengguna. Cookie ini diperlukan agar aplikasi berfungsi.</p>
        <p>Karena cookie tersebut bersifat esensial, penonaktifannya dapat menghambat penggunaan aplikasi.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">4. Penyimpanan dan Keamanan</h2>
        <p>Kami menerapkan validasi input, rate limiting, kontrol akses berbasis peran, pengelolaan secret melalui environment variable, dan koneksi HTTPS pada deployment produksi.</p>
        <p>Password tidak disimpan dalam bentuk plaintext. Secret integrasi seperti WAHA API key tidak boleh disimpan di frontend.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">5. Hak Pengguna dan GDPR</h2>
        <p>Jika layanan ini dipakai oleh pengguna di EEA/UK, kami akan menangani permintaan akses, koreksi, atau penghapusan data yang berlaku berdasarkan GDPR sejauh diwajibkan oleh hukum.</p>
        <p>Untuk wilayah di luar cakupan GDPR, kami tetap mendorong praktik minimisasi data, retensi terbatas, dan penghapusan data saat kontrak layanan berakhir sesuai kebutuhan operasional dan hukum.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">6. Kontak Privasi</h2>
        <p>Pertanyaan terkait privasi, permintaan penghapusan data, atau insiden keamanan dapat diajukan melalui kanal support resmi TeknikOS.</p>
      </section>
    </LegalPageLayout>
  );
}

import { LegalPageLayout } from "../components/legal/LegalPageLayout";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function TermsOfServicePage() {
  useDocumentMeta({
    title: "Terms of Service | TeknikOS",
    description: "Syarat dan ketentuan penggunaan TeknikOS untuk akun bisnis, staff, teknisi, dan penggunaan layanan SaaS.",
    path: "/terms",
  });

  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Terms of Service"
      summary="Dengan menggunakan TeknikOS, pengguna setuju memakai layanan secara sah, menjaga keamanan akses akun, dan tidak menyalahgunakan sistem untuk aktivitas yang melanggar hukum atau merusak layanan."
    >
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">1. Cakupan Layanan</h2>
        <p>TeknikOS menyediakan perangkat lunak berbasis web untuk pengelolaan operasional jasa teknik, termasuk dispatch job, data pelanggan, invoice, inventori, kontrak, dan dukungan operasional.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">2. Kewajiban Akun</h2>
        <p>Pemilik akun bertanggung jawab atas kerahasiaan kredensial, aktivitas pengguna yang ditambahkan ke workspace, dan akurasi data yang dimasukkan ke sistem.</p>
        <p>Pengguna dilarang membagikan akses tanpa otorisasi, menguji eksploitasi tanpa izin tertulis, atau memakai layanan untuk spam dan penipuan.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">3. Pembayaran dan Paket</h2>
        <p>Fitur, limit penggunaan, dan status akses mengikuti paket aktif serta status subscription pada workspace masing-masing.</p>
        <p>Keterlambatan pembayaran dapat membatasi fitur tulis tertentu sampai status layanan kembali aktif.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">4. Data dan Ketersediaan</h2>
        <p>Kami berupaya menjaga layanan tetap tersedia, namun pemeliharaan, gangguan infrastruktur, atau integrasi pihak ketiga dapat memengaruhi ketersediaan sementara.</p>
        <p>Pengguna tetap bertanggung jawab melakukan pengawasan operasional yang wajar atas data bisnis penting.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">5. Penghentian dan Pelanggaran</h2>
        <p>Kami dapat menangguhkan atau menghentikan akses jika terdapat penyalahgunaan layanan, pelanggaran keamanan, atau pelanggaran hukum yang relevan.</p>
        <p>Permintaan penghentian akun oleh pelanggan akan diproses sesuai status kontraktual dan retensi data yang berlaku.</p>
      </section>
    </LegalPageLayout>
  );
}

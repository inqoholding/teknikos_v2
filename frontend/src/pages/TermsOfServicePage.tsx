import { LegalPageLayout } from "../components/legal/LegalPageLayout";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function TermsOfServicePage() {
  useDocumentMeta({
    title: "Syarat & Ketentuan | Coreveta",
    description: "Syarat dan ketentuan penggunaan layanan Coreveta untuk manajemen operasional bisnis jasa teknik.",
    path: "/terms",
  });

  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Syarat & Ketentuan"
      summary="Dokumen ini mengatur hubungan hukum antara Anda sebagai Pengguna dan Coreveta sebagai penyedia Layanan Software-as-a-Service (SaaS)."
    >
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">1. Definisi dan Layanan</h2>
        <p>Coreveta adalah platform manajemen operasional yang membantu bisnis dalam pengelolaan teknisi, pesanan kerja (job order), inventori, dan penagihan. Dengan mendaftar akun, Anda menyatakan bahwa Anda memiliki wewenang hukum untuk mengikat entitas bisnis Anda pada ketentuan ini.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">2. Keamanan Akun</h2>
        <p>Anda bertanggung jawab penuh atas kerahasiaan kata sandi dan seluruh aktivitas yang terjadi di bawah akun Anda. Jika terdapat akses yang tidak sah, Anda wajib segera melaporkannya kepada tim dukungan Kami.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">3. Kebijakan Penggunaan</h2>
        <p>Anda setuju untuk tidak:</p>
        <ul className="list-disc ml-6 space-y-2 text-slate-300">
          <li>Menggunakan Layanan untuk tujuan yang melanggar hukum di Republik Indonesia.</li>
          <li>Melakukan upaya peretasan, pemindaian kerentanan tanpa izin, atau gangguan terhadap integritas sistem Coreveta.</li>
          <li>Menggunakan fitur WhatsApp (WAHA) untuk aktivitas spamming atau melanggar kebijakan Meta/WhatsApp.</li>
          <li>Menjual kembali (resell) akses Layanan tanpa perjanjian kemitraan resmi.</li>
        </ul>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">4. Biaya dan Pembayaran</h2>
        <p>Layanan Coreveta tersedia berdasarkan paket berlangganan (Starter, Pro, Bisnis). Pembayaran dilakukan di muka (prepaid) sesuai periode yang dipilih. Kegagalan pembayaran dapat mengakibatkan pembatasan fitur atau penangguhan akun sementara.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">5. Hak Kekayaan Intelektual</h2>
        <p>Seluruh desain, kode sumber, logo, dan konten platform Coreveta adalah milik eksklusif penyedia Layanan. Anda diberikan lisensi terbatas, non-eksklusif, dan tidak dapat dipindahtangankan untuk menggunakan Layanan hanya selama masa berlangganan aktif.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">6. Batasan Tanggung Jawab</h2>
        <p>Coreveta menyediakan Layanan "sebagaimana adanya" (as is). Kami tidak bertanggung jawab atas kerugian bisnis, kehilangan data, atau gangguan operasional yang disebabkan oleh kesalahan penggunaan oleh Pengguna atau gangguan teknis pada infrastruktur pihak ketiga.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">7. Hukum yang Berlaku</h2>
        <p>Syarat dan Ketentuan ini diatur oleh hukum Republik Indonesia. Setiap perselisihan yang timbul akan diselesaikan terlebih dahulu melalui musyawarah untuk mufakat, dan jika tidak tercapai, akan diselesaikan melalui pengadilan yang berwenang.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">8. Hubungi Kami</h2>
        <p>Jika Anda memiliki pertanyaan mengenai Syarat & Ketentuan ini, silakan hubungi tim kami melalui support@coreveta.com.</p>
      </section>
    </LegalPageLayout>
  );
}

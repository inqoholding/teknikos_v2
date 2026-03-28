import { LegalPageLayout } from "../components/legal/LegalPageLayout";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function PrivacyPolicyPage() {
  useDocumentMeta({
    title: "Kebijakan Privasi | Coreveta",
    description: "Kebijakan privasi Coreveta mengenai perlindungan data pribadi sesuai dengan UU PDP No. 27/2022.",
    path: "/privacy",
  });

  return (
    <LegalPageLayout
      eyebrow="Legal"
      title="Kebijakan Privasi"
      summary="Pemberitahuan ini menjelaskan bagaimana Coreveta (selanjutnya disebut 'Layanan' atau 'Kami') mengumpulkan, memproses, dan melindungi data pribadi Anda sesuai dengan Undang-Undang Perlindungan Data Pribadi (UU PDP) No. 27 Tahun 2022 di Indonesia."
    >
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">1. Dasar Pemrosesan dan Persetujuan</h2>
        <p>Dengan menggunakan Layanan Kami, Anda memberikan persetujuan eksplisit kepada Kami untuk memproses data pribadi Anda sesuai dengan tujuan yang dijelaskan dalam kebijakan ini. Kami memproses data berdasarkan kebutuhan kontrak untuk menyediakan layanan manajemen teknisi dan operasional bagi bisnis Anda.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">2. Jenis Data yang Dikumpulkan</h2>
        <ul className="list-disc ml-6 space-y-2 text-slate-300">
          <li><strong>Data Akun:</strong> Nama lengkap, alamat email, nomor telepon, dan kredensial login terenkripsi.</li>
          <li><strong>Data Operasional:</strong> Informasi pelanggan Anda (nama, alamat, nomor telepon), detail pekerjaan (job order), jadwal, dan metadata invoice.</li>
          <li><strong>Data Teknisi:</strong> Nama teknisi, spesialisasi, rating, dan data lokasi GPS saat fitur absensi atau pelacakan aktif atas persetujuan teknisi terkait.</li>
          <li><strong>Data Teknis:</strong> Alamat IP, jenis browser, dan log aktivitas untuk tujuan keamanan dan stabilitas sistem.</li>
        </ul>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">3. Tujuan Pemrosesan Data</h2>
        <p>Kami memproses data pribadi Anda untuk tujuan berikut:</p>
        <ul className="list-disc ml-6 space-y-2 text-slate-300">
          <li>Menyediakan dan mengelola dashboard operasional Coreveta.</li>
          <li>Memfasilitasi komunikasi otomatis melalui integrasi WhatsApp (WAHA).</li>
          <li>Mengelola penagihan (billing) dan administrasi langganan.</li>
          <li>Mencegah penipuan, serangan siber, dan penyalahgunaan Layanan.</li>
          <li>Memberikan dukungan teknis dan menanggapi keluhan pengguna.</li>
        </ul>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">4. Hak Pengguna (Subjek Data)</h2>
        <p>Sesuai UU PDP No. 27/2022, Anda memiliki hak-hak berikut:</p>
        <ul className="list-disc ml-6 space-y-2 text-slate-300">
          <li><strong>Hak Akses:</strong> Memperoleh informasi tentang pemrosesan dan salinan data pribadi Anda.</li>
          <li><strong>Hak Koreksi:</strong> Meminta perbaikan data pribadi yang tidak akurat atau tidak lengkap.</li>
          <li><strong>Hak Penghapusan:</strong> Meminta penghapusan data pribadi Anda jika sudah tidak diperlukan atau persetujuan ditarik.</li>
          <li><strong>Hak Penarikan Persetujuan:</strong> Menarik kembali persetujuan pemrosesan data di masa mendatang.</li>
          <li><strong>Hak Keberatan:</strong> Mengajukan keberatan atas pemrosesan data untuk tujuan tertentu.</li>
        </ul>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">5. Keamanan dan Retensi Data</h2>
        <p>Kami menggunakan enkripsi tingkat industri (HTTPS/TLS), hashing password yang kuat, dan kontrol akses yang ketat untuk melindungi data Anda. Data pribadi disimpan selama akun Anda aktif atau selama diperlukan untuk memenuhi kewajiban hukum dan operasional bisnis.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">6. Perubahan Kebijakan</h2>
        <p>Kami dapat memperbarui kebijakan ini sewaktu-waktu untuk mengikuti perkembangan hukum atau fitur Layanan. Perubahan akan diberitahukan melalui dashboard atau email resmi kami.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">7. Hubungi Kami</h2>
        <p>Untuk pertanyaan mengenai privasi atau penyampaian keluhan perlindungan data pribadi, silakan hubungi tim kami di support@coreveta.com.</p>
      </section>
    </LegalPageLayout>
  );
}

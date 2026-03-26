import { LegalPageLayout } from "../components/legal/LegalPageLayout";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

export default function DataHandlingPage() {
  useDocumentMeta({
    title: "Data Handling | TeknikOS",
    description: "Ringkasan alur data TeknikOS: data yang diproses, retensi, kontrol akses, dan alur dukungan.",
    path: "/data-handling",
  });

  return (
    <LegalPageLayout
      eyebrow="Compliance"
      title="Data Handling"
      summary="Halaman ini merangkum jenis data, alur pemrosesan, retensi, dan kontrol keamanan yang diterapkan pada TeknikOS agar tim bisnis dapat meninjau praktik pengelolaan data secara cepat."
    >
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-white">1. Jenis Data</h2>
        <p>Data akun: identitas pengguna, role, nomor telepon, email, dan status akses.</p>
        <p>Data operasional: pelanggan, teknisi, job, kontrak, inventori, invoice, dan dukungan.</p>
        <p>Data teknis: log error, audit sederhana, session cookie, metadata keamanan, dan counter rate limiting.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">2. Kontrol Akses</h2>
        <p>Akses data dibatasi dengan session auth, role-based access control, ownership checks per business, CSRF protection, dan rate limiting berbasis IP plus identitas permintaan saat tersedia.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">3. Retensi</h2>
        <p>Data operasional utama disimpan selama workspace aktif atau selama dibutuhkan untuk kewajiban layanan dan administratif.</p>
        <p>Log bantuan, status subscription, dan catatan keamanan dapat dipertahankan lebih lama bila dibutuhkan untuk investigasi, audit, atau kepatuhan hukum.</p>
      </section>

      <section className="mt-8 space-y-4">
        <h2 className="text-2xl font-semibold text-white">4. Integrasi Pihak Ketiga</h2>
        <p>Integrasi WAHA dan infrastruktur pendukung hanya boleh menggunakan API key yang disimpan di server melalui environment variable. Secret tidak boleh disuntikkan ke bundle frontend.</p>
      </section>
    </LegalPageLayout>
  );
}

import { useEffect, useState } from "react";
import { getErrorMessage } from "../api/client";
import {
  useBusinessQuery,
  useBusinessWhatsappQrMutation,
  useBusinessWhatsappQuery,
  useConnectBusinessWhatsappMutation,
  useDisconnectBusinessWhatsappMutation,
  useSendBusinessWhatsappMutation,
  useUpdateBusinessWhatsappMutation,
} from "../api/hooks";
import { PageError, PageLoader } from "../components/PageState";
import { Badge, EmptyAction, SectionCard } from "../components/UI";
import { WAHA_TEST_MESSAGE } from "../utils/whatsapp";

export default function SettingsWhatsappConnectPage() {
  const businessQuery = useBusinessQuery();
  const businessWhatsappQuery = useBusinessWhatsappQuery();
  const updateBusinessWhatsappMutation = useUpdateBusinessWhatsappMutation();
  const connectBusinessWhatsappMutation = useConnectBusinessWhatsappMutation();
  const businessWhatsappQrMutation = useBusinessWhatsappQrMutation();
  const disconnectBusinessWhatsappMutation = useDisconnectBusinessWhatsappMutation();
  const sendBusinessWhatsappMutation = useSendBusinessWhatsappMutation();
  const [whatsappMode, setWhatsappMode] = useState<"basic" | "automation">("basic");
  const [setupNotice, setSetupNotice] = useState("");

  useEffect(() => {
    if (businessQuery.data) {
      setWhatsappMode(businessQuery.data.whatsapp?.mode ?? "basic");
    }
  }, [businessQuery.data]);

  if (businessQuery.isLoading || businessWhatsappQuery.isLoading) {
    return <PageLoader title="Memuat koneksi WAHA..." />;
  }

  if (businessQuery.error || !businessQuery.data) {
    return <PageError message={getErrorMessage(businessQuery.error)} />;
  }

  if (businessWhatsappQuery.error || !businessWhatsappQuery.data) {
    return <PageError message={getErrorMessage(businessWhatsappQuery.error)} />;
  }

  const whatsappState =
    businessWhatsappQrMutation.data ?? connectBusinessWhatsappMutation.data ?? businessWhatsappQuery.data;
  const whatsappTone =
    whatsappState.automationStatus === "connected"
      ? "success"
      : whatsappState.automationStatus === "pairing" || whatsappState.automationStatus === "connecting"
        ? "warning"
        : whatsappState.automationStatus === "error"
          ? "danger"
          : "neutral";
  const modeSaved = whatsappState.mode === whatsappMode;
  const isAutomationMode = whatsappMode === "automation";
  const isConnected = whatsappState.automationStatus === "connected";
  const isWaitingQr = whatsappState.automationStatus === "pairing" || Boolean(whatsappState.qrCodeDataUrl);
  const canMoveToConnect = modeSaved && isAutomationMode;

  async function handleSaveWhatsappMode() {
    await updateBusinessWhatsappMutation.mutateAsync({ mode: whatsappMode });
  }

  async function handleConnectWhatsapp() {
    if (whatsappMode !== "automation") {
      setWhatsappMode("automation");
      await updateBusinessWhatsappMutation.mutateAsync({ mode: "automation" });
    } else if (businessWhatsappQuery.data?.mode !== "automation") {
      await updateBusinessWhatsappMutation.mutateAsync({ mode: "automation" });
    }

    await connectBusinessWhatsappMutation.mutateAsync();
    setSetupNotice("Session WAHA sedang disiapkan. Lanjutkan ke langkah 3 untuk scan QR atau refresh status.");
  }

  async function handleRefreshWhatsappStatus() {
    await businessWhatsappQuery.refetch();
    setSetupNotice("Status WAHA berhasil diperbarui. Cek apakah QR sudah muncul atau koneksi sudah aktif.");
  }

  async function handleRefreshQr() {
    await businessWhatsappQrMutation.mutateAsync();
    setSetupNotice("QR berhasil diminta ulang. Jika belum muncul, tunggu beberapa detik lalu refresh status.");
  }

  async function handleSendTestMessage() {
    const testPhone = whatsappState.businessPhone ?? businessQuery.data?.phone;
    if (!testPhone) {
      return;
    }

    await sendBusinessWhatsappMutation.mutateAsync({
      phone: testPhone,
      message: WAHA_TEST_MESSAGE,
    });
    setSetupNotice("Pesan tes berhasil dikirim ke nomor bisnis untuk verifikasi koneksi WAHA.");
  }

  return (
    <div className="page-stack">
      <SectionCard
        title="Menghubungkan ke WAHA"
        description="Ikuti 3 langkah di bawah ini secara berurutan untuk mengaktifkan pengiriman otomatis via WAHA."
      >
        <div className="page-stack">
          <div className="callout callout--success">
            <strong>Mode aktif sekarang: {whatsappMode === "automation" ? "Otomasi WAHA" : "WhatsApp Dasar"}</strong>
            <p>
              {whatsappState.automationStatus === "connected"
                ? "Nomor sudah tersambung dan siap dipakai."
                : whatsappMode === "automation"
                  ? "Lanjutkan sambungkan WAHA lalu scan QR dari ponsel bisnis."
                  : "Pilih mode Otomasi WAHA jika ingin kirim pesan otomatis dari Coreveta."}
            </p>
          </div>

          <div className="waha-stepper">
            <article className="waha-step-card">
              <div className="waha-step-card__header">
                <div>
                  <span className="eyebrow">Langkah 1</span>
                  <strong>Pilih cara pakai WhatsApp</strong>
                  <p>Pilih mode yang ingin dipakai, lalu simpan. Untuk pengiriman otomatis, pilih Otomasi WAHA.</p>
                </div>
                <Badge tone={modeSaved ? "success" : "warning"}>
                  {modeSaved ? "Sudah disimpan" : "Belum disimpan"}
                </Badge>
              </div>

              <div className="integration-choice-grid">
                <label className={`integration-choice ${whatsappMode === "basic" ? "integration-choice--active" : ""}`}>
                  <input
                    type="radio"
                    name="whatsappMode"
                    value="basic"
                    checked={whatsappMode === "basic"}
                    onChange={() => setWhatsappMode("basic")}
                  />
                  <div>
                    <strong>WhatsApp Dasar</strong>
                    <p>Coreveta hanya menyiapkan tombol chat dan isi pesan. Pengiriman tetap manual oleh owner atau admin.</p>
                  </div>
                </label>

                <label className={`integration-choice ${whatsappMode === "automation" ? "integration-choice--active" : ""}`}>
                  <input
                    type="radio"
                    name="whatsappMode"
                    value="automation"
                    checked={whatsappMode === "automation"}
                    onChange={() => setWhatsappMode("automation")}
                  />
                  <div>
                    <strong>Otomasi WAHA</strong>
                    <p>Coreveta bisa mengirim pesan langsung dari nomor WhatsApp bisnis yang tersambung ke WAHA.</p>
                  </div>
                </label>
              </div>

              <div className="button-row button-row--left">
                <EmptyAction onClick={() => void handleSaveWhatsappMode()} disabled={updateBusinessWhatsappMutation.isPending}>
                  {updateBusinessWhatsappMutation.isPending ? "Menyimpan Mode..." : "Simpan Cara Pakai WhatsApp"}
                </EmptyAction>
              </div>
            </article>

            <article className="waha-step-card">
              <div className="waha-step-card__header">
                <div>
                  <span className="eyebrow">Langkah 2</span>
                  <strong>Hubungkan session WAHA</strong>
                  <p>Setelah mode otomasi disimpan, jalankan sambungan WAHA agar QR bisa muncul.</p>
                </div>
                <Badge tone={isConnected ? "success" : canMoveToConnect ? "warning" : "neutral"}>
                  {isConnected ? "Terhubung" : canMoveToConnect ? "Siap disambungkan" : "Tunggu langkah 1"}
                </Badge>
              </div>

              <div className="callout">
                <div>
                  <strong>Status koneksi</strong>
                  <p>{whatsappState.channelSummary}</p>
                </div>
                <Badge tone={whatsappTone}>{whatsappState.automationStatusLabel}</Badge>
              </div>

              <div className="summary-list">
                <div><span>Mode di sistem</span><strong>{whatsappState.modeLabel}</strong></div>
                <div><span>Nomor bisnis</span><strong>{whatsappState.businessPhone ?? businessQuery.data.phone ?? "-"}</strong></div>
                <div><span>Runtime WAHA</span><strong>{whatsappState.dockerRuntime ?? "WAHA Docker"}</strong></div>
                <div><span>Terhubung sejak</span><strong>{whatsappState.connectedAt ? new Date(whatsappState.connectedAt).toLocaleString("id-ID") : "Belum terhubung"}</strong></div>
              </div>

              <div className="button-row button-row--left">
                <EmptyAction
                  primary
                  onClick={() => void handleConnectWhatsapp()}
                  disabled={connectBusinessWhatsappMutation.isPending || updateBusinessWhatsappMutation.isPending || !canMoveToConnect}
                >
                  {connectBusinessWhatsappMutation.isPending ? "Menghubungkan..." : "Hubungkan WAHA"}
                </EmptyAction>
                <EmptyAction onClick={() => void disconnectBusinessWhatsappMutation.mutateAsync()} disabled={disconnectBusinessWhatsappMutation.isPending}>
                  {disconnectBusinessWhatsappMutation.isPending ? "Memutuskan..." : "Putuskan Sambungan"}
                </EmptyAction>
                <EmptyAction onClick={() => void handleRefreshWhatsappStatus()}>
                  Refresh Status
                </EmptyAction>
              </div>
            </article>

            <article className="waha-step-card">
              <div className="waha-step-card__header">
                <div>
                  <span className="eyebrow">Langkah 3</span>
                  <strong>Scan QR dan pastikan berhasil</strong>
                  <p>Buka WhatsApp di ponsel bisnis, masuk ke Linked Devices, lalu scan QR di bawah ini.</p>
                </div>
                <Badge tone={isConnected ? "success" : isWaitingQr ? "warning" : "neutral"}>
                  {isConnected ? "Setup selesai" : isWaitingQr ? "Menunggu scan QR" : "QR belum siap"}
                </Badge>
              </div>

              {whatsappState.qrCodeDataUrl ? (
                <div className="qr-panel">
                  <img src={whatsappState.qrCodeDataUrl} alt="QR WAHA" />
                  <div>
                    <strong>Scan QR WhatsApp bisnis</strong>
                    <p>Buka WhatsApp di ponsel bisnis, masuk ke Linked Devices, lalu scan QR ini.</p>
                  </div>
                </div>
              ) : (
                <div className="callout">
                  <div>
                    <strong>QR belum tampil</strong>
                    <p>Jalankan langkah 2 lebih dulu. Setelah session WAHA aktif, QR akan muncul di sini.</p>
                  </div>
                </div>
              )}

              <div className="summary-list">
                <div><span>Status terakhir</span><strong>{whatsappState.automationStatusLabel}</strong></div>
                <div><span>Kondisi setup</span><strong>{isConnected ? "Sudah bisa dipakai" : isWaitingQr ? "Tinggal scan QR" : "Masih menunggu langkah sebelumnya"}</strong></div>
              </div>

              {setupNotice ? (
                <div className="callout callout--success">
                  <strong>Update setup</strong>
                  <p>{setupNotice}</p>
                </div>
              ) : null}

              <div className="button-row button-row--left">
                <EmptyAction onClick={() => void handleRefreshQr()} disabled={businessWhatsappQrMutation.isPending || !canMoveToConnect}>
                  {businessWhatsappQrMutation.isPending ? "Mengambil QR..." : "Tampilkan QR Lagi"}
                </EmptyAction>
                <EmptyAction
                  primary
                  onClick={() => void handleSendTestMessage()}
                  disabled={!isConnected || sendBusinessWhatsappMutation.isPending || !(whatsappState.businessPhone ?? businessQuery.data.phone)}
                >
                  {sendBusinessWhatsappMutation.isPending ? "Mengirim Tes..." : "Tes Koneksi WAHA"}
                </EmptyAction>
              </div>
            </article>
          </div>

          {updateBusinessWhatsappMutation.error ? <p className="form-error">{getErrorMessage(updateBusinessWhatsappMutation.error)}</p> : null}
          {connectBusinessWhatsappMutation.error ? <p className="form-error">{getErrorMessage(connectBusinessWhatsappMutation.error)}</p> : null}
          {businessWhatsappQrMutation.error ? <p className="form-error">{getErrorMessage(businessWhatsappQrMutation.error)}</p> : null}
          {disconnectBusinessWhatsappMutation.error ? <p className="form-error">{getErrorMessage(disconnectBusinessWhatsappMutation.error)}</p> : null}
          {sendBusinessWhatsappMutation.error ? <p className="form-error">{getErrorMessage(sendBusinessWhatsappMutation.error)}</p> : null}
          {whatsappState.lastError ? <p className="form-error">{whatsappState.lastError}</p> : null}
        </div>
      </SectionCard>
    </div>
  );
}

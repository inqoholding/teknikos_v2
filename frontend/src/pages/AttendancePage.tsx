import { useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../api/client";
import { useTechnicianSelfQuery, useTechnicianCheckInMutation, useTechnicianCheckOutMutation, useJobsQuery } from "../api/hooks";
import { Badge, EmptyAction, SectionCard } from "../components/UI";
import { PageError, PageLoader } from "../components/PageState";
import { Camera, MapPin, CheckCircle2, XCircle, Loader2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AttendancePage() {
  const technicianQuery = useTechnicianSelfQuery();
  const checkInMutation = useTechnicianCheckInMutation();
  const checkOutMutation = useTechnicianCheckOutMutation();
  const jobsQuery = useJobsQuery({ status: "in_progress" }); // Optional: tasks in progress
  
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locating, setLocating] = useState(false);
  const [note, setNote] = useState("");
  const [selectedJobId, setSelectedJobId] = useState("");
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchLocation();
  }, []);

  function fetchLocation() {
    if (!navigator.geolocation) {
      setFeedback({ type: "error", message: "Geolocation tidak didukung oleh browser ini." });
      return;
    }

    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setLocating(false);
      },
      (err) => {
        console.error(err);
        setFeedback({ type: "error", message: "Gagal mendapatkan lokasi. Pastikan izin lokasi aktif." });
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function handlePhotoCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setPhotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  }

  async function handleCheckAction(type: "in" | "out") {
    if (!location) {
      setFeedback({ type: "error", message: "Lokasi belum didapatkan. Silakan coba lagi." });
      return;
    }
    
    if (!photoUrl) {
      setFeedback({ type: "error", message: "Foto wajib diambil untuk verifikasi absensi." });
      return;
    }

    try {
      const payload = {
        latitude: location.lat,
        longitude: location.lng,
        photoUrl,
        note: note.trim() || undefined,
        jobId: selectedJobId || undefined,
      };

      if (type === "in") {
        await checkInMutation.mutateAsync(payload);
        setFeedback({ type: "success", message: "Check-in berhasil! Selamat bekerja." });
      } else {
        await checkOutMutation.mutateAsync(payload);
        setFeedback({ type: "success", message: "Check-out berhasil! Hati-hati di jalan." });
      }

      // Reset state
      setPhotoUrl(null);
      setNote("");
      setSelectedJobId("");
    } catch (err) {
      setFeedback({ type: "error", message: getErrorMessage(err) });
    }
  }

  if (technicianQuery.isLoading) return <PageLoader title="Memuat status absensi..." />;
  if (technicianQuery.error) return <PageError message={getErrorMessage(technicianQuery.error)} />;

  const technician = technicianQuery.data!;
  const isCheckedIn = technician.attendanceStatus === "Sudah Check-in";

  return (
    <div className="page-stack page-stack--centered">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="attendance-container"
      >
        <SectionCard 
          title="Verifikasi Kehadiran" 
          description="Gunakan halaman ini untuk memulai dan mengakhiri shift kerja Anda."
        >
          <div className="attendance-status-banner">
            <div className={`status-orb ${isCheckedIn ? "status-orb--active" : ""}`} />
            <div>
              <strong>{technician.attendanceStatus}</strong>
              <p>{technician.attendanceUpdatedAt ? `Terakhir update: ${new Date(technician.attendanceUpdatedAt).toLocaleString('id-ID')}` : 'Belum ada aktivitas hari ini'}</p>
            </div>
          </div>

          <div className="action-stack">
            {/* Photo Section */}
            <div className="attendance-photo-zone">
              {photoUrl || technician.attendancePhotoUrl ? (
                <div className="photo-preview-wrap">
                  <img src={photoUrl || technician.attendancePhotoUrl!} alt="Preview" />
                  {!isCheckedIn || photoUrl ? (
                    <button className="btn-remove-photo" onClick={() => setPhotoUrl(null)}>
                      <XCircle size={20} />
                    </button>
                  ) : (
                    <div className="photo-verified-badge">
                      <CheckCircle2 size={16} />
                      <span>Verified</span>
                    </div>
                  )}
                </div>
              ) : (
                <button className="photo-placeholder" onClick={() => fileInputRef.current?.click()}>
                  <Camera size={32} />
                  <span>Ambil Foto Lapangan</span>
                  <p>Verifikasi wajah atau lokasi kerja</p>
                </button>
              )}
              <input 
                type="file" 
                accept="image/*" 
                capture="user" 
                ref={fileInputRef} 
                onChange={handlePhotoCapture} 
                hidden 
              />
            </div>

            {/* Location Section */}
            <div className={`location-status-card ${location ? "location-status-card--success" : "location-status-card--locating"}`}>
              <div className="flex items-center gap-3">
                <MapPin className={location ? "text-green-default" : "animate-pulse text-warning"} />
                <div>
                  <strong>{locating ? "Mencari Lokasi..." : location ? "Lokasi Terkunci" : "Lokasi Tidak Tersedia"}</strong>
                  <p className="text-xs">
                    {location ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}` : "Harap aktifkan GPS"}
                  </p>
                </div>
              </div>
              <button className="btn btn--secondary btn--small" onClick={fetchLocation} disabled={locating}>
                {locating ? <Loader2 className="animate-spin" size={14} /> : "Refresh"}
              </button>
            </div>

            {/* Form Section */}
            <div className="field-grid">
              <label className="field">
                <span>Pilih Tugas (Opsional)</span>
                <select value={selectedJobId} onChange={(e) => setSelectedJobId(e.target.value)}>
                  <option value="">Status Umum / Standby</option>
                  {(jobsQuery.data || []).map(job => (
                    <option key={job.id} value={job.id}>{job.number} - {job.title}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Catatan</span>
                <textarea 
                  placeholder="Contoh: Mulai shift pagi, atau izin telat 10 menit..." 
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </label>
            </div>

            <AnimatePresence>
              {feedback && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className={`feedback-alert feedback-alert--${feedback.type}`}
                >
                  {feedback.type === "success" ? <CheckCircle2 size={18} /> : <Info size={18} />}
                  <span>{feedback.message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="attendance-main-actions">
              {!isCheckedIn ? (
                <button 
                  className="btn btn--primary btn--xl btn--block" 
                  onClick={() => handleCheckAction("in")}
                  disabled={checkInMutation.isPending || locating}
                >
                  {checkInMutation.isPending ? "Memproses..." : "CHECK-IN SEKARANG"}
                </button>
              ) : (
                <button 
                  className="btn btn--danger btn--xl btn--block" 
                  onClick={() => handleCheckAction("out")}
                  disabled={checkOutMutation.isPending || locating}
                >
                  {checkOutMutation.isPending ? "Memproses..." : "CHECK-OUT / SELESAI"}
                </button>
              )}
            </div>
          </div>
        </SectionCard>
      </motion.div>

    </div>
  );
}

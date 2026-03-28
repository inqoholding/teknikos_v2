import { useEffect, useRef, useState } from "react";
import { getErrorMessage } from "../api/client";
import { useTechnicianSelfQuery, useTechnicianCheckInMutation, useTechnicianCheckOutMutation, useJobsQuery, useSessionQuery, useTechniciansQuery } from "../api/hooks";
import { Badge, EmptyState, SectionCard } from "../components/UI";
import { PageError, PageLoader } from "../components/PageState";
import { Camera, MapPin, CheckCircle2, XCircle, Loader2, Info, Users, Monitor, ExternalLink, CalendarDays } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AttendancePage() {
  const sessionQuery = useSessionQuery();
  const user = sessionQuery.data?.user;
  const isTechnician = user?.role === "technician";

  if (isTechnician) {
    return <TechnicianAttendanceView />;
  }

  return <OwnerAttendanceMonitoring />;
}

function OwnerAttendanceMonitoring() {
  const techsQuery = useTechniciansQuery();

  if (techsQuery.isLoading) return <PageLoader title="Memuat data absensi teknisi..." />;
  if (techsQuery.error) return <PageError message={getErrorMessage(techsQuery.error)} />;

  const techs = techsQuery.data || [];
  const activeTechs = techs.filter(t => t.attendanceStatus === "Sudah Check-in");

  return (
    <div className="page-stack">
      <div className="attendance-monitoring-header">
        <SectionCard title="Monitoring Kehadiran Live" description="Pantau status, lokasi, dan foto check-in teknisi di lapangan secara real-time.">
          <div className="monitoring-stats">
            <div className="monitoring-stat">
              <span>Teknisi Aktif</span>
              <strong>{activeTechs.length}</strong>
              <small>Dari total {techs.length} teknisi</small>
            </div>
            <div className="monitoring-stat">
              <span>Sinkronisasi Live</span>
              <strong>{new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</strong>
              <small>Status teknisi diperbarui setiap saat</small>
            </div>
          </div>
        </SectionCard>
      </div>

      <div className="monitoring-grid">
        {techs.length > 0 ? (
          techs.map((tech) => (
            <div key={tech.id} className={`monitoring-card ${tech.attendanceStatus === "Sudah Check-in" ? "monitoring-card--active" : ""}`}>
              <div className="monitoring-card__head">
                <div className="monitoring-card__user">
                  <div className="avatar avatar--small">{tech.name[0]}</div>
                  <div>
                    <strong>{tech.name}</strong>
                    <Badge tone={tech.attendanceStatus === "Sudah Check-in" ? "success" : "neutral"}>
                      {tech.attendanceStatus}
                    </Badge>
                  </div>
                </div>
                {tech.attendanceUpdatedAt && (
                  <span className="monitoring-card__time">
                    {new Date(tech.attendanceUpdatedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>

              <div className="monitoring-card__content">
                {tech.attendancePhotoUrl ? (
                  <div className="monitoring-card__photo">
                    <img src={tech.attendancePhotoUrl} alt={`Foto ${tech.name}`} />
                    <div className="photo-overlay">
                      <CheckCircle2 size={14} />
                      <span>Verified Photo</span>
                    </div>
                  </div>
                ) : (
                  <div className="monitoring-card__photo-placeholder">
                    <Camera size={24} />
                    <span>Belum ada foto</span>
                  </div>
                )}

                <div className="monitoring-card__info">
                  <div className="info-row">
                    <MapPin size={14} className="text-muted" />
                    {tech.attendanceLatitude && tech.attendanceLongitude ? (
                      <a 
                        href={`https://www.google.com/maps?q=${tech.attendanceLatitude},${tech.attendanceLongitude}`} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="location-link"
                      >
                        Lihat di Maps <ExternalLink size={12} />
                      </a>
                    ) : (
                      <span className="text-muted">Lokasi tidak tersedia</span>
                    )}
                  </div>
                  <div className="info-row">
                    <Info size={14} className="text-muted" />
                    <p className="note-text">{tech.attendanceNote || "Tidak ada catatan"}</p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState 
            title="Belum ada data teknisi" 
            description="Daftarkan teknisi Anda terlebih dahulu untuk memantau kehadiran mereka."
          />
        )}
      </div>
    </div>
  );
}

function TechnicianAttendanceView() {
  const technicianQuery = useTechnicianSelfQuery();
  const checkInMutation = useTechnicianCheckInMutation();
  const checkOutMutation = useTechnicianCheckOutMutation();
  const jobsQuery = useJobsQuery({ status: "in_progress" });
  
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

╔══════════════════════════════════════════════════════════════════╗
║     TEKNIKOS — WAHA WHATSAPP INTEGRATION PROMPT (CODEX)         ║
╚══════════════════════════════════════════════════════════════════╝

Dokumen ini berisi prompt lengkap untuk membangun integrasi WhatsApp
menggunakan WAHA (self-hosted WhatsApp HTTP API) ke dalam Coreveta.

WAHA Docs: https://waha.devlike.pro
WAHA GitHub: https://github.com/devlikeapro/waha

═══════════════════════════════════════════════════════════════════
ARSITEKTUR WAHA DI TEKNIKOS
═══════════════════════════════════════════════════════════════════

Setiap pemilik bisnis menghubungkan NOMOR WA MEREKA SENDIRI.
Artinya: 1 bisnis = 1 WAHA session unik.

Flow:
  Owner scan QR di Settings Coreveta
        ↓
  Coreveta backend buat WAHA session (nama = businessId)
        ↓
  Session tersimpan di WAHA server (Docker)
        ↓
  Semua notif dikirim DARI nomor WA milik owner itu

Infrastructure:
  Coreveta Backend  ←→  WAHA Docker (port 3001 internal)
                              ↕
                    WhatsApp servers (via WA Web protocol)

═══════════════════════════════════════════════════════════════════
PROMPT 1 — DOCKER COMPOSE SETUP (Infrastructure)
═══════════════════════════════════════════════════════════════════

Create a docker-compose.yml at the project root that runs both
Coreveta backend and WAHA together:

```yaml
# docker-compose.yml
version: "3.8"

services:
  waha:
    image: devlikeapro/waha
    container_name: teknikos-waha
    restart: unless-stopped
    ports:
      - "3002:3000"   # WAHA Swagger UI + API on host port 3002
    environment:
      - WAHA_API_KEY=${WAHA_API_KEY}
      - WHATSAPP_DEFAULT_ENGINE=NOWEB
      - WAHA_DASHBOARD_ENABLED=true
      - WAHA_DASHBOARD_USERNAME=${WAHA_DASHBOARD_USERNAME:-admin}
      - WAHA_DASHBOARD_PASSWORD=${WAHA_DASHBOARD_PASSWORD:-admin}
      - WHATSAPP_HOOK_URL=http://backend:3001/api/whatsapp/webhook
      - WHATSAPP_HOOK_EVENTS=session.status,message
      - WHATSAPP_HOOK_HMAC_KEY=${WAHA_WEBHOOK_SECRET}
    volumes:
      - ./waha-sessions:/app/.sessions
    networks:
      - teknikos-net

  backend:
    build: ./backend
    container_name: teknikos-backend
    restart: unless-stopped
    ports:
      - "3001:3001"
    env_file:
      - ./backend/.env
    environment:
      - WAHA_URL=http://waha:3000
    depends_on:
      - waha
    networks:
      - teknikos-net

networks:
  teknikos-net:
    driver: bridge
```

Also add to backend/.env.example:
```
WAHA_URL=http://localhost:3002
WAHA_API_KEY=ganti-dengan-api-key-waha-yang-panjang
WAHA_WEBHOOK_SECRET=ganti-dengan-secret-hmac-yang-panjang
```

═══════════════════════════════════════════════════════════════════
PROMPT 2 — WAHA SERVICE (Backend Library)
═══════════════════════════════════════════════════════════════════

Create file: backend/src/lib/waha.js

This is the core WAHA client that wraps all WAHA API calls.
Coreveta uses one WAHA session per business (session name = businessId).

```javascript
// backend/src/lib/waha.js
import "dotenv/config";

const WAHA_URL = process.env.WAHA_URL || "http://localhost:3002";
const WAHA_API_KEY = process.env.WAHA_API_KEY || "";

// Base fetch wrapper with auth header
async function wahaFetch(path, options = {}) {
  const res = await fetch(`${WAHA_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": WAHA_API_KEY,
      ...options.headers,
    },
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`WAHA error ${res.status}: ${err}`);
  }

  // 204 No Content — return null
  if (res.status === 204) return null;
  return res.json();
}

// ─── Session Management ───────────────────────────────────────────────────────

/**
 * Create and start a new WAHA session for a business.
 * Session name = businessId (unique per business).
 * After calling this, poll getSessionQR() to get the QR code for owner to scan.
 */
export async function createSession(businessId, webhookUrl) {
  return wahaFetch("/api/sessions", {
    method: "POST",
    body: JSON.stringify({
      name: businessId,
      config: {
        webhooks: webhookUrl
          ? [
              {
                url: webhookUrl,
                events: ["session.status"],
                hmac: { key: process.env.WAHA_WEBHOOK_SECRET },
              },
            ]
          : [],
      },
    }),
  });
}

/**
 * Start an existing session (if stopped).
 */
export async function startSession(businessId) {
  return wahaFetch(`/api/sessions/${businessId}/start`, { method: "POST" });
}

/**
 * Stop a session (disconnect WA, keep session data).
 */
export async function stopSession(businessId) {
  return wahaFetch(`/api/sessions/${businessId}/stop`, { method: "POST" });
}

/**
 * Delete a session permanently (owner disconnects WA from Coreveta).
 */
export async function deleteSession(businessId) {
  return wahaFetch(`/api/sessions/${businessId}`, { method: "DELETE" });
}

/**
 * Get current session status.
 * Returns: { name, status: "STOPPED"|"STARTING"|"SCAN_QR_CODE"|"WORKING"|"FAILED" }
 */
export async function getSessionStatus(businessId) {
  try {
    return await wahaFetch(`/api/sessions/${businessId}`);
  } catch {
    return null;
  }
}

/**
 * Get QR code as base64 image string.
 * Only available when session status is SCAN_QR_CODE.
 * Returns: { value: "data:image/png;base64,..." }
 */
export async function getSessionQR(businessId) {
  return wahaFetch(`/api/${businessId}/auth/qr?format=image`, {
    headers: { Accept: "application/json" },
  });
}

/**
 * Logout session (force disconnect, owner needs to scan again).
 */
export async function logoutSession(businessId) {
  return wahaFetch(`/api/sessions/${businessId}/logout`, { method: "POST" });
}

// ─── Send Messages ────────────────────────────────────────────────────────────

/**
 * Format phone number to WAHA chatId format.
 * Input: "08123456789" or "+6281234567890"
 * Output: "6281234567890@c.us"
 */
export function formatChatId(phone) {
  // Remove all non-digits
  let digits = phone.replace(/\D/g, "");

  // Convert Indonesian local format (08xxx) to international (628xxx)
  if (digits.startsWith("0")) {
    digits = "62" + digits.slice(1);
  }

  // Add @c.us suffix required by WAHA
  return `${digits}@c.us`;
}

/**
 * Send a text message from the business's WA session.
 *
 * @param {string} businessId - The session name (= businessId)
 * @param {string} phone - Recipient phone number (any format)
 * @param {string} message - Text message content
 */
export async function sendText(businessId, phone, message) {
  const chatId = formatChatId(phone);
  return wahaFetch("/api/sendText", {
    method: "POST",
    body: JSON.stringify({
      session: businessId,
      chatId,
      text: message,
    }),
  });
}

/**
 * Send a message with reply button (WAHA Plus only, fallback to text in Core).
 */
export async function sendTextSafe(businessId, phone, message) {
  try {
    return await sendText(businessId, phone, message);
  } catch (err) {
    console.error(`[WAHA] Failed to send to ${phone}:`, err.message);
    // Don't throw — WA notification failure shouldn't break the main flow
    return null;
  }
}

// ─── Message Templates ────────────────────────────────────────────────────────

/**
 * Notify technician about a new assigned job.
 */
export function buildJobAssignedMessage({ jobNumber, customerName, address, scheduledAt, jobType, notes }) {
  const time = scheduledAt
    ? new Date(scheduledAt).toLocaleString("id-ID", {
        weekday: "long",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "Segera";

  const typeLabel = { ac: "Servis AC", plumber: "Plumber", listrik: "Listrik", other: "Lainnya" }[jobType] || jobType;

  return `📋 *Job Baru Ditugaskan*

*No Job:* ${jobNumber}
*Jenis:* ${typeLabel}
*Pelanggan:* ${customerName}
*Alamat:* ${address || "-"}
*Jadwal:* ${time}
${notes ? `*Catatan:* ${notes}` : ""}

Buka aplikasi Coreveta untuk detail lebih lanjut.`;
}

/**
 * Notify owner when technician updates job status.
 */
export function buildStatusUpdateMessage({ jobNumber, technicianName, newStatus, customerName }) {
  const statusLabel = {
    on_the_way:  "🚗 Dalam perjalanan ke lokasi",
    in_progress: "🔧 Sedang mengerjakan",
    done:        "✅ Pekerjaan selesai",
    cancelled:   "❌ Job dibatalkan",
  }[newStatus] || newStatus;

  return `*Update Job ${jobNumber}*

${statusLabel}

*Teknisi:* ${technicianName}
*Pelanggan:* ${customerName}

Lihat detail di dashboard Coreveta.`;
}

/**
 * Send invoice summary to customer.
 */
export function buildInvoiceMessage({ invoiceNumber, businessName, customerName, items, total, dueAt }) {
  const formattedTotal = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(total);

  const dueDate = dueAt
    ? new Date(dueAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
    : "-";

  const itemLines = items
    .map((i) => `  • ${i.name}: ${new Intl.NumberFormat("id-ID").format(i.unitPrice * i.quantity)}`)
    .join("\n");

  return `🧾 *Invoice dari ${businessName}*

Halo ${customerName},

Berikut tagihan untuk pekerjaan yang telah diselesaikan:

*No. Invoice:* ${invoiceNumber}
${itemLines}

*Total: ${formattedTotal}*
*Jatuh Tempo:* ${dueDate}

Terima kasih telah mempercayakan kepada kami! 🙏`;
}

/**
 * Remind customer about upcoming routine service.
 */
export function buildServiceReminderMessage({ businessName, customerName, scheduledAt, serviceType }) {
  const date = new Date(scheduledAt).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `⏰ *Pengingat Servis Rutin*

Halo ${customerName},

Jadwal servis *${serviceType}* Anda sudah dekat!

📅 *Tanggal:* ${date}
🏢 *Dari:* ${businessName}

Kami akan datang ke lokasi Anda sesuai jadwal.
Jika ingin reschedule, balas pesan ini.

Terima kasih! 🙏`;
}

/**
 * Alert owner about low inventory items.
 */
export function buildLowStockMessage({ businessName, items }) {
  const itemLines = items.map((i) => `  • ${i.name}: sisa ${i.stock} ${i.unit} (min: ${i.minStock})`).join("\n");

  return `📦 *Alert Stok Rendah — ${businessName}*

Item berikut perlu segera diisi ulang:

${itemLines}

Kelola stok di dashboard Coreveta.`;
}

/**
 * Alert owner about contracts expiring soon.
 */
export function buildContractExpiryMessage({ businessName, contracts }) {
  const lines = contracts
    .map((c) => {
      const expiry = new Date(c.endAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
      return `  • ${c.customerName} — habis ${expiry}`;
    })
    .join("\n");

  return `🔄 *Kontrak Akan Habis — ${businessName}*

Kontrak berikut akan expired dalam 30 hari:

${lines}

Segera hubungi pelanggan untuk renewal.
Kelola kontrak di dashboard Coreveta.`;
}
```

═══════════════════════════════════════════════════════════════════
PROMPT 3 — WHATSAPP ROUTES (Backend API)
═══════════════════════════════════════════════════════════════════

Create file: backend/src/routes/whatsapp.js

This file handles:
1. Owner connects/disconnects their WA
2. QR code polling endpoint (frontend polls this)
3. Session status endpoint
4. Webhook receiver from WAHA
5. Manual send message endpoints

```javascript
// backend/src/routes/whatsapp.js
import { Router } from "express";
import crypto from "crypto";
import { eq } from "drizzle-orm";
import { db } from "../db/index.js";
import { businesses, jobs, technicians, customers, invoices } from "../db/schema.js";
import { requireAuth, requireBusiness } from "../middleware/auth.js";
import {
  createSession, startSession, stopSession, deleteSession,
  getSessionStatus, getSessionQR, logoutSession,
  sendTextSafe, buildJobAssignedMessage, buildStatusUpdateMessage,
  buildInvoiceMessage, buildLowStockMessage
} from "../lib/waha.js";

const router = Router();

// ─── WAHA Webhook receiver (called by WAHA, NOT by frontend) ─────────────────
// WAHA calls this when session.status changes (QR ready, connected, disconnected)
router.post("/webhook", async (req, res) => {
  // Verify HMAC signature from WAHA
  const hmacHeader = req.headers["x-webhook-hmac"];
  const secret = process.env.WAHA_WEBHOOK_SECRET;

  if (secret && hmacHeader) {
    const body = JSON.stringify(req.body);
    const expected = crypto
      .createHmac("sha512", secret)
      .update(body)
      .digest("hex");

    if (hmacHeader !== expected) {
      return res.status(401).json({ error: "Invalid HMAC signature" });
    }
  }

  const { event, session: businessId, payload } = req.body;

  // Log for debugging
  console.log(`[WAHA Webhook] event=${event} session=${businessId}`, payload?.status);

  if (event === "session.status" && businessId) {
    // Update WA connection status in businesses table
    await db
      .update(businesses)
      .set({ waStatus: payload?.status || "UNKNOWN" })
      .where(eq(businesses.id, businessId))
      .catch(console.error);
  }

  // Always respond 200 quickly
  res.status(200).json({ ok: true });
});

// All routes below require authentication
router.use(requireAuth, requireBusiness);

// ─── GET /api/whatsapp/status ─────────────────────────────────────────────────
// Frontend polls this to show connection status + QR code
router.get("/status", async (req, res) => {
  try {
    const session = await getSessionStatus(req.business.id);

    if (!session) {
      return res.json({
        connected: false,
        status: "NOT_STARTED",
        qr: null,
      });
    }

    let qr = null;
    if (session.status === "SCAN_QR_CODE") {
      try {
        const qrData = await getSessionQR(req.business.id);
        qr = qrData?.value || null; // base64 image string
      } catch {
        // QR fetch failed, will retry on next poll
      }
    }

    res.json({
      connected: session.status === "WORKING",
      status: session.status, // STOPPED | STARTING | SCAN_QR_CODE | WORKING | FAILED
      qr,
      phone: session.me?.id?.replace("@c.us", "") || null,
      pushName: session.me?.pushName || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/whatsapp/connect ───────────────────────────────────────────────
// Owner clicks "Hubungkan WhatsApp" in Settings
router.post("/connect", async (req, res) => {
  try {
    const webhookUrl = `${process.env.BETTER_AUTH_URL}/api/whatsapp/webhook`;

    // Try to start existing session first, create if doesn't exist
    const existing = await getSessionStatus(req.business.id);

    if (!existing) {
      await createSession(req.business.id, webhookUrl);
    } else if (existing.status === "STOPPED" || existing.status === "FAILED") {
      await startSession(req.business.id);
    }

    res.json({
      message: "Sesi WhatsApp dimulai. Scan QR code yang muncul.",
      status: "STARTING",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/whatsapp/disconnect ────────────────────────────────────────────
// Owner clicks "Putuskan WhatsApp" in Settings
router.post("/disconnect", async (req, res) => {
  try {
    await logoutSession(req.business.id);
    await stopSession(req.business.id);

    await db
      .update(businesses)
      .set({ waStatus: "STOPPED" })
      .where(eq(businesses.id, req.business.id));

    res.json({ message: "WhatsApp berhasil diputuskan." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/whatsapp/send-test ─────────────────────────────────────────────
// Send a test message to verify connection is working
router.post("/send-test", async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone) return res.status(400).json({ error: "Nomor WA wajib diisi" });

    const result = await sendTextSafe(
      req.business.id,
      phone,
      `✅ *Koneksi Coreveta × WhatsApp Berhasil!*\n\nNomor ini sudah terhubung ke Coreveta.\nBisnis: *${req.business.name}*`
    );

    if (result) {
      res.json({ message: "Pesan test berhasil dikirim!", result });
    } else {
      res.status(503).json({ error: "Gagal kirim pesan. Pastikan WA sudah terhubung." });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/whatsapp/send-invoice/:invoiceId ───────────────────────────────
// Owner clicks "Kirim Invoice via WA" on invoice page
router.post("/send-invoice/:invoiceId", async (req, res) => {
  try {
    const [invoice] = await db
      .select({ invoice: invoices, customer: customers })
      .from(invoices)
      .leftJoin(customers, eq(invoices.customerId, customers.id))
      .where(eq(invoices.id, req.params.invoiceId))
      .limit(1);

    if (!invoice) return res.status(404).json({ error: "Invoice tidak ditemukan" });
    if (!invoice.customer?.phone) return res.status(400).json({ error: "Nomor WA pelanggan tidak tersedia" });

    const message = buildInvoiceMessage({
      invoiceNumber: invoice.invoice.invoiceNumber,
      businessName: req.business.name,
      customerName: invoice.customer.name,
      items: [],  // TODO: join with job_items
      total: invoice.invoice.total,
      dueAt: invoice.invoice.dueAt,
    });

    await sendTextSafe(req.business.id, invoice.customer.phone, message);

    // Update invoice status to "sent"
    await db.update(invoices)
      .set({ status: "sent" })
      .where(eq(invoices.id, req.params.invoiceId));

    res.json({ message: "Invoice berhasil dikirim via WhatsApp" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
```

═══════════════════════════════════════════════════════════════════
PROMPT 4 — UPDATE DATABASE SCHEMA
═══════════════════════════════════════════════════════════════════

Add waStatus field to businesses table in backend/src/db/schema.js:

In the businesses sqliteTable, add this field after serviceTypes:

```javascript
waStatus: text("wa_status").notNull().default("STOPPED"),
// Possible values: STOPPED | STARTING | SCAN_QR_CODE | WORKING | FAILED
```

Also add this column to the CREATE TABLE SQL in initDb() inside
backend/src/db/index.js, in the businesses table creation:

```sql
wa_status TEXT NOT NULL DEFAULT 'STOPPED',
```

═══════════════════════════════════════════════════════════════════
PROMPT 5 — HOOK INTO JOBS ROUTES (Auto-send WA on job events)
═══════════════════════════════════════════════════════════════════

Update backend/src/routes/jobs.js to trigger WA notifications
automatically at key moments.

Add this import at the top of jobs.js:
```javascript
import { sendTextSafe, buildJobAssignedMessage, buildStatusUpdateMessage } from "../lib/waha.js";
```

1. In POST /jobs (create job) — after insert, if technicianId provided:
```javascript
// After job is created and technicianId is set
if (job.technicianId) {
  const [tech] = await db.select().from(technicians)
    .where(eq(technicians.id, job.technicianId)).limit(1);
  const [cust] = job.customerId
    ? await db.select().from(customers).where(eq(customers.id, job.customerId)).limit(1)
    : [null];

  if (tech?.phone) {
    await sendTextSafe(
      req.business.id,
      tech.phone,
      buildJobAssignedMessage({
        jobNumber: job.jobNumber,
        customerName: cust?.name || "Pelanggan",
        address: job.address,
        scheduledAt: job.scheduledAt,
        jobType: job.type,
        notes: job.notes,
      })
    );
  }
}
```

2. In PATCH /jobs/:id — when technicianId is first assigned (job goes from
   no technician to having one), send the same job assigned notification.
   Also when status changes to on_the_way/done, notify owner:

```javascript
// When technician is newly assigned
if (updates.technicianId && !existing.technicianId) {
  const [tech] = await db.select().from(technicians)
    .where(eq(technicians.id, updates.technicianId)).limit(1);
  const [cust] = existing.customerId
    ? await db.select().from(customers).where(eq(customers.id, existing.customerId)).limit(1)
    : [null];

  if (tech?.phone) {
    await sendTextSafe(
      req.business.id,
      tech.phone,
      buildJobAssignedMessage({
        jobNumber: existing.jobNumber,
        customerName: cust?.name || "Pelanggan",
        address: existing.address,
        scheduledAt: existing.scheduledAt,
        jobType: existing.type,
        notes: existing.notes,
      })
    );
  }
}

// When status changes to on_the_way or done — notify owner
const notifyOwnerStatuses = ["on_the_way", "done", "cancelled"];
if (updates.status && notifyOwnerStatuses.includes(updates.status) && existing.technicianId) {
  const [tech] = await db.select().from(technicians)
    .where(eq(technicians.id, existing.technicianId)).limit(1);
  const [ownerUser] = await db.select().from(user)
    .where(eq(user.id, req.business.ownerUserId)).limit(1);

  if (ownerUser?.phone) {
    await sendTextSafe(
      req.business.id,
      ownerUser.phone,
      buildStatusUpdateMessage({
        jobNumber: existing.jobNumber,
        technicianName: tech?.name || "Teknisi",
        newStatus: updates.status,
        customerName: "Pelanggan", // TODO: join with customers
      })
    );
  }
}
```

═══════════════════════════════════════════════════════════════════
PROMPT 6 — REGISTER ROUTE IN SERVER
═══════════════════════════════════════════════════════════════════

Update backend/src/index.js — add WhatsApp router:

Add this import after other route imports:
```javascript
import whatsappRouter from "./routes/whatsapp.js";
```

Add this BEFORE the requireAuth routes (webhook must be public):
```javascript
// WhatsApp webhook — must be before auth middleware
app.post("/api/whatsapp/webhook", express.raw({ type: "application/json" }), async (req, res, next) => {
  // Pass raw body to route for HMAC verification
  req.rawBody = req.body;
  req.body = JSON.parse(req.body.toString());
  next();
});

app.use("/api/whatsapp", whatsappRouter);
```

═══════════════════════════════════════════════════════════════════
PROMPT 7 — FRONTEND: WHATSAPP SETTINGS PAGE
═══════════════════════════════════════════════════════════════════

[In Paper: select your Settings → WhatsApp Integration frame]

Read the Settings frame from Paper using MCP get_selection and get_jsx.

Create file: frontend/src/pages/settings/WhatsAppSettingsPage.tsx

Build a Settings sub-page for WhatsApp integration with these sections:

SECTION 1 — CONNECTION STATUS CARD:
- Poll GET /api/whatsapp/status every 3 seconds using useQuery
  with refetchInterval: 3000
- Show different UI based on status:

  STATUS = "NOT_STARTED" or "STOPPED":
    - Icon: WA logo (gray)
    - Title: "WhatsApp Belum Terhubung"
    - Description: "Hubungkan nomor WA bisnis Anda untuk aktifkan notifikasi otomatis"
    - Button: "Hubungkan WhatsApp" → calls POST /api/whatsapp/connect
      then start polling for QR

  STATUS = "STARTING":
    - Spinner animation
    - Text: "Mempersiapkan koneksi WhatsApp..."

  STATUS = "SCAN_QR_CODE":
    - Show QR code image (base64 from status.qr field)
    - QR image: 240×240px, centered, border rounded-xl
    - Instruction: "Buka WhatsApp di HP Anda → Titik tiga → Perangkat tertaut → Tautkan perangkat"
    - Small text: "QR code akan refresh otomatis setiap 30 detik"
    - Spinner below QR with text "Menunggu scan..."
    - Button: "Batal" → calls POST /api/whatsapp/disconnect

  STATUS = "WORKING":
    - Green dot indicator (animated pulse)
    - Icon: WA logo (green)
    - Title: "WhatsApp Terhubung ✓"
    - Subtitle: "Nomor: {status.phone}" formatted as Indonesian number
    - Subtitle: "Nama: {status.pushName}"
    - Button: "Kirim Pesan Test" → opens modal
    - Button (danger): "Putuskan" → confirm dialog → POST /api/whatsapp/disconnect

  STATUS = "FAILED":
    - Red icon
    - Title: "Koneksi Gagal"
    - Button: "Coba Lagi" → POST /api/whatsapp/connect

SECTION 2 — NOTIFICATION SETTINGS (only show if WORKING):
Card with toggle switches for each notification type:
  ✅ Notifikasi job baru ke teknisi (always on, cannot disable)
  ✅ Update status job ke owner (toggle)
  ✅ Kirim invoice ke pelanggan (toggle)
  ⚙ Reminder servis rutin (toggle + "Konfigurasi" link)
  ⚙ Alert stok rendah (toggle)
  ⚙ Alert renewal kontrak (toggle)

Each toggle uses PATCH /api/business/me to save settings to
business.waSettings JSON field.

SECTION 3 — SEND TEST MESSAGE MODAL:
- Input: nomor WA tujuan test (pre-fill with owner phone)
- Button: "Kirim Test" → POST /api/whatsapp/send-test { phone }
- Show success/error toast

IMPLEMENTATION:

```typescript
// src/pages/settings/WhatsAppSettingsPage.tsx
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { api } from "../../api/client"

interface WAStatus {
  connected: boolean
  status: "NOT_STARTED" | "STOPPED" | "STARTING" | "SCAN_QR_CODE" | "WORKING" | "FAILED"
  qr: string | null
  phone: string | null
  pushName: string | null
}

export default function WhatsAppSettingsPage() {
  const qc = useQueryClient()

  // Poll status every 3 seconds
  const { data: waStatus, isLoading } = useQuery<{ data: WAStatus }>({
    queryKey: ["whatsapp-status"],
    queryFn: () => api.get("/api/whatsapp/status"),
    refetchInterval: 3000,  // Poll every 3 seconds for QR updates
    refetchIntervalInBackground: false,
  })

  const connectMutation = useMutation({
    mutationFn: () => api.post("/api/whatsapp/connect"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp-status"] }),
  })

  const disconnectMutation = useMutation({
    mutationFn: () => api.post("/api/whatsapp/disconnect"),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp-status"] }),
  })

  const testMutation = useMutation({
    mutationFn: (phone: string) => api.post("/api/whatsapp/send-test", { phone }),
  })

  const status = waStatus?.data

  // Render based on status...
  // (implement the UI described in SECTION 1-3 above)
}
```

Match exact layout from Paper frame. Use lucide-react icons.
QR code: render as <img src={status.qr} /> since it's base64.
Polling: useQuery refetchInterval handles the 3-second polling automatically.

═══════════════════════════════════════════════════════════════════
PROMPT 8 — FRONTEND: WA BUTTON DI JOB DETAIL PAGE
═══════════════════════════════════════════════════════════════════

Update frontend/src/pages/jobs/JobDetailPage.tsx

In the right action panel, add these WhatsApp action buttons
(only show if waStatus === "WORKING"):

1. When job status is "pending" or "assigned":
   Button: [WA icon] "Kirim Detail ke Teknisi"
   → Calls POST /api/jobs/:id with a body flag, or a dedicated endpoint
   → Shows success toast "Notifikasi terkirim ke {technicianName}"

2. When job status is "done":
   Button: [WA icon] "Kirim Invoice ke Pelanggan" (green, prominent)
   → Creates invoice if not exists, then calls POST /api/whatsapp/send-invoice/:invoiceId
   → Shows success toast "Invoice terkirim ke {customerPhone}"

3. Status badge next to customer name:
   If customer has WA history (previous messages sent), show small
   green WA icon badge

Add these imports:
```typescript
import { useQuery } from "@tanstack/react-query"
const { data: waStatus } = useQuery({
  queryKey: ["whatsapp-status"],
  queryFn: () => api.get("/api/whatsapp/status"),
  staleTime: 30000, // don't refetch too often on job detail page
})
const isWAConnected = waStatus?.data?.connected === true
```

═══════════════════════════════════════════════════════════════════
PROMPT 9 — FRONTEND: WA STATUS INDICATOR DI SIDEBAR
═══════════════════════════════════════════════════════════════════

Update frontend/src/components/layout/AppLayout.tsx

At the bottom of the sidebar, below the user info, add a small
WA connection status indicator:

```tsx
// At bottom of sidebar, above logout button
const { data: waStatus } = useQuery({
  queryKey: ["whatsapp-status"],
  queryFn: () => api.get("/api/whatsapp/status"),
  refetchInterval: 30000, // check every 30s in background
  staleTime: 20000,
})

const isConnected = waStatus?.data?.connected

return (
  <div
    className="flex items-center gap-2 px-3 py-2 rounded-xl cursor-pointer hover:bg-gray-50 mx-2"
    onClick={() => navigate("/settings/whatsapp")}
    title={isConnected ? "WhatsApp Terhubung" : "WhatsApp Belum Terhubung"}
  >
    <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-gray-300"}`} />
    <span className="text-xs text-text-muted">
      {isConnected ? `WA: ${waStatus?.data?.phone?.slice(-4)}` : "WA: Tidak aktif"}
    </span>
  </div>
)
```

═══════════════════════════════════════════════════════════════════
WAHA ENDPOINT REFERENCE (untuk developer)
═══════════════════════════════════════════════════════════════════

Base URL: http://localhost:3002 (atau sesuai WAHA_URL di .env)
Auth: X-Api-Key header

SESSION MANAGEMENT:
  POST   /api/sessions              — Create & start session
  GET    /api/sessions              — List all sessions
  GET    /api/sessions/{name}       — Get session status
  POST   /api/sessions/{name}/start — Start stopped session
  POST   /api/sessions/{name}/stop  — Stop session
  DELETE /api/sessions/{name}       — Delete session permanently
  POST   /api/sessions/{name}/logout — Logout (force QR scan again)

AUTH / QR CODE:
  GET    /api/{session}/auth/qr?format=image  — Get QR as base64 PNG
  GET    /api/{session}/auth/qr?format=raw    — Get QR raw data

SEND MESSAGES:
  POST   /api/sendText    — Send text message
  POST   /api/sendImage   — Send image
  POST   /api/sendFile    — Send document/file
  POST   /api/sendVoice   — Send voice message

REQUEST BODY for sendText:
  {
    "session": "businessId",
    "chatId": "62812345678@c.us",
    "text": "pesan kamu di sini"
  }

PHONE FORMAT:
  Indonesian: 08123456789 → 628123456789@c.us
  Always use international format without + prefix
  Append @c.us for individual chats

SESSION STATUS VALUES:
  STOPPED      — session not running
  STARTING     — session is initializing
  SCAN_QR_CODE — QR ready, waiting for owner to scan
  WORKING      — connected and ready to send
  FAILED       — error, needs restart or logout

ENGINES (set via WHATSAPP_DEFAULT_ENGINE):
  WEBJS  — Chromium-based, most stable, ~200MB RAM per session
  NOWEB  — WebSocket-based, lighter, ~50MB per session (recommended)
  GOWS   — Go-based, fastest, best for 100+ sessions (Plus only)

═══════════════════════════════════════════════════════════════════
DOCKER COMMANDS (Quick Reference)
═══════════════════════════════════════════════════════════════════

# Start everything
docker compose up -d

# View WAHA logs
docker compose logs -f waha

# Open WAHA Dashboard (manage sessions visually)
open http://localhost:3002/dashboard

# Open WAHA Swagger UI (test API directly)
open http://localhost:3002

# Stop WAHA only
docker compose stop waha

# Restart WAHA (if session issues)
docker compose restart waha

# See active sessions
curl -H "X-Api-Key: $WAHA_API_KEY" http://localhost:3002/api/sessions

═══════════════════════════════════════════════════════════════════
ENVIRONMENT VARIABLES LENGKAP
═══════════════════════════════════════════════════════════════════

# backend/.env (tambahan untuk WAHA)
WAHA_URL=http://localhost:3002
WAHA_API_KEY=generated-random-string-min-32-chars
WAHA_WEBHOOK_SECRET=another-random-string-for-hmac-verification

# Generate random strings:
# node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

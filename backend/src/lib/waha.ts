import { env } from "./env.js";

const WAHA_URL = env.WAHA_URL?.replace(/\/$/, "") ?? "";
const WAHA_API_KEY = env.WAHA_API_KEY ?? "";
const WAHA_SESSION_NAME = env.WAHA_SESSION_NAME;

export type WahaSessionInfo = {
  name: string;
  status: string;
  engine?: string;
  me?: {
    id?: string;
    pushName?: string;
  } | null;
};

export type WahaQrResponse = {
  value: string;
};

class WahaRequestError extends Error {
  statusCode: number;

  constructor(statusCode: number, message: string) {
    super(message);
    this.name = "WAHA_REQUEST_ERROR";
    this.statusCode = statusCode;
  }
}

function ensureConfigured() {
  if (!WAHA_URL || !WAHA_API_KEY) {
    throw new Error("Integrasi WAHA belum dikonfigurasi di server.");
  }
}

async function wahaFetch<T>(path: string, init: RequestInit = {}) {
  ensureConfigured();
  const response = await fetch(`${WAHA_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": WAHA_API_KEY,
      ...init.headers,
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new WahaRequestError(response.status, body || `WAHA error ${response.status}`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return (await response.json()) as T;
}

function getSessionName(businessId: string) {
  return WAHA_SESSION_NAME || businessId;
}

export function isWahaConfigured() {
  return Boolean(WAHA_URL && WAHA_API_KEY);
}

export function isWahaNotFound(error: unknown) {
  return error instanceof WahaRequestError && error.statusCode === 404;
}

export async function getWahaSession(businessId: string) {
  try {
    return await wahaFetch<WahaSessionInfo>(`/api/sessions/${getSessionName(businessId)}`);
  } catch (error) {
    if (isWahaNotFound(error)) {
      return null;
    }
    throw error;
  }
}

export async function createOrStartWahaSession(businessId: string) {
  const sessionName = getSessionName(businessId);
  const existing = await getWahaSession(businessId);

  if (!existing) {
    return await wahaFetch<WahaSessionInfo>("/api/sessions", {
      method: "POST",
      body: JSON.stringify({
        name: sessionName,
        start: true,
      }),
    });
  }

  if (existing.status === "STOPPED" || existing.status === "FAILED") {
    return await wahaFetch<WahaSessionInfo>(`/api/sessions/${sessionName}/start`, {
      method: "POST",
    });
  }

  return existing;
}

export async function getWahaQrCode(businessId: string) {
  ensureConfigured();
  const response = await fetch(`${WAHA_URL}/api/${getSessionName(businessId)}/auth/qr?format=image`, {
    headers: {
      "X-Api-Key": WAHA_API_KEY,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new WahaRequestError(response.status, body || `WAHA error ${response.status}`);
  }

  const contentType = response.headers.get("content-type") || "image/png";
  if (contentType.includes("application/json")) {
    const payload = (await response.json()) as { mimetype?: string; data?: string; value?: string };
    if (payload.value) {
      return { value: payload.value } satisfies WahaQrResponse;
    }

    if (payload.data) {
      return {
        value: `data:${payload.mimetype || "image/png"};base64,${payload.data}`,
      } satisfies WahaQrResponse;
    }
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  return {
    value: `data:${contentType};base64,${buffer.toString("base64")}`,
  } satisfies WahaQrResponse;
}

export async function disconnectWahaSession(businessId: string) {
  try {
    await wahaFetch(`/api/sessions/${getSessionName(businessId)}`, {
      method: "DELETE",
    });
  } catch (error) {
    if (!isWahaNotFound(error)) {
      throw error;
    }
  }
}

export function formatWahaChatId(phone: string) {
  let digits = phone.replace(/\D/g, "");

  if (digits.startsWith("0")) {
    digits = `62${digits.slice(1)}`;
  } else if (digits.startsWith("8")) {
    digits = `62${digits}`;
  }

  return `${digits}@c.us`;
}

export async function sendWahaText(businessId: string, phone: string, text: string) {
  return await wahaFetch("/api/sendText", {
    method: "POST",
    body: JSON.stringify({
      session: getSessionName(businessId),
      chatId: formatWahaChatId(phone),
      text,
    }),
  });
}

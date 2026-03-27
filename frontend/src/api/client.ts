import axios from "axios";
import type { ApiErrorPayload } from "./types";

export const CSRF_HEADER_NAME = "x-teknikos-csrf";
export const CSRF_HEADER_VALUE = "1";

function isLocalDevHostname(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname.endsWith(".local");
}

function alignLocalDevApiUrl(apiUrl: string) {
  if (typeof window === "undefined") {
    return apiUrl;
  }

  try {
    const parsed = new URL(apiUrl);
    const pageHostname = window.location.hostname.toLowerCase();
    const apiHostname = parsed.hostname.toLowerCase();

    if (isLocalDevHostname(pageHostname) && isLocalDevHostname(apiHostname) && pageHostname !== apiHostname) {
      parsed.hostname = pageHostname;
      return parsed.toString().replace(/\/$/, "");
    }
  } catch {
    return apiUrl;
  }

  return apiUrl;
}

function resolveApiUrl() {
  if (import.meta.env.VITE_API_URL) {
    return alignLocalDevApiUrl(import.meta.env.VITE_API_URL);
  }

  if (typeof window === "undefined") {
    return "http://localhost:3001";
  }

  return "";
}

export const API_URL = resolveApiUrl();

function normalizeApiPath(url?: string) {
  if (!url) return url;
  if (!API_URL) return url;
  if (!API_URL.endsWith("/api")) return url;
  if (!url.startsWith("/api/")) return url;
  return url.slice(4);
}

function resolveDirectBackendUrl() {
  if (typeof window === "undefined") {
    return "http://localhost:3001";
  }

  return `${window.location.protocol}//${window.location.hostname}:3001`;
}

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const method = config.method?.toUpperCase();
  config.url = normalizeApiPath(config.url);

  if (method && !["GET", "HEAD", "OPTIONS"].includes(method)) {
    config.headers.set(CSRF_HEADER_NAME, CSRF_HEADER_VALUE);
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as
      | (typeof error.config & { _teknikosRetried?: boolean })
      | undefined;
    const isNetworkError = !error.response;

    if (
      isNetworkError &&
      originalRequest &&
      !originalRequest._teknikosRetried &&
      typeof window !== "undefined" &&
      !import.meta.env.VITE_API_URL
    ) {
      originalRequest._teknikosRetried = true;
      originalRequest.baseURL = resolveDirectBackendUrl();
      return api.request(originalRequest);
    }

    const payload: ApiErrorPayload = {
      status: error.response?.status,
      error: error.response?.data?.error,
      message:
        error.response?.data?.message ??
        (isNetworkError ? "Tidak bisa terhubung ke server. Pastikan backend aktif dan alamat host benar." : error.message),
      details: error.response?.data?.details,
    };

    return Promise.reject(payload);
  },
);

export function getErrorMessage(error: unknown, fallback = "Terjadi kesalahan.") {
  if (typeof error === "object" && error && "message" in error && typeof error.message === "string") {
    return error.message;
  }

  return fallback;
}

export function isApiErrorStatus(error: unknown, status: number) {
  return typeof error === "object" && error !== null && "status" in error && error.status === status;
}

export function isMissingBusinessError(error: unknown) {
  return isApiErrorStatus(error, 403) || isApiErrorStatus(error, 404);
}

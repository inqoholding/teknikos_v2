import axios from "axios";
import type { ApiErrorPayload } from "./types";

function resolveApiUrl() {
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }

  if (typeof window === "undefined") {
    return "http://localhost:3001";
  }

  return "";
}

export const API_URL = resolveApiUrl();

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

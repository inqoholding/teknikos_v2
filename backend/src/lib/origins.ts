import os from "node:os";
import { env } from "./env.js";

function normalizeOrigin(origin: string) {
  try {
    const parsed = new URL(origin);
    parsed.hostname = parsed.hostname.toLowerCase();
    return parsed.origin;
  } catch {
    return origin;
  }
}

function getFrontendPort() {
  return new URL(env.FRONTEND_URL).port || "80";
}

function getFrontendProtocol() {
  return new URL(env.FRONTEND_URL).protocol;
}

function getCandidatePorts() {
  return Array.from(
    new Set([
      getFrontendPort(),
      "5173",
      "5174",
      "5175",
      "5176",
      "4173",
      "4174",
      "4175",
      "3000",
      "8080",
      "80",
      "443",
    ]),
  );
}

function isPrivateHostname(hostname: string) {
  return (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1" ||
    hostname.endsWith(".local") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("192.168.") ||
    /^172\.(1[6-9]|2\d|3[0-1])\./.test(hostname)
  );
}

export function getTrustedOrigins() {
  const protocol = getFrontendProtocol();
  const hostname = os.hostname().toLowerCase();
  const baseOrigins = [
    env.FRONTEND_URL,
  ];
  const origins = new Set<string>(baseOrigins.map(normalizeOrigin));
  const ports = getCandidatePorts();
  const hostnames = new Set<string>(["localhost", "127.0.0.1", hostname]);

  if (!hostname.endsWith(".local")) {
    hostnames.add(`${hostname}.local`);
  }

  const interfaces = os.networkInterfaces();
  for (const network of Object.values(interfaces)) {
    for (const address of network ?? []) {
      if (address.internal || address.family !== "IPv4") {
        continue;
      }

      hostnames.add(address.address);
    }
  }

  for (const currentHostname of hostnames) {
    for (const port of ports) {
      const normalizedPort =
        (protocol === "http:" && port === "80") || (protocol === "https:" && port === "443")
          ? ""
          : `:${port}`;
      origins.add(normalizeOrigin(`${protocol}//${currentHostname}${normalizedPort}`));
    }
  }

  return Array.from(origins);
}

export function isAllowedOrigin(origin?: string) {
  if (!origin) {
    return true;
  }

  try {
    const parsed = new URL(origin);
    if (getTrustedOrigins().includes(normalizeOrigin(origin))) {
      return true;
    }

    return ["http:", "https:"].includes(parsed.protocol) && isPrivateHostname(parsed.hostname);
  } catch {
    return false;
  }
}

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

function getFrontendOrigin() {
  return normalizeOrigin(env.FRONTEND_URL);
}

function getFrontendHostname() {
  return new URL(env.FRONTEND_URL).hostname.toLowerCase();
}

function isLocalDevHostname(hostname: string) {
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

function getLocalDevOrigins() {
  const frontendHostname = getFrontendHostname();
  if (!isLocalDevHostname(frontendHostname)) {
    return [];
  }

  const protocols = ["http:", "https:"];
  const hostnames = Array.from(new Set(["localhost", "127.0.0.1", frontendHostname]));
  const ports = ["80", "443", "3000", "5173", "5174", "5175", "5176", "4173", "4174", "4175"];
  const origins = new Set<string>();

  for (const protocol of protocols) {
    for (const hostname of hostnames) {
      for (const port of ports) {
        const withPort =
          (protocol === "http:" && port === "80") || (protocol === "https:" && port === "443")
            ? ""
            : `:${port}`;
        origins.add(normalizeOrigin(`${protocol}//${hostname}${withPort}`));
      }
    }
  }

  return Array.from(origins);
}

const TRUSTED_ORIGINS = new Set<string>([
  getFrontendOrigin(),
  "https://coreveta.com",
  "https://app.coreveta.com",
  ...getLocalDevOrigins(),
]);

export function getTrustedOrigins() {
  return Array.from(TRUSTED_ORIGINS);
}

export function isAllowedOrigin(origin?: string) {
  if (!origin) {
    return true;
  }

  return TRUSTED_ORIGINS.has(normalizeOrigin(origin));
}

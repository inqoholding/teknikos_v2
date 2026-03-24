import type { NextFunction, Request, Response } from "express";
import { isAllowedOrigin } from "./origins.js";

const CSRF_HEADER_NAME = "x-teknikos-csrf";
const CSRF_HEADER_VALUE = "1";
const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function extractOriginFromReferer(referer?: string) {
  if (!referer) {
    return null;
  }

  try {
    return new URL(referer).origin;
  } catch {
    return null;
  }
}

function hasTrustedOrigin(req: Request) {
  const origin = req.header("origin");
  const refererOrigin = extractOriginFromReferer(req.header("referer"));
  const candidateOrigin = origin || refererOrigin;

  if (!candidateOrigin) {
    return true;
  }

  return isAllowedOrigin(candidateOrigin);
}

export function requireCsrf(req: Request, res: Response, next: NextFunction) {
  if (SAFE_METHODS.has(req.method.toUpperCase())) {
    next();
    return;
  }

  const hasCsrfHeader = req.header(CSRF_HEADER_NAME) === CSRF_HEADER_VALUE;

  if (!hasCsrfHeader) {
    res.status(403).json({
      error: "CSRF_BLOCKED",
      message: "Permintaan ditolak karena token keamanan tidak valid.",
    });
    return;
  }

  if (!hasTrustedOrigin(req)) {
    res.status(403).json({
      error: "CSRF_BLOCKED",
      message: "Permintaan ditolak karena origin tidak diizinkan.",
    });
    return;
  }

  next();
}

export function requireCsrfForPaths(paths: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!paths.some((path) => req.path === path || req.path.startsWith(`${path}/`))) {
      next();
      return;
    }

    requireCsrf(req, res, next);
  };
}

export { CSRF_HEADER_NAME, CSRF_HEADER_VALUE };

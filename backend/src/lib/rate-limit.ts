import Database from "better-sqlite3";
import path from "node:path";
import type { NextFunction, Request, Response } from "express";
import { env } from "./env.js";

type RateLimitOptions = {
  id: string;
  windowMs: number;
  max: number;
  methods?: string[];
  paths?: string[];
  keyFn?: (req: Request) => string;
};

type HitEntry = {
  count: number;
  resetAt: number;
};

const rateLimitDbPath = path.join(path.dirname(env.DATABASE_URL), "rate-limit.sqlite");
const sqlite = new Database(rateLimitDbPath);

sqlite.pragma("journal_mode = WAL");
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS rate_limits (
    namespace TEXT NOT NULL,
    key TEXT NOT NULL,
    count INTEGER NOT NULL,
    reset_at INTEGER NOT NULL,
    PRIMARY KEY (namespace, key)
  )
`);

const selectStmt = sqlite.prepare<[string, string], HitEntry | undefined>(
  "SELECT count, reset_at as resetAt FROM rate_limits WHERE namespace = ? AND key = ?",
);
const upsertStmt = sqlite.prepare(
  `
    INSERT INTO rate_limits (namespace, key, count, reset_at)
    VALUES (?, ?, ?, ?)
    ON CONFLICT(namespace, key) DO UPDATE SET
      count = excluded.count,
      reset_at = excluded.reset_at
  `,
);
const deleteExpiredStmt = sqlite.prepare("DELETE FROM rate_limits WHERE namespace = ? AND reset_at <= ?");

function getClientIp(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0]!.trim();
  }

  return req.ip || req.socket.remoteAddress || "unknown";
}

export function createRateLimitMiddleware(options: RateLimitOptions) {
  const methods = options.methods?.map((value) => value.toUpperCase());
  const paths = options.paths;

  return (req: Request, res: Response, next: NextFunction) => {
    if (methods && !methods.includes(req.method.toUpperCase())) {
      next();
      return;
    }

    if (paths && !paths.some((currentPath) => req.path === currentPath || req.path.startsWith(`${currentPath}/`))) {
      next();
      return;
    }

    const now = Date.now();
    const key = options.keyFn ? options.keyFn(req) : `${getClientIp(req)}:${req.path}`;

    deleteExpiredStmt.run(options.id, now);

    const current = selectStmt.get(options.id, key);
    if (!current || current.resetAt <= now) {
      upsertStmt.run(options.id, key, 1, now + options.windowMs);
      next();
      return;
    }

    if (current.count >= options.max) {
      const retryAfterSeconds = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
      res.setHeader("Retry-After", String(retryAfterSeconds));
      res.status(429).json({
        error: "RATE_LIMITED",
        message: "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.",
      });
      return;
    }

    upsertStmt.run(options.id, key, current.count + 1, current.resetAt);
    next();
  };
}

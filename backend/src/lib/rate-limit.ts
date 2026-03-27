import type { NextFunction, Request, Response } from "express";
import { getRedisClient } from "./redis.js";

type RateLimitOptions = {
  id: string;
  windowMs: number;
  max: number;
  methods?: string[];
  paths?: string[];
  keyFn?: (req: Request) => string;
};

function getClientIp(req: Request) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.trim()) {
    return forwarded.split(",")[0]!.trim();
  }

  return req.ip || req.socket.remoteAddress || "unknown";
}

function getRequestIdentity(req: Request) {
  const body = typeof req.body === "object" && req.body ? req.body as Record<string, unknown> : null;
  const query = typeof req.query === "object" && req.query ? req.query as Record<string, unknown> : null;
  const cookieHeader = typeof req.headers.cookie === "string" ? req.headers.cookie : "";

  const possibleValues = [
    body?.email,
    body?.requesterEmail,
    body?.businessId,
    body?.phone,
    query?.email,
    query?.businessId,
  ];

  for (const value of possibleValues) {
    if (typeof value === "string" && value.trim()) {
      return value.trim().toLowerCase();
    }
  }

  if (cookieHeader) {
    return cookieHeader
      .split(";")
      .map((part) => part.trim())
      .find((part) => part.startsWith("teknikos")) ?? "cookie-session";
  }

  return "anonymous";
}

export function createRateLimitMiddleware(options: RateLimitOptions) {
  const methods = options.methods?.map((value) => value.toUpperCase());
  const paths = options.paths;

  return async (req: Request, res: Response, next: NextFunction) => {
    if (methods && !methods.includes(req.method.toUpperCase())) {
      next();
      return;
    }

    if (paths && !paths.some((currentPath) => req.path === currentPath || req.path.startsWith(`${currentPath}/`))) {
      next();
      return;
    }

    const key = options.keyFn ? options.keyFn(req) : `${getClientIp(req)}:${req.path}:${getRequestIdentity(req)}`;
    const redisKey = `ratelimit:${options.id}:${key}`;

    try {
      const redis = await getRedisClient();
      if (!redis) {
        next();
        return;
      }

      const current = await redis.incr(redisKey);
      if (current === 1) {
        await redis.pExpire(redisKey, options.windowMs);
      }

      if (current > options.max) {
        const ttl = await redis.ttl(redisKey);
        const retryAfterSeconds = Math.max(1, ttl);
        res.setHeader("Retry-After", String(retryAfterSeconds));
        res.status(429).json({
          error: "RATE_LIMITED",
          message: "Terlalu banyak permintaan dalam waktu singkat. Coba lagi sebentar.",
          retryAfterSeconds,
        });
        return;
      }
      
      next();
    } catch (err) {
      console.error("Rate limit error (Redis):", err);
      // Fallback: allow request if redis is down
      next();
    }
  };
}

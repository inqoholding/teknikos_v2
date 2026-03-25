import type { NextFunction, Request, Response } from "express";
import { redis } from "./redis.js";

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

    const key = options.keyFn ? options.keyFn(req) : `${getClientIp(req)}:${req.path}`;
    const redisKey = `ratelimit:${options.id}:${key}`;

    try {
      const current = await redis.incr(redisKey);
      if (current === 1) {
        await redis.pExpire(redisKey, options.windowMs);
      }

      if (current > options.max) {
        const ttl = await redis.ttl(redisKey);
        res.setHeader("Retry-After", String(Math.max(1, ttl)));
        res.status(429).json({
          error: "RATE_LIMITED",
          message: "Terlalu banyak percobaan. Coba lagi beberapa saat lagi.",
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

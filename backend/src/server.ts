import cors from "cors";
import express from "express";
import helmet from "helmet";
import compression from "compression";
import { logger } from "./lib/logger.js";
import { toNodeHandler } from "better-auth/node";
import { ZodError } from "zod";
import type { AppError } from "./lib/errors.js";
import { requireCsrf } from "./lib/csrf.js";
import { env } from "./lib/env.js";
import { auth } from "./lib/auth.js";
import { isAllowedOrigin } from "./lib/origins.js";
import { createRateLimitMiddleware } from "./lib/rate-limit.js";
import { apiRouter } from "./routes/index.js";

const app = express();
const authRateLimit = createRateLimitMiddleware({
  id: "auth",
  windowMs: 15 * 60 * 1000,
  max: 60,
  methods: ["POST"],
  paths: ["/sign-in/email", "/sign-up/email"],
  keyFn: (req) => {
    const email =
      typeof req.body === "object" &&
      req.body &&
      "email" in req.body &&
      typeof req.body.email === "string"
        ? req.body.email.trim().toLowerCase()
        : "anonymous";
    const forwarded = req.headers["x-forwarded-for"];
    const ip =
      typeof forwarded === "string" && forwarded.trim()
        ? forwarded.split(",")[0]!.trim()
        : req.ip || req.socket.remoteAddress || "unknown";
    return `${ip}:${req.path}:${email}`;
  },
});
const sensitiveWriteRateLimit = createRateLimitMiddleware({
  id: "sensitive-write",
  windowMs: 5 * 60 * 1000,
  max: 120,
  methods: ["POST", "PATCH", "PUT", "DELETE"],
});

app.use(
  cors({
    origin(origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin tidak diizinkan oleh server."));
    },
    credentials: true,
  }),
);
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "teknikos-backend",
  });
});

app.use("/api/auth", authRateLimit);
app.use("/api/auth", requireCsrf);
app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use("/api/admin", sensitiveWriteRateLimit);
app.use("/api", requireCsrf);
app.use("/api", apiRouter);

app.use((error: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const typedError = error as Partial<AppError>;
  const isValidationError = error instanceof ZodError;
  
  // Postgres (pg) error codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
  const pgError = (error as any).code;
  const isForeignKeyError = pgError === "23503" || (error.name === "SqliteError" && error.message.includes("FOREIGN KEY"));
  const isUniqueError = pgError === "23505" || (error.name === "SqliteError" && error.message.includes("UNIQUE"));

  const statusCode =
    typedError.statusCode ??
    (isValidationError ? 400 : isForeignKeyError ? 400 : isUniqueError ? 409 : 500);

  // Log error for production monitoring
  console.error(`[SERVER_ERROR] ${statusCode}:`, error);

  res.status(statusCode).json({
    error: error.name || "INTERNAL_SERVER_ERROR",
    message:
      typedError.statusCode
        ? error.message
        : isValidationError
          ? "Data yang dikirim tidak valid."
          : isForeignKeyError
            ? "Referensi data tidak valid untuk bisnis ini."
            : isUniqueError
              ? "Data yang sama sudah ada."
              : "Terjadi kesalahan pada server.",
    details: isValidationError ? error.flatten() : typedError.details,
  });
});

app.listen(env.PORT, () => {
  logger.info(`TeknikOS backend listening on port ${env.PORT}`);
});

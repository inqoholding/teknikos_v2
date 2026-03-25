import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import compression from "compression";
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
app.use(morgan("dev"));
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
  const isSqliteForeignKey = error.name === "SqliteError" && error.message.includes("FOREIGN KEY");
  const isSqliteUnique = error.name === "SqliteError" && error.message.includes("UNIQUE");
  const statusCode =
    typedError.statusCode ??
    (isValidationError ? 400 : isSqliteForeignKey ? 400 : isSqliteUnique ? 409 : 500);

  res.status(statusCode).json({
    error: error.name || "INTERNAL_SERVER_ERROR",
    message:
      typedError.statusCode
        ? error.message
        : isValidationError
          ? "Data yang dikirim tidak valid."
          : isSqliteForeignKey
            ? "Referensi data tidak valid untuk bisnis ini."
            : isSqliteUnique
              ? "Data yang sama sudah ada."
              : error.message || "Terjadi kesalahan pada server.",
    details: isValidationError ? error.flatten() : typedError.details,
  });
});

app.listen(env.PORT, () => {
  console.log(`TeknikOS backend listening on http://localhost:${env.PORT}`);
});

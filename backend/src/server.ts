import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { toNodeHandler } from "better-auth/node";
import { ZodError } from "zod";
import type { AppError } from "./lib/errors.js";
import { env } from "./lib/env.js";
import { auth } from "./lib/auth.js";
import { isAllowedOrigin } from "./lib/origins.js";
import { apiRouter } from "./routes/index.js";

const app = express();

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

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    service: "teknikos-backend",
  });
});

app.all("/api/auth/{*any}", toNodeHandler(auth));

app.use(express.json());
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

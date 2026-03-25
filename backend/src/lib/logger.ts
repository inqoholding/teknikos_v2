import pino from "pino";
import { env } from "./env.js";

const isProduction = process.env.NODE_ENV === "production";

export const logger = pino({
  level: isProduction ? "info" : "debug",
  transport: isProduction
    ? {
        target: "pino/file",
        options: { destination: "./logs/app.log", mkdir: true },
      }
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
});

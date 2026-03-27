import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const redisEnabled = process.env.REDIS_DISABLED !== "true";

export const redis = createClient({
  url: redisUrl,
  socket: {
    reconnectStrategy: () => false,
  },
});

let connectAttempted = false;
let connectFailed = false;
let loggedDisabled = false;

redis.on("error", (err) => {
  if (!connectFailed) {
    console.error("Redis Client Error", err);
  }
});

async function ensureRedisConnected() {
  if (!redisEnabled) {
    if (!loggedDisabled) {
      loggedDisabled = true;
      console.warn("Redis disabled via REDIS_DISABLED=true. Rate limit will run in fallback mode.");
    }
    return false;
  }

  if (connectFailed) {
    return false;
  }

  if (redis.isOpen) {
    return true;
  }

  if (connectAttempted) {
    return false;
  }

  connectAttempted = true;

  try {
    await redis.connect();
    return true;
  } catch (error) {
    connectFailed = true;
    console.warn(`Redis unavailable at ${redisUrl}. Falling back without Redis-backed rate limits.`);
    return false;
  }
}

export async function getRedisClient() {
  const connected = await ensureRedisConnected();
  return connected ? redis : null;
}

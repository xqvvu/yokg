import { isNil, isNotNil } from "es-toolkit";
import { createClient } from "redis";
import { getErrorMessage } from "@/errors";
import { getLogger, infra } from "@/infra/logger";
import { getConfig } from "@/lib/config";

export type Redis = ReturnType<typeof createClient>;
let redis: Redis | null = null;

export async function configure() {
  if (isNotNil(redis)) return;

  const config = getConfig();
  const logger = getLogger(infra.redis);

  redis = createClient({
    RESP: 3,
    url: config.redis.url,
    maintNotifications: "disabled",
    socket: {
      keepAlive: true,
      connectTimeout: 5_000,
      reconnectStrategy: (times) => Math.min(times * 100, 1_000),
    },
    commandOptions: {
      timeout: 3_000,
    },
  });

  redis.on("ready", () => void logger.info("Redis is ready"));
  redis.on("error", (err) => void logger.error(getErrorMessage(err)));

  await redis.connect();
}

export function getRedis() {
  if (isNil(redis)) {
    throw new Error("Redis is not ready");
  }

  return redis;
}

export async function destroyRedis() {
  if (isNotNil(redis)) {
    await redis.quit();
    redis = null;
  }
}

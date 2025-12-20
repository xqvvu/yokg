import type { ConnectionOptions } from "bullmq";
import { getConfig } from "@/lib/config";

export function createBullMqConnectionOptions(): ConnectionOptions {
  const { redis } = getConfig();

  return {
    url: redis.url,
    enableReadyCheck: false,
    maxRetriesPerRequest: null,
    retryStrategy: (times) => Math.min(times * 50, 2_000),
    reconnectOnError: (err) => err.message.includes("READONLY"),
  };
}

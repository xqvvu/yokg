import { ErrorCode } from "@graph-mind/shared/lib/error-codes";
import { isError, isNil, isNotNil } from "es-toolkit";
import { createClient } from "redis";
import { SystemException } from "@/exceptions/system-exception";
import { getRedisLogger } from "@/infra/redis/helpers";
import { getConfig } from "@/lib/config";

export type RDB = ReturnType<typeof createClient>;

let redis: RDB | null = null;

export async function configure() {
  if (isNil(redis)) {
    const config = getConfig();
    const redisLogger = getRedisLogger();

    redis = createClient({
      RESP: 3,
      url: config.redisUrl,
      maintNotifications: "disabled",
    });

    redis.on("connect", function redisConnectHandler() {
      redisLogger.info("Connect to redis");
    });

    redis.on("ready", function redisConnectHandler() {
      redisLogger.info("Redis is ready");
    });

    redis.on("error", function redisErrorHandler(err: AggregateError | Error) {
      if (err instanceof AggregateError) {
        throw new SystemException({
          errcode: ErrorCode.INTERNAL_ERROR,
          message: err.errors.map((error) => error.message).join(", "),
        });
      } else {
        throw new SystemException({
          errcode: ErrorCode.INTERNAL_ERROR,
          message: isError(err) ? err.message : "Unknown redis error",
        });
      }
    });

    await redis.connect();
  }
}

export function getRedis() {
  if (isNil(redis)) {
    throw new SystemException({
      errcode: ErrorCode.INTERNAL_ERROR,
      message: "Redis has not been initialized yet",
    });
  }

  return redis;
}

export async function destroyRdb() {
  if (isNotNil(redis)) {
    redis.destroy();
    redis = null;
  }
}

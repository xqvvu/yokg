import { ErrorCode } from "@graph-mind/shared/lib/error-codes";
import { isError, isNil, isNotNil } from "es-toolkit";
import { createClient } from "redis";
import { SystemException } from "@/exceptions/system-exception";
import { getLogger, infra } from "@/infra/logger";
import { getConfig } from "@/lib/config";

export type RDB = ReturnType<typeof createClient>;

let rdb: RDB | null = null;

export async function configure() {
  if (isNil(rdb)) {
    const config = getConfig();
    const logger = getLogger(infra.redis);

    rdb = createClient({
      RESP: 3,
      url: config.redisUrl,
      maintNotifications: "disabled",
    });

    rdb.on("connect", function redisConnectHandler() {
      logger.info`Connect to redis`;
    });

    rdb.on("ready", function redisConnectHandler() {
      logger.info`Redis is ready`;
    });

    rdb.on("error", function redisErrorHandler(err: AggregateError | Error) {
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

    await rdb.connect();
  }
}

export function getRdb() {
  if (isNil(rdb)) {
    throw new SystemException({
      errcode: ErrorCode.INTERNAL_ERROR,
      message: "Redis has not been initialized yet",
    });
  }

  return rdb;
}

export async function destroyRdb() {
  if (isNotNil(rdb)) {
    rdb.destroy();
    rdb = null;
  }
}

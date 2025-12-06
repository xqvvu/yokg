import { ErrorCode } from "@graph-mind/shared/lib/error-codes";
import { schema } from "@graph-mind/shared/schemas";
import { drizzle } from "drizzle-orm/postgres-js";
import { isNil, isNotNil } from "es-toolkit";
import { SystemException } from "@/exceptions/system-exception";
import { getLogger, infra } from "@/infra/logger";
import { getConfig } from "@/lib/config";

export type DB = ReturnType<typeof drizzle<typeof schema>>;

let db: DB | null = null;

export async function configure() {
  if (isNil(db)) {
    const config = getConfig();
    const logger = getLogger(infra.database);

    logger.info`Initialize database`;

    db = drizzle({
      schema,
      casing: "snake_case",
      connection: config.databaseUrl,
    });
  }
}

export function getDb() {
  if (isNil(db)) {
    throw new SystemException({
      errcode: ErrorCode.INTERNAL_ERROR,
      message: "Database has not been initialized yet",
    });
  }

  return db;
}

export async function destroyDb() {
  if (isNotNil(db)) {
    await db.$client.end();
    db = null;
  }
}

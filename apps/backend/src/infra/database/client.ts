import { ErrorCode } from "@graph-mind/shared/lib/error-codes";
import { schema } from "@graph-mind/shared/schemas";
import { drizzle } from "drizzle-orm/node-postgres";
import { isNil, isNotNil } from "es-toolkit";
import { SystemException } from "@/exceptions/system-exception";
import { getDbLogger } from "@/infra/database/helpers";
import { getConfig } from "@/lib/config";

export type DB = ReturnType<typeof drizzle<typeof schema>>;

let db: DB | null = null;

export async function configure() {
  if (isNil(db)) {
    const config = getConfig();

    getDbLogger().info("Database connect");

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

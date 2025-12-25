import { schema } from "@yokg/shared/schemas";
import { drizzle } from "drizzle-orm/node-postgres";
import { isNil, isNotNil } from "es-toolkit";
import type { PoolClient } from "pg";
import { getErrorMessage } from "@/errors";
import { getLogger, infra } from "@/infra/logger";
import { getConfig } from "@/lib/config";

export type Database = ReturnType<typeof drizzle<typeof schema>>;
let db: Database | null = null;

export async function configure() {
  if (isNil(db)) {
    const { databse } = getConfig();

    db = drizzle({
      schema,
      connection: {
        connectionString: databse.url,
        max: 10,
        idleTimeoutMillis: 60_000,
        maxLifetimeSeconds: 21600,
        keepAlive: true,
        keepAliveInitialDelayMillis: 10_000,
      },
      casing: "snake_case",
    });

    let client: PoolClient | null = null;
    try {
      client = await db.$client.connect();
      await client.query("SELECT 1");
      getLogger(infra.database).info("Database is ready");
    } catch (error) {
      const message = getErrorMessage(error);
      throw new Error(`Database is not ready: ${message}`);
    } finally {
      client?.release();
    }
  }
}

export function getDb() {
  if (isNil(db)) {
    throw new Error("Database is not ready");
  }

  return db;
}

export async function destroyDb() {
  if (isNotNil(db)) {
    await db.$client.end();
    db = null;
  }
}

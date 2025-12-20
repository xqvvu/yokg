import { isNil, isNotNil, toMerged } from "es-toolkit";
import type { PoolClient, PoolOptions } from "pg";
import { Pool } from "pg";
import { getErrorMessage } from "@/errors";
import { getLogger, infra } from "@/infra/logger";
import { getConfig } from "@/lib/config";

let pool: Pool | null = null;

export async function configure() {
  if (isNil(pool)) {
    const { pgvector } = getConfig();

    pool = new Pool({
      connectionString: pgvector.url,
      max: pgvector.poolMaxConnections,
      idleTimeoutMillis: pgvector.poolIdleTimeoutMillis,
      maxLifetimeSeconds: pgvector.poolMaxLifetimeSeconds,
    });

    let client: PoolClient | null = null;
    try {
      client = await pool.connect();
      await client.query("SELECT 1");
      getLogger(infra.pgvector).info("PgVector is ready");
    } catch (error) {
      const message = getErrorMessage(error);
      throw new Error(`PgVector is not ready: ${message}`);
    } finally {
      client?.release();
    }
  }
}

export function getPgVectorPool() {
  if (isNil(pool)) {
    throw new Error("PgVector is not ready");
  }

  return pool;
}

export function newPgVectorPool(options?: PoolOptions) {
  if (isNil(pool)) {
    throw new Error("Create a new PgVector connection pool failed");
  }

  const poolOptions = toMerged(pool.options, options ?? {});

  return new Pool(poolOptions);
}

export async function destroyPgVectorPool() {
  if (isNotNil(pool) && !pool.ended) {
    await pool.end();
  }
  pool = null;
}

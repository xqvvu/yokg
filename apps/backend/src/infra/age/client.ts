import { isNil, isNotNil, toMerged } from "es-toolkit";
import type { PoolClient, PoolOptions } from "pg";
import { Pool } from "pg";
import { getErrorMessage } from "@/errors";
import { getLogger, infra } from "@/infra/logger";
import { getConfig } from "@/lib/config";

let pool: Pool | null = null;

export async function configure() {
  if (isNil(pool)) {
    const { age } = getConfig();

    pool = new Pool({
      connectionString: age.url,
      max: age.poolMaxConnections,
      idleTimeoutMillis: age.poolIdleTimeoutMillis,
      maxLifetimeSeconds: age.poolMaxLifetimeSeconds,
    });
  }

  pool.on("connect", (conn) => {
    const sql = `
LOAD 'age';
SET search_path = ag_catalog, "$user", public;`;

    conn.query(sql);
  });

  let client: PoolClient | null = null;
  try {
    client = await pool.connect();
    await client.query("SELECT 1");
    getLogger(infra.age).info("AGE is ready");
  } catch (error) {
    const message = getErrorMessage(error);
    throw new Error(`AGE is not ready: ${message}`);
  } finally {
    client?.release();
  }
}

export function getAgePool() {
  if (isNil(pool)) {
    throw new Error("AGE is not ready");
  }

  return pool;
}

export function newAgePool(options?: PoolOptions) {
  if (isNil(pool)) {
    throw new Error("Create a new AGE connection pool failed");
  }

  const poolOptions = toMerged(pool.options, options ?? {});

  return new Pool(poolOptions);
}

export async function destroyAgePool() {
  if (isNotNil(pool) && !pool.ended) {
    await pool.end();
  }
  pool = null;
}

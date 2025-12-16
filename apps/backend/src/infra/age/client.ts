import { ErrorCode } from "@graph-mind/shared/lib/error-codes";
import { isNil, isNotNil, toMerged } from "es-toolkit";
import type { PoolOptions } from "pg";
import { Pool } from "pg";
import { SystemException } from "@/exceptions/system-exception";
import { getConfig } from "@/lib/config";

let pool: Pool | null = null;

export async function configure() {
  if (isNil(pool)) {
    const config = getConfig();

    pool = new Pool({
      connectionString: config.ageUrl,
      max: config.agePoolMaxConnections,
      idleTimeoutMillis: config.agePoolIdleTimeoutMillis,
      maxLifetimeSeconds: config.agePoolMaxLifetimeSeconds,
    });
  }

  pool.on("connect", (conn) => {
    const sql = `
LOAD 'age';
SET search_path = ag_catalog, "$user", public;`;

    conn.query(sql);
  });
}

export function getAgePool() {
  if (isNil(pool)) {
    throw new SystemException({
      errcode: ErrorCode.INTERNAL_ERROR,
      message: "Failed to get an AGE connection",
    });
  }

  return pool;
}

export function newAgePool(options?: PoolOptions) {
  if (isNil(pool)) {
    throw new SystemException({
      errcode: ErrorCode.INTERNAL_ERROR,
      message: "Failed to create a new AGE connection pool",
    });
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

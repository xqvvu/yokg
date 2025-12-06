import { ErrorCode } from "@graph-mind/shared/lib/error-codes";
import { schema } from "@graph-mind/shared/schemas";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { isNil } from "es-toolkit";
import { SystemException } from "@/exceptions/system-exception";
import { getDb } from "@/infra/database";
import { external, getLogger } from "@/infra/logger";
import { getConfig } from "@/lib/config";

let auth: ReturnType<typeof betterAuth> | null = null;

export async function configure() {
  if (isNil(auth)) {
    const db = getDb();
    const config = getConfig();
    const logger = getLogger(external.betterAuth);

    auth = betterAuth({
      baseURL: config.betterAuthUrl,
      trustedOrigins: config.corsAllowedOrigins,
      database: drizzleAdapter(db, {
        schema,
        provider: "pg",
        usePlural: true,
        camelCase: false,
      }),
      logger: {
        log(_level, message, ...args) {
          logger.debug(message, ...args);
        },
      },
      advanced: {
        disableOriginCheck: config.isDevelopmentNodeEnv,
      },
      experimental: {
        joins: true,
      },
      emailAndPassword: {
        enabled: true,
      },
    });
  }
}

export function getBetterAuth() {
  if (isNil(auth)) {
    throw new SystemException({
      errcode: ErrorCode.INTERNAL_ERROR,
      message: "BetterAuth has not been initialized yet",
    });
  }

  return auth;
}

import { ErrorCode } from "@yokg/shared/lib/error-codes";
import { schema } from "@yokg/shared/schemas";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { isNil } from "es-toolkit";
import { SystemError } from "@/errors/system-error";
import { getDb } from "@/infra/database";
import { betterAuth as betterAuthCategory, getLogger } from "@/infra/logger";
import { getConfig } from "@/lib/config";

let auth: ReturnType<typeof betterAuth> | null = null;

export async function configure() {
  if (isNil(auth)) {
    const db = getDb();
    const { server, isDevelopmentNodeEnv } = getConfig();
    const logger = getLogger(betterAuthCategory);

    auth = betterAuth({
      baseURL: server.betterAuthUrl,
      trustedOrigins: server.corsAllowedOrigins,
      database: drizzleAdapter(db, {
        schema,
        provider: "pg",
        usePlural: true,
        camelCase: false,
      }),
      logger: {
        log(level, message) {
          logger[level](message);
        },
      },
      advanced: {
        disableOriginCheck: isDevelopmentNodeEnv,
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
    throw new SystemError({
      errcode: ErrorCode.INTERNAL_ERROR,
      message: "BetterAuth has not been initialized yet",
    });
  }

  return auth;
}

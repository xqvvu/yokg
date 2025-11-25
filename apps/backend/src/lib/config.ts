import { ErrorCode } from "@graph-mind/shared/lib/error-codes";
import type { Method } from "@graph-mind/shared/types/result";
import type { ConfigInit } from "@graph-mind/shared/validate/config";
import { ConfigSchema } from "@graph-mind/shared/validate/config";
import { isNil } from "es-toolkit";
import { ZodError } from "zod";
import { SystemException } from "@/exceptions/system-exception";

let env: ConfigInit | null = null;
function prepare() {
  if (isNil(env)) {
    try {
      env = ConfigSchema.parse(process.env);
    } catch (error) {
      if (error instanceof ZodError) {
        const paths = error.issues.flatMap((issue) => issue.path).join(", ");
        throw new SystemException({
          errcode: ErrorCode.INTERNAL_ERROR,
          message: `Invalid configuration detected. Please check these environment variables: ${paths}`,
        });
      }
      throw error;
    }
  }

  return env;
}

export class Config {
  // Public only for testing use
  constructor(private readonly env: ConfigInit = prepare()) {}

  // biome-ignore lint/correctness/noUnusedPrivateClassMembers: Singleton
  static #instance: Config | null = null;
  static getInstance() {
    if (isNil(Config.#instance)) {
      Config.#instance = new Config();
    }

    return Config.#instance;
  }

  get isDevelopmentNodeEnv(): boolean {
    return this.env.NODE_ENV === "development";
  }

  get isProductionNodeEnv(): boolean {
    return !this.isDevelopmentNodeEnv;
  }

  get port(): number {
    return this.env.PORT;
  }

  get corsAllowedOrigins(): string[] {
    return this.env.CORS_ALLOWED_ORIGINS;
  }

  readonly corsAllowedMethods: Method[] = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS",
  ];

  readonly corsAllowedHeaders: string[] = [
    "Accept",
    "Origin",
    "X-CSRF-Token",
    "Content-Type",
    "Authorization",
  ];

  get databaseURL(): string {
    return this.env.DATABASE_URL;
  }

  get redisURL(): string {
    return this.env.REDIS_URL;
  }

  get locale(): string {
    return this.env.LOCALE;
  }

  get timezone(): string {
    return this.env.TZ;
  }
}

export function getConfig() {
  return Config.getInstance();
}

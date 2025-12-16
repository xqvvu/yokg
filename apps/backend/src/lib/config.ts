import { ErrorCode } from "@graph-mind/shared/lib/error-codes";
import type { Method } from "@graph-mind/shared/types/http";
import type { BasicConfigInit, InterpolatedConfigInit } from "@graph-mind/shared/validate/config";
import { BasicConfigSchema, InterpolatedConfigSchema } from "@graph-mind/shared/validate/config";
import { isNil, pick } from "es-toolkit";
import { ZodError } from "zod";
import { SystemException } from "@/exceptions/system-exception";

export type ConfigInit = BasicConfigInit & InterpolatedConfigInit;

function interpolate(basicConfig: BasicConfigInit): InterpolatedConfigInit {
  const config = {
    ...pick(process.env as Partial<InterpolatedConfigInit>, [
      "DATABASE_URL",
      "REDIS_URL",
      "BETTER_AUTH_URL",
      "OBJECT_STORAGE_ENDPOINT",
      "AGE_URL",
    ]),
  };

  const extractPlaceholders = (val: string) => {
    const placeholders: Record<string, string> = {};
    const regex = /\$\{([^}]+)\}/g;
    const matches = Array.from(val.matchAll(regex));
    for (const match of matches) {
      placeholders[match[0]] = match[1];
    }
    return placeholders;
  };

  for (const key of Object.keys(config)) {
    let value = config[key as keyof typeof config];
    if (isNil(value)) continue;
    const placeholders = extractPlaceholders(value);
    for (const [placeholder, key] of Object.entries(placeholders)) {
      const basicKey = key as keyof BasicConfigInit;
      const basicValue = String(basicConfig[basicKey]);
      if (isNil(basicValue)) continue;
      value = value.replace(placeholder, basicValue);
    }
    config[key as keyof typeof config] = value;
  }

  return config as InterpolatedConfigInit;
}

function prepare() {
  try {
    const basicConfig = BasicConfigSchema.parse(process.env);
    let interpolatedConfig = interpolate(basicConfig);
    interpolatedConfig = InterpolatedConfigSchema.parse(interpolatedConfig);
    return {
      ...basicConfig,
      ...interpolatedConfig,
    };
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

export class Config {
  private static instance: Config | null = null;

  // Server
  readonly port: number;
  readonly locale: string;
  readonly timezone: string;
  readonly corsAllowedOrigins: string[];
  readonly corsAllowedMethods = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS",
  ] satisfies Method[];
  corsAllowedHeaders = ["Accept", "Origin", "X-CSRF-Token", "Content-Type", "Authorization"];
  readonly isDevelopmentNodeEnv: boolean;
  readonly isTestNodeEnv: boolean;
  readonly isProductionNodeEnv: boolean;

  // BetterAuth
  readonly betterAuthUrl: string;

  // PostgreSQL
  readonly databaseUrl: string;

  // Apache AGE
  readonly ageUrl: string;
  readonly agePoolMaxConnections: number;
  readonly agePoolIdleTimeoutMillis: number;
  readonly agePoolMaxLifetimeSeconds: number;

  // Redis
  readonly redisUrl: string;

  // Object Storage
  readonly objectStorageVendor: "aws-s3" | "rustfs" | "minio" | "r2" | "oss" | "cos" | "memory";
  readonly objectStorageEndpoint: string;
  readonly objectStorageAccessKey: string;
  readonly objectStorageSecretKey: string;
  readonly objectStorageRegion: string;
  readonly objectStorageForcePathStyle: boolean;
  readonly objectStoragePublicBucketName: string;
  readonly objectStoragePrivateBucketName: string;

  private constructor() {
    const env = prepare();

    this.port = env.PORT;
    this.locale = env.LOCALE;
    this.timezone = env.TZ;
    this.corsAllowedOrigins = env.CORS_ALLOWED_ORIGINS;
    this.isDevelopmentNodeEnv = env.NODE_ENV === "development";
    this.isTestNodeEnv = env.NODE_ENV === "test";
    this.isProductionNodeEnv = !this.isDevelopmentNodeEnv && !this.isTestNodeEnv;

    this.betterAuthUrl = env.BETTER_AUTH_URL;

    this.databaseUrl = env.DATABASE_URL;

    this.ageUrl = env.AGE_URL;
    this.agePoolMaxConnections = env.AGE_POOL_MAX_CONNECTIONS;
    this.agePoolIdleTimeoutMillis = env.AGE_POOL_IDLE_TIMEOUT_MS;
    this.agePoolMaxLifetimeSeconds = env.AGE_POOL_MAX_LIFETIME_SECONDS;

    this.redisUrl = env.REDIS_URL;

    this.objectStorageVendor = env.OBJECT_STORAGE_VENDOR;
    this.objectStorageEndpoint = env.OBJECT_STORAGE_ENDPOINT;
    this.objectStorageAccessKey = env.OBJECT_STORAGE_ACCESS_KEY;
    this.objectStorageSecretKey = env.OBJECT_STORAGE_SECRET_KEY;
    this.objectStorageRegion = env.OBJECT_STORAGE_REGION;
    this.objectStorageForcePathStyle = env.OBJECT_STORAGE_FORCE_PATH_STYLE;
    this.objectStoragePublicBucketName = env.OBJECT_STORAGE_PUBLIC_BUCKET_NAME;
    this.objectStoragePrivateBucketName = env.OBJECT_STORAGE_PRIVATE_BUCKET_NAME;
  }

  static getInstance() {
    return Config.instance ?? new Config();
  }
}

export function getConfig() {
  return Config.getInstance();
}

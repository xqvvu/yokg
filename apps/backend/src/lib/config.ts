import type { Method } from "@graph-mind/shared/types/http";
import { ConfigInitSchema } from "@graph-mind/shared/validate/config";
import { createEnv } from "@t3-oss/env-core";
import { isNil } from "es-toolkit";

function prepare() {
  return createEnv({
    server: {
      ...ConfigInitSchema.shape,
    },
    runtimeEnv: process.env,
    emptyStringAsUndefined: true,
    isServer: true,
    onValidationError(issues) {
      const paths = issues.map((issue) => issue.path).join(", ");
      console.error("Invalid environment variables. Please check: %s\n", paths);
      process.exit(-1);
    },
  });
}

export class Config {
  private static instance: Config | null = null;

  readonly isDevelopmentNodeEnv: boolean;
  readonly isTestNodeEnv: boolean;
  readonly isProductionNodeEnv: boolean;

  readonly server: Readonly<{
    port: number;
    locale: string;
    timezone: string;
    corsAllowedOrigins: string[];
    corsAllowedMethods: Method[];
    corsAllowedHeaders: string[];
    betterAuthUrl: string;
  }>;

  readonly databse: Readonly<{
    url: string;
  }>;

  readonly age: Readonly<{
    url: string;
    poolMaxConnections: number;
    poolIdleTimeoutMillis: number;
    poolMaxLifetimeSeconds: number;
  }>;

  readonly pgvector: Readonly<{
    url: string;
    poolMaxConnections: number;
    poolIdleTimeoutMillis: number;
    poolMaxLifetimeSeconds: number;
  }>;

  readonly redis: Readonly<{
    url: string;
  }>;

  readonly storage: Readonly<{
    vendor: ReturnType<typeof prepare>["STORAGE_VENDOR"];
    acceeKeyId: string;
    secretAccessKey: string;
    region: string;
    forcePathStyle: boolean;
    publicBucketName: string;
    privateBucketName: string;
    internalEndpoint: string;
    externalEndpoint: string;
  }>;

  private constructor() {
    const env = prepare();

    this.isTestNodeEnv = env.NODE_ENV === "test";
    this.isDevelopmentNodeEnv = env.NODE_ENV === "development";
    this.isProductionNodeEnv = !this.isDevelopmentNodeEnv && !this.isTestNodeEnv;

    this.server = {
      port: env.PORT,
      timezone: env.TZ,
      locale: env.LOCALE,
      corsAllowedOrigins: env.CORS_ALLOWED_ORIGINS,
      corsAllowedMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"],
      corsAllowedHeaders: ["Accept", "Origin", "X-CSRF-Token", "Content-Type", "Authorization"],
      betterAuthUrl: env.BETTER_AUTH_URL,
    };

    this.databse = {
      url: `postgres://${env.POSTGRES_USER}:${env.POSTGRES_PASSWORD}@${env.POSTGRES_HOST}:${env.POSTGRES_PORT}/${env.POSTGRES_DB}`,
    };

    this.age = {
      url: `postgres://${env.AGE_USER}:${env.AGE_PASSWORD}@${env.AGE_HOST}:${env.AGE_PORT}/${env.AGE_DB}`,
      poolIdleTimeoutMillis: env.AGE_POOL_IDLE_TIMEOUT_MS,
      poolMaxConnections: env.AGE_POOL_MAX_CONNECTIONS,
      poolMaxLifetimeSeconds: env.AGE_POOL_MAX_LIFETIME_SECONDS,
    };

    this.pgvector = {
      url: `postgres://${env.PGVECTOR_USER}:${env.PGVECTOR_PASSWORD}@${env.PGVECTOR_HOST}:${env.PGVECTOR_PORT}/${env.PGVECTOR_DB}`,
      poolIdleTimeoutMillis: env.PGVECTOR_POOL_IDLE_TIMEOUT_MS,
      poolMaxConnections: env.PGVECTOR_POOL_MAX_CONNECTIONS,
      poolMaxLifetimeSeconds: env.PGVECTOR_POOL_MAX_LIFETIME_SECONDS,
    };

    this.redis = {
      url: `redis://default:${env.REDIS_PASSWORD}@${env.REDIS_HOST}:${env.REDIS_PORT}/${env.REDIS_DB}`,
    };

    this.storage = {
      vendor: env.STORAGE_VENDOR,
      acceeKeyId: env.STORAGE_ACCESS_KEY,
      secretAccessKey: env.STORAGE_SECRET_KEY,
      region: env.STORAGE_REGION,
      forcePathStyle: env.STORAGE_FORCE_PATH_STYLE,
      publicBucketName: env.STORAGE_PUBLIC_BUCKET_NAME,
      privateBucketName: env.STORAGE_PRIVATE_BUCKET_NAME,
      internalEndpoint: env.STORAGE_INTERNAL_ENDPOINT,
      externalEndpoint: env.STORAGE_EXTERNAL_ENDPOINT,
    };
  }

  static getInstance() {
    if (isNil(Config.instance)) {
      Config.instance = new Config();
    }
    return Config.instance;
  }
}

export function getConfig() {
  return Config.getInstance();
}

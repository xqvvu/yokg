import { ErrorCode } from "@graph-mind/shared/lib/error-codes";
import type { Method } from "@graph-mind/shared/types/http";
import type {
  BasicConfigInit,
  InterpolatedConfigInit,
} from "@graph-mind/shared/validate/config";
import {
  BasicConfigSchema,
  InterpolatedConfigSchema,
} from "@graph-mind/shared/validate/config";
import { isNil, pick } from "es-toolkit";
import { ZodError } from "zod";
import { SystemException } from "@/exceptions/system-exception";

export type ConfigInit = BasicConfigInit & InterpolatedConfigInit;

function interpolate(basicConfig: BasicConfigInit): InterpolatedConfigInit {
  const config = {
    ...pick(process.env as Partial<InterpolatedConfigInit>, [
      "DATABASE_URL",
      "REDIS_URL",
      "NEO4J_URI",
      "BETTER_AUTH_URL",
      "OBJECT_STORAGE_ENDPOINT",
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

let env: ConfigInit | null = null;
function prepare() {
  if (isNil(env)) {
    try {
      const basicConfig = BasicConfigSchema.parse(process.env);
      let interpolatedConfig = interpolate(basicConfig);
      interpolatedConfig = InterpolatedConfigSchema.parse(interpolatedConfig);
      env = {
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

  return env;
}

export class Config {
  private constructor(private readonly env: ConfigInit = prepare()) {}
  private static instance: Config | null = null;
  static getInstance() {
    if (isNil(Config.instance)) {
      Config.instance = new Config();
    }

    return Config.instance;
  }

  // Server
  get isDevelopmentNodeEnv() {
    return this.env.NODE_ENV === "development";
  }
  get isProductionNodeEnv() {
    return !this.isDevelopmentNodeEnv;
  }
  get port() {
    return this.env.PORT;
  }
  get corsAllowedOrigins() {
    return this.env.CORS_ALLOWED_ORIGINS;
  }
  readonly corsAllowedMethods = [
    "GET",
    "POST",
    "PUT",
    "DELETE",
    "PATCH",
    "OPTIONS",
  ] satisfies Method[];
  readonly corsAllowedHeaders = [
    "Accept",
    "Origin",
    "X-CSRF-Token",
    "Content-Type",
    "Authorization",
  ];
  get locale() {
    return this.env.LOCALE;
  }
  get timezone() {
    return this.env.TZ;
  }

  // PostgreSQL
  get databaseUrl() {
    return this.env.DATABASE_URL;
  }

  // Redis
  get redisUrl() {
    return this.env.REDIS_URL;
  }

  // Neo4j
  get neo4jUri() {
    return this.env.NEO4J_URI;
  }
  get neo4jUser() {
    return this.env.NEO4J_USER;
  }
  get neo4jPassword() {
    return this.env.NEO4J_PASSWORD;
  }
  get neo4jDatabase() {
    return this.env.NEO4J_DB;
  }
  get neo4jMaxConnectionPoolSize() {
    return this.env.NEO4J_MAX_CONNECTION_POOL_SIZE;
  }
  get neo4jConnectionTimeout() {
    return this.env.NEO4J_CONNECTION_TIMEOUT;
  }

  // BetterAuth
  get betterAuthUrl() {
    return this.env.BETTER_AUTH_URL;
  }

  // Object Storage
  get objectStorageVendor() {
    return this.env.OBJECT_STORAGE_VENDOR;
  }
  get objectStorageEndpoint() {
    return this.env.OBJECT_STORAGE_ENDPOINT;
  }
  get objectStorageAccessKey() {
    return this.env.OBJECT_STORAGE_ACCESS_KEY;
  }
  get objectStorageSecretKey() {
    return this.env.OBJECT_STORAGE_SECRET_KEY;
  }
  get objectStorageRegion() {
    return this.env.OBJECT_STORAGE_REGION;
  }
  get objectStorageForcePathStyle() {
    return this.env.OBJECT_STORAGE_FORCE_PATH_STYLE;
  }
  get objectStoragePublicBucketName() {
    return this.env.OBJECT_STORAGE_PUBLIC_BUCKET_NAME;
  }
  get objectStoragePrivateBucketName() {
    return this.env.OBJECT_STORAGE_PRIVATE_BUCKET_NAME;
  }
}

export function getConfig() {
  return Config.getInstance();
}

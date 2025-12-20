import { compact } from "es-toolkit";
import { z } from "zod";

const PortSchema = z.coerce.number<number>().int().min(1).max(65535);

export const ConfigInitSchema = z.object({
  // Server
  NODE_ENV: z.string().optional(),
  PORT: PortSchema.default(10001),
  CORS_ALLOWED_ORIGINS: z
    .string()
    .nonempty()
    .transform((val) => compact(val.split(",")).map((origin) => origin.trim()))
    .pipe(z.array(z.url().or(z.literal("*"))))
    .default([]),
  LOCALE: z.string().default("zh-CN"),
  TZ: z.string().default("Asia/Shanghai"),

  // PostgreSQL
  POSTGRES_PORT: PortSchema.default(5432),
  POSTGRES_HOST: z.string().default("localhost"),
  POSTGRES_DB: z.string().default("core"),
  POSTGRES_USER: z.string().default("postgres"),
  POSTGRES_PASSWORD: z.string().nonempty(),

  // Apache AGE
  AGE_PORT: PortSchema.default(5455),
  AGE_HOST: z.string().default("localhost"),
  AGE_DB: z.string().default("graph"),
  AGE_USER: z.string().default("postgres"),
  AGE_PASSWORD: z.string().nonempty(),
  AGE_POOL_MAX_CONNECTIONS: z.coerce.number<number>().int().positive().default(10),
  AGE_POOL_IDLE_TIMEOUT_MS: z.coerce.number<number>().int().positive().default(10000),
  AGE_POOL_MAX_LIFETIME_SECONDS: z.coerce.number<number>().int().positive().default(36000),

  // PgVector
  PGVECTOR_PORT: PortSchema.default(5487),
  PGVECTOR_HOST: z.string().default("localhost"),
  PGVECTOR_DB: z.string().default("vector"),
  PGVECTOR_USER: z.string().default("postgres"),
  PGVECTOR_PASSWORD: z.string().nonempty(),
  PGVECTOR_POOL_MAX_CONNECTIONS: z.coerce.number<number>().int().positive().default(10),
  PGVECTOR_POOL_IDLE_TIMEOUT_MS: z.coerce.number<number>().int().positive().default(10000),
  PGVECTOR_POOL_MAX_LIFETIME_SECONDS: z.coerce.number<number>().int().positive().default(36000),

  // Redis
  REDIS_PORT: PortSchema.default(6379),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_DB: z.coerce.number<number>().int().min(0).default(0),
  REDIS_PASSWORD: z.string().nonempty(),

  // Object Storage
  STORAGE_VENDOR: z
    .enum(["rustfs", "aws-s3", "minio", "r2", "oss", "cos", "memory"])
    .default("rustfs"),
  STORAGE_ACCESS_KEY: z.string().nonempty(),
  STORAGE_SECRET_KEY: z.string().nonempty(),
  STORAGE_REGION: z.string().default("us-east-1"),
  STORAGE_PUBLIC_BUCKET_NAME: z.string().nonempty(),
  STORAGE_PRIVATE_BUCKET_NAME: z.string().nonempty(),
  STORAGE_FORCE_PATH_STYLE: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .default(false),
  STORAGE_INTERNAL_ENDPOINT: z.url(),
  STORAGE_EXTERNAL_ENDPOINT: z.url(),

  // BetterAuth
  BETTER_AUTH_SECRET: z.string().nonempty(),
  BETTER_AUTH_URL: z.url(),
});

export type ConfigInit = z.output<typeof ConfigInitSchema>;

import { compact } from "es-toolkit";
import { z } from "zod";

const PortSchema = z.coerce.number<number>().int().min(1).max(65535);

export const BasicConfigSchema = z.object({
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
  POSTGRES_DB: z.string().default("graph-mind"),
  POSTGRES_USER: z.string().default("postgres"),
  POSTGRES_PASSWORD: z.string().nonempty(),

  // Redis
  REDIS_PORT: PortSchema.default(6379),
  REDIS_HOST: z.string().default("localhost"),
  REDIS_DB: z.coerce.number<number>().int().min(0).default(0),
  REDIS_PASSWORD: z.string().nonempty(),

  // Neo4j
  NEO4J_HTTP_PORT: PortSchema.default(7474),
  NEO4J_BOLT_PORT: PortSchema.default(7687),
  NEO4J_HOST: z.string().default("localhost"),
  NEO4J_USER: z.string().default("neo4j"),
  NEO4J_PASSWORD: z.string().nonempty(),
  NEO4J_DB: z.string().default("graph-mind"),
  NEO4J_MAX_CONNECTION_POOL_SIZE: z.coerce
    .number<number>()
    .int()
    .positive()
    .default(50),
  NEO4J_CONNECTION_TIMEOUT: z.coerce
    .number<number>()
    .int()
    .positive()
    .default(30000),

  // Object Storage
  OBJECT_STORAGE_VENDOR: z
    .enum(["rustfs", "aws-s3", "minio", "r2", "oss", "memory"])
    .default("rustfs"),
  OBJECT_STORAGE_ACCESS_KEY: z.string().nonempty(),
  OBJECT_STORAGE_SECRET_KEY: z.string().nonempty(),
  OBJECT_STORAGE_REGION: z.string().default("cn-east-1"),
  OBJECT_STORAGE_PUBLIC_BUCKET_NAME: z.string().nonempty(),
  OBJECT_STORAGE_PRIVATE_BUCKET_NAME: z.string().nonempty(),
  OBJECT_STORAGE_FORCE_PATH_STYLE: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .default(false),
  OBJECT_STORAGE_VENDOR_API_PORT: PortSchema.default(9000),
  OBJECT_STORAGE_VENDOR_CONSOLE_PORT: PortSchema.default(9001),

  // BetterAuth
  BETTER_AUTH_SECRET: z.string().nonempty(),
});

export type BasicConfigInit = z.output<typeof BasicConfigSchema>;

export const InterpolatedConfigSchema = z.object({
  // PostgreSQL
  DATABASE_URL: z.string().regex(/^postgres(?:ql)?:\/\//),

  // Redis
  REDIS_URL: z.string().regex(/^redis{1,2}?:\/\//),

  // Neo4j
  NEO4J_URI: z.string().regex(/^neo4j(\+s)?:\/\//),

  // BetterAuth
  BETTER_AUTH_URL: z.url(),

  // Object Storage
  OBJECT_STORAGE_ENDPOINT: z.url(),
});

export type InterpolatedConfigInit = z.output<typeof InterpolatedConfigSchema>;

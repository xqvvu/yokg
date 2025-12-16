export const root = ["graph-mind"] as const;

export const http = {
  request: ["http", "req"],
  response: ["http", "res"],
  error: ["http", "error"],
  warn: ["http", "warn"],
} as const;

export const middleware = {
  auth: ["middleware", "auth"],
} as const;

export const mod = {
  auth: ["mod", "auth"],
  users: ["mod", "users"],
} as const;

export const infra = {
  database: ["infra", "database"],
  redis: ["infra", "redis"],
  storage: ["infra", "storage"],
  age: ["infra", "age"],
} as const;

export const betterAuth = ["better-auth"] as const;

export type LogCategory =
  | typeof root
  | (typeof http)[keyof typeof http]
  | (typeof middleware)[keyof typeof middleware]
  | (typeof mod)[keyof typeof mod]
  | (typeof infra)[keyof typeof infra]
  | typeof betterAuth;

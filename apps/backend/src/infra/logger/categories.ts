/**
 * LogTape category definitions for hierarchical logging
 *
 * Structure: ["graph-mind", layer, module?, feature?]
 *
 * Layers:
 * - http: HTTP layer (requests, responses, errors)
 * - middleware: Middleware layer (auth, validation, session)
 * - module: Business modules (auth, users, etc.)
 * - infra: Infrastructure layer (database, redis, etc.)
 * - external: External integrations (better-auth, stripe, etc.)
 *
 * Usage:
 * ```ts
 * import { Categories, getLogger } from "@/infra/logger";
 *
 * const logger = getLogger(Categories.Module.Users);
 * logger.info`User {userId} created`;
 * ```
 */

// ========================================
// Root Logger
// ========================================

/**
 * Root application logger
 * Use for application-level events
 */
export const root = ["graph-mind"] as const;

// ========================================
// HTTP Layer
// ========================================

/**
 * HTTP layer loggers
 * Use for HTTP requests, responses, and errors
 */
export const http = {
  request: ["graph-mind", "http", "request"],
  response: ["graph-mind", "http", "response"],
  error: ["graph-mind", "http", "error"],
  warn: ["graph-mind", "http", "warn"],
} as const;

// ========================================
// Middleware Layer
// ========================================

/**
 * Middleware layer loggers
 * Use for middleware operations (auth, validation, session, etc.)
 */
export const middleware = {
  auth: ["graph-mind", "middleware", "auth"],
  validation: ["graph-mind", "middleware", "validation"],
  session: ["graph-mind", "middleware", "session"],
} as const;

// ========================================
// Business Module Layer
// ========================================

/**
 * Business module loggers
 * Add new modules here as your application grows
 *
 * @example
 * ```ts
 * // Add new module
 * export const mod = {
 *   Auth: ["graph-mind", "module", "auth"],
 *   Users: ["graph-mind", "module", "users"],
 *   YourNewModule: ["graph-mind", "module", "your-new-module"],
 * } as const;
 * ```
 */
export const mod = {
  auth: ["graph-mind", "module", "auth"],
  users: ["graph-mind", "module", "users"],
} as const;

// ========================================
// Infrastructure Layer
// ========================================

/**
 * Infrastructure layer loggers
 * Use for database, redis, and other infrastructure operations
 */
export const infra = {
  database: ["graph-mind", "infra", "database"],
  redis: ["graph-mind", "infra", "redis"],
  neo4j: ["graph-mind", "infra", "neo4j"],
  ai: ["graph-mind", "infra", "ai"],
} as const;

// ========================================
// External Integration Layer
// ========================================

/**
 * External integration loggers
 * Use for third-party services and integrations
 */
export const external = {
  betterAuth: ["graph-mind", "external", "better-auth"],
} as const;

// ========================================
// Type Definitions
// ========================================

/**
 * Union type of all valid log categories
 * Automatically includes all defined categories
 */
export type LogCategory =
  | typeof root
  | (typeof http)[keyof typeof http]
  | (typeof middleware)[keyof typeof middleware]
  | (typeof mod)[keyof typeof mod]
  | (typeof infra)[keyof typeof infra]
  | (typeof external)[keyof typeof external];

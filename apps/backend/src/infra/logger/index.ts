import { AsyncLocalStorage } from "node:async_hooks";
import fs from "node:fs";
import path from "node:path";
import { ErrorCode } from "@graph-mind/shared/lib/error-codes";
import { getFileSink } from "@logtape/file";
import {
  configure as configureLogTape,
  dispose as disposeLogTape,
  getConsoleSink,
  getLogger as getLogTapeLogger,
} from "@logtape/logtape";
import { getPrettyFormatter } from "@logtape/pretty";
import dayjs from "dayjs";
import { SystemException } from "@/exceptions/system-exception";
import { getConfig } from "@/lib/config";
import type { LogCategory } from "./categories";

// ========================================
// Configuration Constants
// ========================================

const logsDir = path.join(process.cwd(), "logs");

const logFiles = {
  all: path.join(logsDir, "all.jsonl"),
  error: path.join(logsDir, "error.jsonl"),
  access: path.join(logsDir, "access.jsonl"),
  database: path.join(logsDir, "database.jsonl"),
  ai: path.join(logsDir, "ai.jsonl"),
} as const;

const sinkConfig = {
  bufferSize: 8192,
  flushInterval: 5000,
  nonBlocking: true,
  lazy: true,
} as const;

const consoleSinkFormatter = getPrettyFormatter({
  icons: false,
  level: "FULL",
  levelStyle: "bold",
  timestamp: () => dayjs().format("YYYY-MM-DD HH:mm:ss"),
  timestampStyle: "dim",
  categorySeparator: ":",
  categoryStyle: "dim",
});

// ========================================
// Singleton State
// ========================================

let configured = false;

// ========================================
// Configuration
// ========================================

export async function configure() {
  if (configured) {
    return;
  }

  fs.mkdirSync(logsDir, { recursive: true });

  const config = getConfig();

  await configureLogTape({
    sinks: {
      console: getConsoleSink({
        ...sinkConfig,
        formatter: consoleSinkFormatter,
      }),
      all: getFileSink(logFiles.all, {
        ...sinkConfig,
        formatter: (record) => `${JSON.stringify(record)}\n`,
      }),
      error: getFileSink(logFiles.error, {
        ...sinkConfig,
        formatter: (record) => `${JSON.stringify(record)}\n`,
      }),
      access: getFileSink(logFiles.access, {
        ...sinkConfig,
        formatter: (record) => `${JSON.stringify(record)}\n`,
      }),
      database: getFileSink(logFiles.database, {
        ...sinkConfig,
        formatter: (record) => `${JSON.stringify(record)}\n`,
      }),
      ai: getFileSink(logFiles.ai, {
        ...sinkConfig,
        formatter: (record) => `${JSON.stringify(record)}\n`,
      }),
    },

    loggers: [
      // LogTape meta logs
      {
        category: ["logtape", "meta"],
        lowestLevel: "fatal",
        sinks: config.isDevelopmentNodeEnv ? ["console"] : [],
      },

      // Root logger
      {
        category: ["graph-mind"],
        lowestLevel: config.isDevelopmentNodeEnv ? "debug" : "info",
        sinks: ["console", "all"],
      },

      // HTTP layer
      {
        category: ["graph-mind", "http"],
        lowestLevel: "info",
        parentSinks: "override",
        sinks: ["console", "access", "all"],
      },
      {
        category: ["graph-mind", "http", "warn"],
        lowestLevel: "warning",
        parentSinks: "override",
        sinks: ["console", "access", "all"],
      },
      {
        category: ["graph-mind", "http", "error"],
        lowestLevel: "error",
        parentSinks: "override",
        sinks: ["console", "error", "access", "all"],
      },

      // Middleware layer
      {
        category: ["graph-mind", "middleware"],
        lowestLevel: config.isDevelopmentNodeEnv ? "debug" : "info",
        parentSinks: "override",
        sinks: ["console", "all"],
      },

      // Business module layer
      {
        category: ["graph-mind", "module"],
        lowestLevel: config.isDevelopmentNodeEnv ? "debug" : "info",
        parentSinks: "override",
        sinks: ["console", "all"],
      },

      // Infrastructure layer
      {
        category: ["graph-mind", "infra", "database"],
        lowestLevel: config.isDevelopmentNodeEnv ? "debug" : "info",
        parentSinks: "override",
        sinks: ["console", "database"],
      },
      {
        category: ["graph-mind", "infra", "ai"],
        lowestLevel: "info",
        parentSinks: "override",
        sinks: ["console", "ai", "all"],
      },

      // External integrations
      {
        category: ["graph-mind", "external"],
        lowestLevel: config.isDevelopmentNodeEnv ? "debug" : "info",
        parentSinks: "override",
        sinks: ["console", "all"],
      },
    ],

    contextLocalStorage: new AsyncLocalStorage(),
  });

  configured = true;
}

// ========================================
// Public API
// ========================================

/**
 * Get a typed logger for a specific category
 *
 * @example
 * ```ts
 * import { getLogger, mod } from "@/infra/logger";
 *
 * const logger = getLogger(mod.users);
 * logger.info`User {userId} created`;
 * ```
 */
export function getLogger(category: LogCategory) {
  if (!configured) {
    throw new SystemException({
      errcode: ErrorCode.INTERNAL_ERROR,
      message: "Logger has not been initialized yet",
    });
  }

  return getLogTapeLogger(category);
}

export async function destroyLogger() {
  if (configured) {
    await disposeLogTape();
    configured = false;
  }
}

/**
 * Re-export LogTape utilities and category definitions
 */
export { withContext } from "@logtape/logtape";
export type { LogCategory } from "@/infra/logger/categories";
export {
  external,
  http,
  infra,
  middleware,
  mod,
  root,
} from "@/infra/logger/categories";

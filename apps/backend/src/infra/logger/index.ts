import { AsyncLocalStorage } from "node:async_hooks";
import {
  configure as configureLogTape,
  dispose as disposeLogTape,
  getConsoleSink,
  getLogger as getLogTapeLogger,
} from "@logtape/logtape";
import { getPrettyFormatter } from "@logtape/pretty";
import dayjs from "dayjs";
import { getConfig } from "@/lib/config";
import type { LogCategory } from "./categories";

const sinkConfig = {
  bufferSize: 8192,
  flushInterval: 5000,
  nonBlocking: true,
  lazy: true,
} as const;

const consoleSinkFormatter = getPrettyFormatter({
  icons: false,
  level: "ABBR",
  levelStyle: "reset",
  categoryStyle: "dim",
  categorySeparator: ":",
  timestamp: () => dayjs().format("YYYY-MM-DD HH:mm:ss"),
});

let configured = false;
export async function configure() {
  if (configured) {
    return;
  }

  const config = getConfig();
  const isDevelopmentNodeEnv = config.isDevelopmentNodeEnv;

  await configureLogTape({
    sinks: {
      console: getConsoleSink({
        ...sinkConfig,
        formatter: consoleSinkFormatter,
      }),
    },

    loggers: [
      {
        category: ["logtape", "meta"],
        lowestLevel: "fatal",
        sinks: isDevelopmentNodeEnv ? ["console"] : [],
      },
      {
        category: ["app"],
        lowestLevel: isDevelopmentNodeEnv ? "debug" : "info",
        sinks: ["console"],
      },
      {
        category: ["error"],
        lowestLevel: "warning",
        sinks: ["console"],
      },
      {
        category: ["http"],
        lowestLevel: "debug",
        sinks: ["console"],
      },
      {
        category: ["middleware"],
        lowestLevel: isDevelopmentNodeEnv ? "debug" : "info",
        sinks: ["console"],
      },
      {
        category: ["infra"],
        lowestLevel: isDevelopmentNodeEnv ? "debug" : "info",
        sinks: ["console"],
      },
      {
        category: ["mod"],
        lowestLevel: isDevelopmentNodeEnv ? "debug" : "info",
        sinks: ["console"],
      },
      {
        category: ["better-auth"],
        lowestLevel: isDevelopmentNodeEnv ? "debug" : "info",
        sinks: ["console"],
      },
    ],

    contextLocalStorage: new AsyncLocalStorage(),
  });

  configured = true;
}

export function getLogger(category: LogCategory) {
  if (!configured) {
    throw new Error("Logger is not ready");
  }

  return getLogTapeLogger(category);
}

export async function destroyLogger() {
  if (configured) {
    await disposeLogTape();
    configured = false;
  }
}

export { type Logger, withContext } from "@logtape/logtape";
export type { LogCategory } from "@/infra/logger/categories";
export { betterAuth, http, infra, middleware, mod, root } from "@/infra/logger/categories";

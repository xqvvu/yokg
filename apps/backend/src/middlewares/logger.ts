import { performance } from "node:perf_hooks";
import { createMiddleware } from "hono/factory";
import type { Logger } from "@/infra/logger";
import { getLogger, http } from "@/infra/logger";

export const logger = createMiddleware<Env>(async function loggerMiddleware(c, next) {
  c.set("logger", getLogger(http.warn));

  const method = c.req.method;
  const path = c.req.path;

  getLogger(http.request).info(`[${method}] ${path}`);
  const start = performance.now();

  await next();

  const duration = parseFloat((performance.now() - start).toFixed(3));
  let level: keyof Logger = "info";
  const status = c.res.status;
  if (status < 200 || status >= 400) {
    level = "warn";
  }
  getLogger(http.response)[level](`[${method}] ${path} - ${duration}ms ${c.res.status}`);
});

import { performance } from "node:perf_hooks";
import { createMiddleware } from "hono/factory";
import { getLogger, http } from "@/infra/logger";

export const logger = createMiddleware<Env>(async function loggerMiddleware(c, next) {
  c.set("logger", getLogger(http.warn));

  getLogger(http.request).info`${c.req.method} ${c.req.path}`;
  const start = performance.now();

  await next();

  const duration = Number((performance.now() - start).toFixed(3));
  getLogger(http.response).info`${c.res.status} ${c.req.method} ${c.req.path} - ${duration}ms`;
});

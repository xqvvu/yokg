import { Hono } from "hono";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { requestId } from "hono/request-id";
import type { Config } from "@/lib/config";
import { getConfig } from "@/lib/config";
import { createErrorHandler, createNotFoundHandler } from "@/lib/error-handler";
import { R } from "@/lib/http";
import { logger } from "@/middlewares/logger";
import { auth } from "@/modules/auth/auth.route";
import { users } from "@/modules/users/users.route";

type App = Readonly<Hono<Env>>;

export async function createApp({ server }: Config = getConfig()): Promise<App> {
  const app = new Hono<Env>();

  // #region ---------------------middlewares-----------------------//
  app.use(
    "*",
    cors({
      credentials: true,
      origin: server.corsAllowedOrigins,
      allowHeaders: server.corsAllowedHeaders,
      allowMethods: server.corsAllowedMethods,
    }),
  );
  app.use("*", logger);
  app.use("*", requestId());
  // app.use("*", injectSession);
  // app.use("*", requireAuth);
  app.use("*", compress());
  // #endregion ----------------------------------------------------//

  // #region ---------------------routes----------------------------//
  app.get("/api/healthz", (c) => R.ok(c, "ok"));
  app.get("/api/ping", (c) => R.ok(c, "pong"));
  app.get("/healthz", (c) => R.ok(c, "ok"));
  app.get("/ping", (c) => R.ok(c, "pong"));

  app.route("/api", auth);
  app.route("/api", users);
  // #endregion ----------------------------------------------------//

  // #region ---------------------event handlers--------------------//
  app.onError(createErrorHandler());
  app.notFound(createNotFoundHandler());
  // #endregion ----------------------------------------------------//

  return app;
}

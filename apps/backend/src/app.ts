import { ErrorCode } from "@graph-mind/shared/lib/error-codes";
import { Hono } from "hono";
import { compress } from "hono/compress";
import { cors } from "hono/cors";
import { HTTPException } from "hono/http-exception";
import { requestId } from "hono/request-id";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { ZodError, z } from "zod";
import { BusinessException } from "@/exceptions/business-exception";
import { SystemException } from "@/exceptions/system-exception";
import type { Config } from "@/lib/config";
import { getConfig } from "@/lib/config";
import { R } from "@/lib/http";
import { logger } from "@/middlewares/logger";
import { auth } from "@/modules/auth/auth.route";
import { llm } from "@/modules/llm/llm.route";
import { users } from "@/modules/users/users.route";

type App = Readonly<Hono<Env>>;

export async function createApp(config: Config = getConfig()): Promise<App> {
  const app = new Hono<Env>();

  // #region ---------------------middlewares-----------------------//
  app.use(
    "*",
    cors({
      credentials: true,
      origin: config.corsAllowedOrigins,
      allowHeaders: config.corsAllowedHeaders,
      allowMethods: config.corsAllowedMethods,
    }),
  );
  app.use("*", logger);
  app.use("*", requestId());
  // app.use("*", injectSession);
  // app.use("*", requireAuth);
  app.use("*", compress());
  // #endregion ----------------------------------------------------//

  // #region ---------------------routes----------------------------//
  app.route("/api", auth);
  app.route("/api", users);
  app.route("/api", llm);
  // #endregion ----------------------------------------------------//

  // #region ---------------------event handlers--------------------//
  app.onError((err, c) => {
    const logger = c.get("logger");

    // Handle BusinessException - expected business errors (log at warn level)
    if (err instanceof BusinessException) {
      logger.warn`Business exception: ${err.message} [errcode=${err.errcode}]`;
      const status = err.status;
      c.status(status);
      return R.fail(c, {
        errcode: err.errcode,
        errmsg: err.message || "Business exception",
      });
    }

    // Handle SystemException - unexpected system errors (log at error level)
    if (err instanceof SystemException) {
      logger.fatal`System exception: ${err.message} [errcode=${err.errcode}]`;
      const status = err.status;
      c.status(status);
      return R.fail(c, {
        errcode: err.errcode,
        errmsg: err.message || "System exception",
      });
    }

    // Handle ZodError - validation errors (log at warn level)
    if (err instanceof ZodError) {
      const prettyError = z.prettifyError(err);
      logger.warn`Zod validation error: ${prettyError}`;
      c.status(400);
      return R.fail(c, {
        errcode: ErrorCode.INVALID_REQUEST,
        errmsg: prettyError,
      });
    }

    // Handle HTTPException (log at warn level)
    if (err instanceof HTTPException) {
      logger.error`HTTP exception: ${err.message} [status=${err.status}]`;
      const response = err.getResponse();
      const status = response.status as ContentfulStatusCode;
      c.status(status);
      return R.fail(c, {
        errcode: ErrorCode.INTERNAL_ERROR,
        errmsg: err.message || "Internal error",
      });
    }

    // Handle generic Error - unexpected errors (log at error level with stack)
    if (err instanceof Error) {
      logger.error`Unhandled error: ${err.message}`;
      c.status(500);
      return R.fail(c, {
        errcode: ErrorCode.INTERNAL_ERROR,
        errmsg: err.message,
      });
    }

    // Unknown error type - log as critical
    logger.error`Unknown error type: ${String(err)}`;
    c.status(500);
    return R.fail(c, {
      errcode: ErrorCode.INTERNAL_ERROR,
      errmsg: "Unknown internal error",
    });
  });

  app.notFound((c) => {
    const logger = c.get("logger");
    c.status(404);
    logger.warn`Resource not found: ${c.req.path}`;
    return R.fail(c, {
      errcode: ErrorCode.NOT_FOUND,
      errmsg: "Resource not found",
    });
  });
  // #endregion ----------------------------------------------------//

  return app;
}

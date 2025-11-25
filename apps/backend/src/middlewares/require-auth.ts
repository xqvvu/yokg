import { ErrorCode } from "@graph-mind/shared/lib/error-codes";
import { isBefore } from "date-fns";
import { createMiddleware } from "hono/factory";
import { BusinessException } from "@/exceptions/business-exception";
import { getLogger, middleware } from "@/infra/logger";

export const requireAuth = createMiddleware<Env>(
  async function requireAuthMiddleware(c, next) {
    const logger = getLogger(middleware.auth);

    if (/^\/api\/auth\/(sign-in\/email|sign-up\/email)/.test(c.req.path)) {
      await next();
      return;
    }

    const user = c.get("user");
    const session = c.get("session");

    if (user === null || session === null) {
      logger.warn`Unauthorized access attempt to ${c.req.path}`;
      throw new BusinessException(401, {
        errcode: ErrorCode.UNAUTHORIZED,
        message: "Unauthorized",
      });
    }

    const now = new Date();
    if (isBefore(session.expiresAt, now)) {
      logger.warn`Expired session for user ${user.id} accessing ${c.req.path}`;
      throw new BusinessException(401, {
        errcode: ErrorCode.UNAUTHORIZED,
        message: "Session expired",
      });
    }

    await next();
  },
);

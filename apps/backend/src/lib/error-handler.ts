import { ErrorCode } from "@graph-mind/shared/lib/error-codes";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { BusinessError } from "@/errors/business-error";
import { SystemError } from "@/errors/system-error";
import type { Logger } from "@/infra/logger";
import { getLogger } from "@/infra/logger";
import { error } from "@/infra/logger/categories";
import { R } from "@/lib/http";

type ErrorResult =
  | {
      handled: true;
      status: ContentfulStatusCode;
      errcode: number;
      errmsg: string;
    }
  | {
      handled: false;
    };

type ErrorHandlerFn = (err: unknown, logger: Logger) => ErrorResult;

const pipe = (...handlers: ErrorHandlerFn[]): ErrorHandlerFn => {
  return (err: unknown, logger: Logger): ErrorResult => {
    for (const handler of handlers) {
      const result = handler(err, logger);
      if (result.handled) {
        return result;
      }
    }
    return { handled: false };
  };
};

const handleBusinessError: ErrorHandlerFn = (err) => {
  if (!(err instanceof BusinessError)) {
    return { handled: false };
  }

  getLogger(error.business).warn(`${err.message} - errcode=${err.errcode}`);

  return {
    handled: true,
    status: err.status,
    errcode: err.errcode,
    errmsg: err.message || "Business error",
  };
};

const handleSystemError: ErrorHandlerFn = (err) => {
  if (!(err instanceof SystemError)) {
    return { handled: false };
  }

  getLogger(error.system).fatal(`${err.message} - errcode=${err.errcode}`);

  return {
    handled: true,
    status: err.status,
    errcode: err.errcode,
    errmsg: err.message || "System error",
  };
};

const handleHTTPException: ErrorHandlerFn = (err, logger) => {
  if (!(err instanceof HTTPException)) {
    return { handled: false };
  }

  logger.error(`${err.message} - status=${err.status}`);

  return {
    handled: true,
    status: err.status as ContentfulStatusCode,
    errcode: ErrorCode.INTERNAL_ERROR,
    errmsg: err.message || "Internal error",
  };
};

const handleError: ErrorHandlerFn = (err, logger) => {
  if (!(err instanceof Error)) {
    return { handled: false };
  }

  logger.error(`Unhandled error: ${err.message}`);

  return {
    handled: true,
    status: 500,
    errcode: ErrorCode.INTERNAL_ERROR,
    errmsg: err.message,
  };
};

const handleUnknown: ErrorHandlerFn = (err, logger) => {
  logger.error(`Unknown error type: ${String(err)}`);

  return {
    handled: true,
    status: 500,
    errcode: ErrorCode.INTERNAL_ERROR,
    errmsg: "Unknown internal error",
  };
};

const errorPipeline = pipe(
  handleBusinessError,
  handleSystemError,
  handleHTTPException,
  handleError,
  handleUnknown,
);

export function createErrorHandler() {
  return (err: unknown, c: Context<Env>) => {
    const logger = c.get("logger");
    const result = errorPipeline(err, logger);

    if (!result.handled) {
      logger.error(`Failed to handle error: ${String(err)}`);
      c.status(500);
      return R.fail(c, {
        errcode: ErrorCode.INTERNAL_ERROR,
        errmsg: "Internal error",
      });
    }

    c.status(result.status);
    return R.fail(c, {
      errcode: result.errcode,
      errmsg: result.errmsg,
    });
  };
}

export function createNotFoundHandler() {
  return (c: Context<Env>) => {
    const logger = c.get("logger");
    const method = c.req.method;
    const path = c.req.path;
    const query = c.req.query();
    const queryString = new URLSearchParams(query);
    const queryPart = queryString.toString();

    c.status(404);
    logger.warn(`Resource not found: ${method} ${path}${queryPart ? `?${queryPart}` : ""}`);

    return R.fail(c, {
      errcode: ErrorCode.NOT_FOUND,
      errmsg: "Resource not found",
    });
  };
}

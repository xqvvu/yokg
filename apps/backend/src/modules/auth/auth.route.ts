import {
  SignInEmailSchema,
  SignUpEmailSchema,
} from "@graph-mind/shared/validate/auth";
import { Hono } from "hono";
import { cloneRawRequest } from "hono/request";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { BusinessException } from "@/exceptions/business-exception";
import { getLogger, mod } from "@/infra/logger";
import { getBetterAuth } from "@/lib/auth";
import { mapBetterAuthError } from "@/lib/better-auth-error-mapper";
import { cloneAndFormatJSONResponse } from "@/lib/result";
import { validator } from "@/middlewares/validator";

export const auth = new Hono<Env>().basePath("/auth");

auth.post(
  "/sign-in/email",
  validator("json", SignInEmailSchema),
  async function signInEmailHanlder(c) {
    const logger = getLogger(mod.auth);
    const body = c.req.valid("json");
    logger.debug`Sign-in attempt for email ${body.email}`;

    const request = await cloneRawRequest(c.req);
    const response = await getBetterAuth().handler(request);

    if (response.ok) {
      logger.debug`Sign-in successful for email ${body.email}`;
      return cloneAndFormatJSONResponse(response);
    }

    const data = await response.json();
    logger.warn`Sign-in failed for email ${body.email}: ${data.message}`;
    throw new BusinessException(response.status as ContentfulStatusCode, {
      errcode: mapBetterAuthError(data.code),
      message: data.message,
    });
  },
);

auth.post(
  "/sign-up/email",
  validator("json", SignUpEmailSchema),
  async function signUpEmailHandler(c) {
    const logger = getLogger(mod.auth);
    const body = c.req.valid("json");
    logger.debug`Sign-up attempt for email ${body.email}`;

    const request = await cloneRawRequest(c.req);
    const response = await getBetterAuth().handler(request);

    if (response.ok) {
      logger.debug`Sign-up successful for email ${body.email}`;
      return cloneAndFormatJSONResponse(response);
    }

    const data = await response.json();
    logger.warn`Sign-up failed for email ${body.email}: ${data.message}`;
    throw new BusinessException(response.status as ContentfulStatusCode, {
      errcode: mapBetterAuthError(data.code),
      message: data.message,
    });
  },
);

auth.post("/sign-out", async function signOutHandler(c) {
  const logger = getLogger(mod.auth);
  const user = c.get("user");
  logger.debug`Sign-out for user ${user.id}`;

  const request = await cloneRawRequest(c.req);
  const response = await getBetterAuth().handler(request);

  if (response.ok) {
    logger.debug`Sign-out successful for user ${user.id}`;
    return cloneAndFormatJSONResponse(response);
  }

  const data = await response.json();
  logger.warn`Sign-out failed for user ${user.id}: ${data.message}`;
  throw new BusinessException(response.status as ContentfulStatusCode, {
    errcode: mapBetterAuthError(data.code),
    message: data.message,
  });
});

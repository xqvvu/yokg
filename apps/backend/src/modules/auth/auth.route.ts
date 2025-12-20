import { SignInEmailSchema, SignUpEmailSchema } from "@graph-mind/shared/validate/auth";
import { Hono } from "hono";
import { cloneRawRequest } from "hono/request";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { BusinessError } from "@/errors/business-error";
import { getLogger, mod } from "@/infra/logger";
import { getBetterAuth } from "@/lib/auth";
import { mapBetterAuthError } from "@/lib/better-auth-error-mapper";
import { cloneAndFormatJSONResponse } from "@/lib/http";
import { validator } from "@/middlewares/validator";

export const auth = new Hono<Env>().basePath("/auth");

auth.post(
  "/sign-in/email",
  validator("json", SignInEmailSchema),
  async function signInEmailHanlder(c) {
    const authLogger = getLogger(mod.auth);
    const body = c.req.valid("json");
    authLogger.debug(`Sign-in attempt for email ${body.email}`);

    const request = await cloneRawRequest(c.req);
    const response = await getBetterAuth().handler(request);

    if (response.ok) {
      authLogger.debug(`Sign-in successful for email ${body.email}`);
      return cloneAndFormatJSONResponse(response);
    }

    const data = await response.json();
    authLogger.warn(`Sign-in failed for email ${body.email}: ${data.message}`);
    throw new BusinessError(response.status as ContentfulStatusCode, {
      errcode: mapBetterAuthError(data.code),
      message: data.message,
    });
  },
);

auth.post(
  "/sign-up/email",
  validator("json", SignUpEmailSchema),
  async function signUpEmailHandler(c) {
    const authLogger = getLogger(mod.auth);
    const body = c.req.valid("json");
    authLogger.debug(`Sign-up attempt for email ${body.email}`);

    const request = await cloneRawRequest(c.req);
    const response = await getBetterAuth().handler(request);

    if (response.ok) {
      authLogger.debug(`Sign-up successful for email ${body.email}`);
      return cloneAndFormatJSONResponse(response);
    }

    const data = await response.json();
    authLogger.warn(`Sign-up failed for email ${body.email}: ${data.message}`);
    throw new BusinessError(response.status as ContentfulStatusCode, {
      errcode: mapBetterAuthError(data.code),
      message: data.message,
    });
  },
);

auth.post("/sign-out", async function signOutHandler(c) {
  const authLogger = getLogger(mod.auth);
  const user = c.get("user");
  authLogger.debug(`Sign-out for user ${user.id}`);

  const request = await cloneRawRequest(c.req);
  const response = await getBetterAuth().handler(request);

  if (response.ok) {
    authLogger.debug(`Sign-out successful for user ${user.id}`);
    return cloneAndFormatJSONResponse(response);
  }

  const data = await response.json();
  authLogger.warn(`Sign-out failed for user ${user.id}: ${data.message}`);
  throw new BusinessError(response.status as ContentfulStatusCode, {
    errcode: mapBetterAuthError(data.code),
    message: data.message,
  });
});

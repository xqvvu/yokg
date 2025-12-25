import type { ISession } from "@yokg/shared/validate/session";
import type { IUser } from "@yokg/shared/validate/users";
import { isNil } from "es-toolkit";
import { createMiddleware } from "hono/factory";
import { getBetterAuth } from "@/lib/auth";

export const injectSession = createMiddleware<Env>(
  // FIXME: we shouldn't always inject session into the context
  // because it will query database every time and cause performance issues
  async function injectSessionMiddleware(c, next) {
    const betterAuth = getBetterAuth();

    if (isNil(betterAuth)) {
      c.set("user", null as unknown as IUser);
      c.set("session", null as unknown as ISession);
      await next();
      return;
    }

    const headers = c.req.raw.headers;
    const session = await betterAuth.api.getSession({ headers });
    if (isNil(session)) {
      c.set("user", null as unknown as IUser);
      c.set("session", null as unknown as ISession);
      await next();
      return;
    }

    c.set("user", session.user as IUser);
    c.set("session", session.session as ISession);
    await next();
  },
);

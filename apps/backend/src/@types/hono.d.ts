import type { ISession } from "@yokg/shared/validate/session";
import type { IUser } from "@yokg/shared/validate/users";
import type { Logger } from "@logtape/logtape";
import type { RequestIdVariables } from "hono/request-id";

declare global {
  type Env = {
    Variables: RequestIdVariables & {
      // better-auth
      user: IUser;
      session: ISession;
      // logtape
      logger: Logger;
    };
  };
}

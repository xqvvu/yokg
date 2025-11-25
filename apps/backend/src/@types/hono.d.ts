import type { ISession } from "@graph-mind/shared/validate/session";
import type { IUser } from "@graph-mind/shared/validate/users";
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

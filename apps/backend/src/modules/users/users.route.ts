import { Hono } from "hono";
import { z } from "zod";
import { getLogger, mod } from "@/infra/logger";
import { R } from "@/lib/http";
import { validator } from "@/middlewares/validator";
import { getUserService } from "@/modules/users/users.service";

export const users = new Hono<Env>();

users.basePath("/users");

users.use("*", (c, next) => {
  c.set("logger", getLogger(mod.users));
  return next();
});

users.get("/", async function selectAllUsersHandler(c) {
  const users = await getUserService().selectAllUsers();
  return R.ok(c, users);
});

users.get(
  "/:id",
  validator("param", z.object({ id: z.string().length(32) })),
  async function selectUserByIdHandler(c) {
    const { id } = c.req.valid("param");
    const user = await getUserService().selectUserById(id);
    return R.ok(c, user);
  },
);

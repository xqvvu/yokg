import { Hono } from "hono";
import { z } from "zod";
import { R } from "@/lib/http";
import { validator } from "@/middlewares/validator";
import { getUserService } from "@/modules/users/users.service";

export const users = new Hono<Env>().basePath("/users");

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

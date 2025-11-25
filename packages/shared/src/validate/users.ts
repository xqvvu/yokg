import { users } from "@graph-mind/shared/tables/auth";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const SelectUserSchema = createSelectSchema(users);
export type IUser = z.infer<typeof SelectUserSchema>;

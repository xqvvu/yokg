import { accounts } from "@graph-mind/shared/tables/auth";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const SelectAccountSchema = createSelectSchema(accounts);
export type IAccount = z.infer<typeof SelectAccountSchema>;

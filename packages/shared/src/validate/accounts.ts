import { accounts } from "@yokg/shared/tables/auth";
import { createSelectSchema } from "drizzle-zod";
import type { z } from "zod";

export const SelectAccountSchema = createSelectSchema(accounts);
export type IAccount = z.infer<typeof SelectAccountSchema>;

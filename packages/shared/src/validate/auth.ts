import type { BetterAuthResult } from "@yokg/shared/types/http";
import type { IUser } from "@yokg/shared/validate/users";
import { z } from "zod";

export const SignUpEmailSchema = z.object({
  email: z.email("auth.errors.invalid_email_format"),
  name: z.string().nonempty().max(32),
  password: z
    .string()
    .nonempty()
    .min(8, { error: "auth.errors.password_too_short" })
    .max(32, { error: "auth.errors.password_too_long" })
    .regex(/^(?=.*?[A-Za-z])(?=.*?[0-9]).{8,}$/, {
      error: "auth.errors.invalid_password_format",
    }),
});
export type SignUpEmailDto = z.infer<typeof SignUpEmailSchema>;
export type SignUpEmailResult = BetterAuthResult<{
  user: IUser;
  token: string;
}>;

export const SignInEmailSchema = SignUpEmailSchema.pick({
  email: true,
  password: true,
});
export type SignInEmailDto = z.infer<typeof SignInEmailSchema>;
export type SignInEmailResult = BetterAuthResult<{
  user: IUser;
  token: string;
  redirect: boolean;
  url?: string;
}>;

export type SignOutResult = BetterAuthResult<{ success: boolean }>;

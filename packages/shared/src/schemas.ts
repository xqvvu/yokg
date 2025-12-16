import { accounts, sessions, users, verifications } from "./tables/auth";

export const schema = {
  accounts,
  sessions,
  users,
  verifications,
} as const;

export { accounts, sessions, users, verifications } from "./tables/auth";

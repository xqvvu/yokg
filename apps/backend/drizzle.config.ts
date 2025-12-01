import path from "node:path";
import { defineConfig } from "drizzle-kit";

const schemaPath = path.join(
  import.meta.dirname,
  "../../packages/shared/src/schemas.ts",
);

const schemaOutputPath = path.join(import.meta.dirname, "drizzle");

const dbUrl = process.env.DATABASE_URL || "";

export default defineConfig({
  schema: schemaPath,
  dialect: "postgresql",
  casing: "snake_case",
  out: schemaOutputPath,
  dbCredentials: {
    url: dbUrl,
  },
});

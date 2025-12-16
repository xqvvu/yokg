import path from "node:path";
import { beforeAll } from "vitest";
import { configure as configureStorage } from "@/infra/storage/client";

beforeAll(() => {
  process.loadEnvFile(path.join(import.meta.dirname, "../../../.env"));
  configureStorage();
});

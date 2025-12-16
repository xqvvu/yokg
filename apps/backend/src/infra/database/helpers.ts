import { getLogger, infra } from "@/infra/logger";

export function getDbLogger() {
  return getLogger(infra.database);
}

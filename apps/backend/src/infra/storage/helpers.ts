import { getLogger, infra } from "@/infra/logger";

export function getStorageLogger() {
  return getLogger(infra.storage);
}

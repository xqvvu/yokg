import { getLogger, infra } from "@/infra/logger";

export function getRedisLogger() {
  return getLogger(infra.redis);
}

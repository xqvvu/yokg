import { DEFAULT_PREFIX_URL, TIMEOUT } from "@graph-mind/ky/constants";
import type { KyInstance } from "ky";
import ky from "ky";

/**
 * @default prefixUrl "/api"
 * @param prefixUrl Base URL
 * @returns ky instance
 */
export function createServerKy(prefixUrl?: string): KyInstance {
  return ky.extend({
    prefixUrl: prefixUrl || DEFAULT_PREFIX_URL,
    hooks: {
      beforeRequest: [],
    },
    timeout: TIMEOUT,
  });
}

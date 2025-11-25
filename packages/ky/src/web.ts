import { DEFAULT_PREFIX_URL, TIMEOUT } from "@graph-mind/ky/constants";
import { afterResponseDestructureResult } from "@graph-mind/ky/hooks";
import type { KyInstance } from "ky";
import ky from "ky";

/**
 * @default prefixUrl "/api"
 * @param prefixUrl Base URL
 * @returns `ky` instance
 */
export function createWebKy(prefixUrl?: string): KyInstance {
  return ky.extend({
    headers: {
      "Content-Type": "application/json; charset=utf-8", // by defalt
    },
    credentials: "include", // authorization
    prefixUrl: prefixUrl || DEFAULT_PREFIX_URL,
    hooks: {
      afterResponse: [afterResponseDestructureResult],
    },
    timeout: TIMEOUT,
    retry: 0, // Retry will rely on Tanstack Query
  });
}

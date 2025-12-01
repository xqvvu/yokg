import type { KyInstance } from "ky";
import ky from "ky";

/**
 * @returns ky instance
 */
export function createServerKy(): KyInstance {
  return ky.extend({
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    hooks: {
      beforeRequest: [],
    },
  });
}

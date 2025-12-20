import type { Result } from "@graph-mind/shared/types/http";
import _ky from "ky";
import { env } from "@/env";

export const ky = _ky.extend({
  prefixUrl: env.VITE_API_BASE_URL,
  credentials: "include",
  timeout: 60_000,
  parseJson: (text) => {
    const res: Result = JSON.parse(text);
    if (!res.ok) throw new Error(res.errmsg);
    return res.data;
  },
});

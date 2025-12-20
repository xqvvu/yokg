import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  client: {
    VITE_API_BASE_URL: z.url(),
  },
  clientPrefix: "VITE_",
  isServer: false,
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});

import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/main.ts"],
  noExternal: [/^@yokg\//],
  target: "node24",
  minify: true,
});

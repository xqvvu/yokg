import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/main.ts"],
  noExternal: [/^@graph-mind\//],
  target: "node24",
  minify: true,
});

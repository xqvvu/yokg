import tsconfigPaths from "vite-tsconfig-paths";
import { defineProject } from "vitest/config";

export default defineProject({
  plugins: [tsconfigPaths()],

  test: {
    name: "backend:unit",
    environment: "node",
    include: ["test/unit/**/*.{test,spec}.ts", "src/**/*.{test,spec}.ts"],
    setupFiles: ["test/unit/setup.ts"],
  },
});

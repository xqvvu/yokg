import fs from "node:fs";
import path from "node:path";
import perf_hooks from "node:perf_hooks";

const skips = new Set(["openspec", ".git", ".idea", ".vscode", ".cursor", ".claude", ".DS_Store"]);

function isNodeModules(name: string): name is "node_modules" {
  return name === "node_modules";
}

async function remove(nodeModules: string) {
  console.info(`🧹 Start delete ${nodeModules}`);
  await fs.promises.rm(nodeModules, { recursive: true, force: true });
  console.info(`⭕ Deleted ${nodeModules}`);
}

async function scan(dir: string, paths: string[]) {
  try {
    const entries = await fs.promises.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const fullpath = path.join(dir, entry.name);

      if (isNodeModules(entry.name)) {
        paths.push(fullpath);
      } else if (!skips.has(entry.name)) {
        await scan(fullpath, paths);
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Error access ${dir}:`, message);
  }
}

async function main() {
  const root = path.resolve(import.meta.dirname, "..");
  const paths: string[] = [];

  console.info(`🧹 Start cleanup from: ${root}`);
  const start = perf_hooks.performance.now();
  await scan(root, paths);
  await Promise.all(paths.map((nodeModules) => remove(nodeModules)));
  const elapsed = perf_hooks.performance.now() - start;
  console.info("✅ Cleanup completed, it took %dms", elapsed.toFixed(1));
}

void (await main());

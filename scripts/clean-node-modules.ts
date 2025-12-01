import fs from "node:fs/promises";
import path from "node:path";

const skippedDirs = new Set([
  ".git",
  ".idea",
  ".vscode",
  ".cursor",
  ".claude",
  ".DS_Store",
  "openspec",
]);

function isNodeModules(name: string) {
  return name === "node_modules";
}

async function removeDirectory(dirPath: string) {
  console.info(`🧹 Start delete ${dirPath}`);
  await fs.rm(dirPath, { recursive: true, force: true });
  console.info(`⭕ Deleted ${dirPath}`);
}

async function scanAndClean(dir: string) {
  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    const promises = [];

    for (const entry of entries) {
      if (!entry.isDirectory()) continue;

      const fullPath = path.join(dir, entry.name);

      if (isNodeModules(entry.name)) {
        promises.push(removeDirectory(fullPath));
      } else if (!skippedDirs.has(entry.name)) {
        promises.push(scanAndClean(fullPath));
      }
    }

    await Promise.all(promises);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    console.error(`❌ Error access ${dir}:`, message);
  }
}

async function main() {
  const projectRoot = path.resolve(import.meta.dirname, "..");

  console.info(`🧹 Start cleanup from: ${projectRoot}`);
  await scanAndClean(projectRoot);
  console.info("✅ Cleanup completed");
}

await main();

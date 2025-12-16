import { serve } from "@hono/node-server";
import { createApp } from "@/app";
import { configure as age, destroyAgePool } from "@/infra/age";
import { configure as database, destroyDb } from "@/infra/database";
import { destroyLogger, getLogger, configure as logger, root } from "@/infra/logger";
import { destroyRdb, configure as redis } from "@/infra/redis";
import { destroyStorage, configure as storage } from "@/infra/storage";
import { configure as betterAuth } from "@/lib/auth";
import { getConfig } from "@/lib/config";

export async function prepare() {
  await logger();
  await Promise.all([database(), age(), redis(), storage(), betterAuth()]);
}

export async function destroy() {
  await Promise.all([destroyDb(), destroyAgePool(), destroyRdb(), destroyStorage()]);
  await destroyLogger();
}

async function shutdown() {
  const logger = getLogger(root);
  logger.info`Gracefully shutdown`;

  await destroy();
  process.exit(0);
}

async function bootstrap() {
  await prepare();

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);

  const config = getConfig();
  const app = await createApp(config);

  serve(
    {
      fetch: app.fetch,
      port: config.port,
    },
    (info) => {
      const logger = getLogger(root);
      const address = info.address === "::" ? "localhost" : info.address;
      const url = `http://${address}:${info.port}`;
      logger.info(`Node.js version: ${process.version}`);
      logger.info(`Server is running on ${url}`);
    },
  );
}

void bootstrap();

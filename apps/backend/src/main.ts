import { serve } from "@hono/node-server";
import { createApp } from "@/app";
import { configure as database } from "@/infra/database";
import { getLogger, configure as logger, root } from "@/infra/logger";
import { configure as neo4j, initializeNeo4jDatabase } from "@/infra/neo4j";
import { configure as redis } from "@/infra/redis";
import { configure as betterAuth } from "@/lib/auth";
import { getConfig } from "@/lib/config";

export async function prepare() {
  await logger();
  await database();
  await redis();
  await neo4j();
  await initializeNeo4jDatabase();
  await betterAuth();
}

async function bootstrap() {
  await prepare();

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
      logger.info`Node.js version: ${process.version}`;
      logger.info`Server is running on ${url}`;
    },
  );
}

void bootstrap();

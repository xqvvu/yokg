import { isNil, isNotNil } from "es-toolkit";
import neo4j, {
  type Driver,
  type Session,
  type SessionConfig,
} from "neo4j-driver";
import { getLogger, infra } from "@/infra/logger";
import { getConfig } from "@/lib/config";

let driver: Driver | null = null;
let database: string | null = null;

export function getNeo4jDriver(): Driver {
  if (isNil(driver)) {
    throw new Error("Neo4j driver not initialized");
  }
  return driver;
}

export async function configure(): Promise<void> {
  if (isNotNil(driver)) {
    return;
  }

  const config = getConfig();
  const logger = getLogger(infra.neo4j);

  driver = neo4j.driver(
    config.neo4jUri,
    neo4j.auth.basic(config.neo4jUser, config.neo4jPassword),
    {
      maxConnectionPoolSize: config.neo4jMaxConnectionPoolSize,
      connectionAcquisitionTimeout: config.neo4jConnectionTimeout,
    },
  );

  database = config.neo4jDatabase;

  await driver.verifyConnectivity();

  logger.info`Neo4j driver connect successfully`;
}

export async function destroyNeo4j(): Promise<void> {
  if (isNotNil(driver)) {
    await driver.close();
    driver = null;
    database = null;
  }
}

export function getReadSession(): Session {
  const sessionConfig: SessionConfig = {
    defaultAccessMode: neo4j.session.READ,
  };
  if (isNotNil(database)) {
    sessionConfig.database = database;
  }
  return getNeo4jDriver().session(sessionConfig);
}

export function getWriteSession(): Session {
  const sessionConfig: SessionConfig = {
    defaultAccessMode: neo4j.session.WRITE,
  };
  if (isNotNil(database)) {
    sessionConfig.database = database;
  }
  return getNeo4jDriver().session(sessionConfig);
}

export async function withSession<T>(
  callback: (session: Session) => Promise<T>,
  accessMode: "READ" | "WRITE" = "READ",
): Promise<T> {
  const session = accessMode === "READ" ? getReadSession() : getWriteSession();

  try {
    return await callback(session);
  } finally {
    await session.close();
  }
}

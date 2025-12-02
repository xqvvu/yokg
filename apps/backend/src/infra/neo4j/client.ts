import { isNil, isNotNil } from "es-toolkit";
import neo4j, { type Driver, type Session } from "neo4j-driver";
import { getLogger, infra } from "@/infra/logger";
import { loadNeo4jConfig } from "./config";

let driver: Driver | null = null;

/**
 * Get the Neo4j driver singleton instance
 */
export function getNeo4jDriver(): Driver {
  if (isNil(driver)) {
    throw new Error("Neo4j driver not initialized. Call configure() first.");
  }
  return driver;
}

/**
 * Initialize and connect to Neo4j database
 */
export async function configure(): Promise<void> {
  const logger = getLogger(infra.neo4j);

  if (isNotNil(driver)) {
    logger.warn`Neo4j driver already connected`;
    return;
  }

  try {
    const config = loadNeo4jConfig();

    // Redact password for logging
    const redactedUri = config.uri.replace(/\/\/([^:]+):([^@]+)@/, "//$1:***@");

    logger.info`Initialize Neo4j at ${redactedUri}`;

    driver = neo4j.driver(
      config.uri,
      neo4j.auth.basic(config.username, config.password),
      {
        maxConnectionPoolSize: config.maxConnectionPoolSize,
        connectionAcquisitionTimeout: config.connectionTimeout,
      },
    );

    // Verify connectivity
    await driver.verifyConnectivity();

    logger.info`Neo4j driver connected successfully`;
  } catch (error) {
    logger.error`Failed to connect to Neo4j: ${error}`;
    driver = null;
    throw error;
  }
}

/**
 * Disconnect from Neo4j database
 */
export async function destroy(): Promise<void> {
  const logger = getLogger(infra.neo4j);

  if (isNil(driver)) {
    logger.debug`Neo4j driver not connected, skipping disconnect`;
    return;
  }

  try {
    logger.info`Disconnecting from Neo4j`;
    await driver.close();
    driver = null;
    logger.info`Neo4j driver disconnected`;
  } catch (error) {
    logger.error`Error disconnecting from Neo4j: ${error}`;
    throw error;
  }
}

/**
 * Get a read session
 */
export function getReadSession(): Session {
  return getNeo4jDriver().session({ defaultAccessMode: neo4j.session.READ });
}

/**
 * Get a write session
 */
export function getWriteSession(): Session {
  return getNeo4jDriver().session({ defaultAccessMode: neo4j.session.WRITE });
}

/**
 * Execute a function with a session that automatically closes
 */
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

import type { Config } from "neo4j-driver";

export interface Neo4jConfig {
  uri: string;
  username: string;
  password: string;
  maxConnectionPoolSize: number;
  connectionTimeout: number;
}

/**
 * Load and validate Neo4j configuration from environment variables
 */
export function loadNeo4jConfig(): Neo4jConfig {
  const uri = process.env.NEO4J_URI;
  const username = process.env.NEO4J_USERNAME || "neo4j";
  const password = process.env.NEO4J_PASSWORD;

  // Validate required variables
  if (!uri) {
    throw new Error(
      "NEO4J_URI environment variable is required (e.g., neo4j://localhost:7687)",
    );
  }

  if (!password) {
    throw new Error("NEO4J_PASSWORD environment variable is required");
  }

  // Validate URI format
  if (!uri.startsWith("neo4j://") && !uri.startsWith("neo4j+s://")) {
    throw new Error(
      `Invalid NEO4J_URI format: ${uri}. Must start with 'neo4j://' or 'neo4j+s://'`,
    );
  }

  // Parse optional configuration
  const maxConnectionPoolSize = process.env.NEO4J_MAX_CONNECTION_POOL_SIZE
    ? Number.parseInt(process.env.NEO4J_MAX_CONNECTION_POOL_SIZE, 10)
    : defaultConfig.maxConnectionPoolSize;

  const connectionTimeout = process.env.NEO4J_CONNECTION_TIMEOUT
    ? Number.parseInt(process.env.NEO4J_CONNECTION_TIMEOUT, 10)
    : defaultConfig.connectionAcquisitionTimeout;

  return {
    uri,
    username,
    password,
    maxConnectionPoolSize,
    connectionTimeout,
  };
}

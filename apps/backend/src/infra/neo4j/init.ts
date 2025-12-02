import { getLogger } from "@/infra/logger";
import { withSession } from "./client";

/**
 * Initialize Neo4j database with required constraints and indexes
 */
export async function initializeNeo4jDatabase(): Promise<void> {
  const logger = getLogger("neo4j");

  logger.info`Initializing Neo4j database constraints and indexes`;

  try {
    await withSession(async (session) => {
      // Create unique constraint on node id property
      // This also creates an index automatically
      logger.debug`Creating unique constraint on node id`;
      await session.run(`
        CREATE CONSTRAINT node_id_unique IF NOT EXISTS
        FOR (n:Node) REQUIRE n.id IS UNIQUE
      `);

      // Additional constraints for specific node types
      await session.run(`
        CREATE CONSTRAINT person_id_unique IF NOT EXISTS
        FOR (n:Person) REQUIRE n.id IS UNIQUE
      `);

      await session.run(`
        CREATE CONSTRAINT document_id_unique IF NOT EXISTS
        FOR (n:Document) REQUIRE n.id IS UNIQUE
      `);

      await session.run(`
        CREATE CONSTRAINT concept_id_unique IF NOT EXISTS
        FOR (n:Concept) REQUIRE n.id IS UNIQUE
      `);

      await session.run(`
        CREATE CONSTRAINT topic_id_unique IF NOT EXISTS
        FOR (n:Topic) REQUIRE n.id IS UNIQUE
      `);

      logger.info`Neo4j database constraints created successfully`;
    }, "WRITE");
  } catch (error) {
    logger.error`Failed to initialize Neo4j database: ${error}`;
    throw error;
  }
}

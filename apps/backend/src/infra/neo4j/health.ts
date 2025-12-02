import { getLogger } from "@/infra/logger";
import { withSession } from "./client";

/**
 * Check Neo4j connectivity and readiness
 */
export async function checkNeo4jHealth(): Promise<boolean> {
	const logger = getLogger("neo4j");

	try {
		await withSession(async (session) => {
			const result = await session.run("RETURN 1 AS health");
			const health = result.records[0]?.get("health");
			if (health !== 1) {
				throw new Error("Health check returned unexpected value");
			}
		});

		logger.debug`Neo4j health check passed`;
		return true;
	} catch (error) {
		logger.error`Neo4j health check failed: ${error}`;
		return false;
	}
}

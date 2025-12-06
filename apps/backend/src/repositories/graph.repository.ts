import type {
  IGraph,
  INode,
  INodeNeighbors,
  INodeWithRelationships,
  IRelationship,
  ISubgraph,
  NodeFilter,
  NodeLabel,
  RelationshipFilter,
  RelationshipType,
} from "@graph-mind/shared/validate/graph";
import { isNil, isNotNil } from "es-toolkit";
import neo4j, { type Driver, Integer, type Session } from "neo4j-driver";
import { getLogger, infra } from "@/infra/logger";
import { getNeo4jDriver, withSession } from "@/infra/neo4j";
import type { IGraphRepository } from "./graph.repository.interface";

export class GraphRepository implements IGraphRepository {
  constructor(private driver: Driver) {}

  // ========================================
  // Node Operations
  // ========================================

  async createNode(
    label: NodeLabel,
    properties: Record<string, unknown>,
  ): Promise<INode> {
    const logger = getLogger(infra.neo4j);
    logger.debug`Creating node with label ${label}`;

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    return await withSession(async (session) => {
      const query = `
        CREATE (n:${label})
        SET n = $props
        RETURN n
      `;

      const result = await session.run(query, {
        props: {
          id,
          createdAt: now,
          updatedAt: now,
          ...properties,
        },
      });

      return this.mapRecordToNode(result.records[0]?.get("n"));
    }, "WRITE");
  }

  async findNodeById(id: string): Promise<INode | null> {
    const logger = getLogger(infra.neo4j);
    logger.debug`Finding node by id ${id}`;

    return await withSession(async (session) => {
      const query = `
        MATCH (n {id: $id})
        RETURN n
      `;

      const result = await session.run(query, { id });

      if (result.records.length === 0) {
        return null;
      }

      return this.mapRecordToNode(result.records[0]?.get("n"));
    }, "READ");
  }

  async findNodes(filter: NodeFilter): Promise<INode[]> {
    const logger = getLogger(infra.neo4j);
    logger.debug`Finding nodes with filter ${JSON.stringify(filter)}`;

    return await withSession(async (session) => {
      const labelFilter = filter.label ? `:${filter.label}` : "";
      const query = `
        MATCH (n${labelFilter})
        RETURN n
        SKIP $offset
        LIMIT $limit
      `;

      try {
        const result = await session.run(query, {
          offset: neo4j.int(filter.offset || 0),
          limit: neo4j.int(filter.limit || 50),
        });

        logger.debug`Found ${result.records.length} records`;

        const nodes = [];
        for (let i = 0; i < result.records.length; i++) {
          try {
            const record = result.records[i];
            const node = record.get("n");
            logger.debug`Processing record ${i}, has properties: ${node && node.properties ? "yes" : "no"}`;
            nodes.push(this.mapRecordToNode(node));
          } catch (err) {
            const errMsg = err instanceof Error ? err.message : String(err);
            logger.error`Error mapping record ${i}: ${errMsg}`;
            throw err;
          }
        }
        return nodes;
      } catch (err) {
        logger.error`Error in findNodes query: ${err}`;
        throw err;
      }
    }, "READ");
  }

  async countNodes(filter: Partial<NodeFilter>): Promise<number> {
    const logger = getLogger(infra.neo4j);
    logger.debug`Counting nodes with filter ${JSON.stringify(filter)}`;

    return await withSession(async (session) => {
      const labelFilter = filter.label ? `:${filter.label}` : "";
      const query = `
        MATCH (n${labelFilter})
        RETURN count(n) as count
      `;

      const result = await session.run(query);
      return result.records[0]?.get("count").toNumber() || 0;
    }, "READ");
  }

  async updateNode(
    id: string,
    properties: Record<string, unknown>,
  ): Promise<INode> {
    const logger = getLogger(infra.neo4j);
    logger.debug`Updating node ${id}`;

    const now = new Date().toISOString();

    return await withSession(async (session) => {
      const query = `
        MATCH (n {id: $id})
        SET n += $properties, n.updatedAt = $updatedAt
        RETURN n
      `;

      const result = await session.run(query, {
        id,
        properties,
        updatedAt: now,
      });

      if (result.records.length === 0) {
        throw new Error(`Node with id ${id} not found`);
      }

      return this.mapRecordToNode(result.records[0]?.get("n"));
    }, "WRITE");
  }

  async deleteNode(id: string): Promise<void> {
    const logger = getLogger(infra.neo4j);
    logger.info`Deleting node ${id}`;

    await withSession(async (session) => {
      const query = `
        MATCH (n {id: $id})
        DETACH DELETE n
      `;

      await session.run(query, { id });
    }, "WRITE");
  }

  // ========================================
  // Relationship Operations
  // ========================================

  async createRelationship(
    type: RelationshipType,
    sourceId: string,
    targetId: string,
    properties: Record<string, unknown>,
  ): Promise<IRelationship> {
    const logger = getLogger(infra.neo4j);
    logger.debug`Creating relationship ${type} from ${sourceId} to ${targetId}`;

    const id = crypto.randomUUID();
    const now = new Date().toISOString();

    return await withSession(async (session) => {
      const query = `
        MATCH (source {id: $sourceId}), (target {id: $targetId})
        CREATE (source)-[r:${type}]->(target)
        SET r = $props
        RETURN r, source.id as sourceId, target.id as targetId
      `;

      const result = await session.run(query, {
        sourceId,
        targetId,
        props: {
          id,
          createdAt: now,
          ...properties,
        },
      });

      if (result.records.length === 0) {
        throw new Error(
          `Source node ${sourceId} or target node ${targetId} not found`,
        );
      }

      return this.mapRecordToRelationship(
        result.records[0]?.get("r"),
        result.records[0]?.get("sourceId"),
        result.records[0]?.get("targetId"),
      );
    }, "WRITE");
  }

  async findRelationshipById(id: string): Promise<IRelationship | null> {
    const logger = getLogger(infra.neo4j);
    logger.debug`Finding relationship by id ${id}`;

    return await withSession(async (session) => {
      const query = `
        MATCH (source)-[r {id: $id}]->(target)
        RETURN r, source.id as sourceId, target.id as targetId
      `;

      const result = await session.run(query, { id });

      if (result.records.length === 0) {
        return null;
      }

      return this.mapRecordToRelationship(
        result.records[0]?.get("r"),
        result.records[0]?.get("sourceId"),
        result.records[0]?.get("targetId"),
      );
    }, "READ");
  }

  async findRelationships(
    nodeId: string,
    filter: RelationshipFilter,
  ): Promise<IRelationship[]> {
    const logger = getLogger(infra.neo4j);
    logger.debug`Finding relationships for node ${nodeId}`;

    return await withSession(async (session) => {
      const typeFilter = filter.type ? `:${filter.type}` : "";
      const directionPattern =
        filter.direction === "incoming"
          ? `(source)-[r${typeFilter}]->(n)`
          : filter.direction === "outgoing"
            ? `(n)-[r${typeFilter}]->(target)`
            : `(source)-[r${typeFilter}]-(target)`;

      const query = `
        MATCH ${directionPattern}
        WHERE ${filter.direction === "incoming" ? "n.id" : filter.direction === "outgoing" ? "n.id" : "source.id"} = $nodeId
        RETURN r, source.id as sourceId, target.id as targetId
      `;

      const result = await session.run(query, { nodeId });

      return result.records.map((record) =>
        this.mapRecordToRelationship(
          record.get("r"),
          record.get("sourceId"),
          record.get("targetId"),
        ),
      );
    }, "READ");
  }

  async deleteRelationship(id: string): Promise<void> {
    const logger = getLogger(infra.neo4j);
    logger.info`Deleting relationship ${id}`;

    await withSession(async (session) => {
      const query = `
        MATCH ()-[r {id: $id}]-()
        DELETE r
      `;

      await session.run(query, { id });
    }, "WRITE");
  }

  // ========================================
  // Graph Query Operations
  // ========================================

  async findGraph(limit: Integer): Promise<IGraph> {
    return await withSession(async (session) => {
      const query = `
        MATCH (n)
        OPTIONAL MATCH (n)-[r]->(m)
        RETURN n, collect({r: r, m: m}) as relationships
        LIMIT $limit
      `;

      const result = await session.run(query, { limit: neo4j.int(limit) });

      const nodes: INode[] = [];
      const relationships: IRelationship[] = [];
      const seenNodeIds = new Set<string>();
      const seenRelIds = new Set<string>();

      for (const record of result.records) {
        const node = this.mapRecordToNode(record.get("n"));
        if (!seenNodeIds.has(node.id)) {
          nodes.push(node);
          seenNodeIds.add(node.id);
        }

        const rels = record.get("relationships") as Array<{ r: any; m: any }>;
        for (const { r, m } of rels) {
          if (r && !seenRelIds.has(r.properties.id)) {
            const relNode = m ? this.mapRecordToNode(m) : null;
            if (relNode && !seenNodeIds.has(relNode.id)) {
              nodes.push(relNode);
              seenNodeIds.add(relNode.id);
            }
            const rel = this.mapRecordToRelationship(
              r,
              node.id,
              relNode?.id || "",
            );
            relationships.push(rel);
            seenRelIds.add(rel.id);
          }
        }
      }

      return { nodes, relationships };
    }, "READ");
  }

  async findSubgraph(nodeId: string, depth: number): Promise<ISubgraph> {
    const logger = getLogger(infra.neo4j);
    logger.debug`Finding subgraph for node ${nodeId} with depth ${depth}`;

    return await withSession(async (session) => {
      const query = `
        MATCH path = (start {id: $nodeId})-[*0..${depth}]-(connected)
        WITH nodes(path) as pathNodes, relationships(path) as pathRels
        UNWIND pathNodes as n
        WITH collect(DISTINCT n) as allNodes, pathRels
        UNWIND pathRels as r
        WITH allNodes, collect(DISTINCT r) as allRels
        RETURN allNodes, allRels
      `;

      const result = await session.run(query, { nodeId });

      if (result.records.length === 0) {
        return {
          nodes: [],
          relationships: [],
          depth,
          centerNodeId: nodeId,
        };
      }

      const allNodes = result.records[0]?.get("allNodes") || [];
      const allRels = result.records[0]?.get("allRels") || [];

      const nodes = allNodes.map((n: any) => this.mapRecordToNode(n));
      const relationships = allRels.map((r: any) => {
        const sourceId = r.start.properties?.id || r.startNodeElementId;
        const targetId = r.end.properties?.id || r.endNodeElementId;
        return this.mapRecordToRelationship(r, sourceId, targetId);
      });

      return {
        nodes,
        relationships,
        depth,
        centerNodeId: nodeId,
      };
    }, "READ");
  }

  async findNeighbors(nodeId: string): Promise<INodeNeighbors> {
    const logger = getLogger(infra.neo4j);
    logger.debug`Finding neighbors for node ${nodeId}`;

    return await withSession(async (session) => {
      const query = `
        MATCH (center {id: $nodeId})
        OPTIONAL MATCH (center)-[r]-(neighbor)
        RETURN center, collect(DISTINCT neighbor) as neighbors, collect(DISTINCT r) as relationships
      `;

      const result = await session.run(query, { nodeId });

      if (result.records.length === 0) {
        throw new Error(`Node with id ${nodeId} not found`);
      }

      const center = this.mapRecordToNode(result.records[0]?.get("center"));
      const neighbors = (result.records[0]?.get("neighbors") || [])
        .filter((n: any) => n !== null)
        .map((n: any) => this.mapRecordToNode(n));
      const rels = (result.records[0]?.get("relationships") || [])
        .filter((r: any) => r !== null)
        .map((r: any) => {
          const sourceId = r.start.properties?.id || r.startNodeElementId;
          const targetId = r.end.properties?.id || r.endNodeElementId;
          return this.mapRecordToRelationship(r, sourceId, targetId);
        });

      return {
        center,
        neighbors,
        relationships: rels,
      };
    }, "READ");
  }

  async findNodeWithRelationships(
    nodeId: string,
  ): Promise<INodeWithRelationships> {
    const logger = getLogger(infra.neo4j);
    logger.debug`Finding node with relationships ${nodeId}`;

    return await withSession(async (session) => {
      const query = `
        MATCH (n {id: $nodeId})
        OPTIONAL MATCH (n)-[outgoing]->(target)
        OPTIONAL MATCH (source)-[incoming]->(n)
        RETURN n,
               collect(DISTINCT {r: outgoing, target: target}) as outgoingRels,
               collect(DISTINCT {r: incoming, source: source}) as incomingRels
      `;

      const result = await session.run(query, { nodeId });

      if (result.records.length === 0) {
        throw new Error(`Node with id ${nodeId} not found`);
      }

      const node = this.mapRecordToNode(result.records[0]?.get("n"));
      const outgoingRels = (result.records[0]?.get("outgoingRels") || [])
        .filter((item: any) => item.r !== null)
        .map((item: any) => {
          return {
            relationship: this.mapRecordToRelationship(
              item.r,
              nodeId,
              item.target.properties.id,
            ),
            target: {
              id: item.target.properties.id,
              label: item.target.labels[0],
              name: item.target.properties.name,
            },
          };
        });

      const incomingRels = (result.records[0]?.get("incomingRels") || [])
        .filter((item: any) => item.r !== null)
        .map((item: any) => {
          return {
            relationship: this.mapRecordToRelationship(
              item.r,
              item.source.properties.id,
              nodeId,
            ),
            source: {
              id: item.source.properties.id,
              label: item.source.labels[0],
              name: item.source.properties.name,
            },
          };
        });

      return {
        node,
        relationships: {
          outgoing: outgoingRels,
          incoming: incomingRels,
        },
      };
    }, "READ");
  }

  async searchNodes(
    query: string,
    label?: NodeLabel,
    limit = 50,
  ): Promise<INode[]> {
    const logger = getLogger(infra.neo4j);
    logger.debug`Searching nodes with query "${query}"`;

    return await withSession(async (session) => {
      const labelFilter = label ? `:${label}` : "";
      const cypherQuery = `
        MATCH (n${labelFilter})
        WHERE n.name CONTAINS $query
           OR n.title CONTAINS $query
           OR n.description CONTAINS $query
        RETURN n
        LIMIT $limit
      `;

      const result = await session.run(cypherQuery, {
        query,
        limit: neo4j.int(limit),
      });

      return result.records.map((record) =>
        this.mapRecordToNode(record.get("n")),
      );
    }, "READ");
  }

  // ========================================
  // Helper Methods
  // ========================================

  private mapRecordToNode(record: any): INode {
    if (!record) {
      throw new Error("Invalid node record");
    }

    const logger = getLogger(infra.neo4j);

    // Extract properties from Neo4j node
    const props = record.properties || {};
    const { id, createdAt, updatedAt, ...userProperties } = props;

    logger.debug`Mapping node: id=${id}, label=${record.labels?.[0]}, props=${JSON.stringify(userProperties)}`;

    return {
      id,
      label: record.labels[0] as NodeLabel,
      properties: userProperties,
      createdAt,
      updatedAt,
    };
  }

  private mapRecordToRelationship(
    record: any,
    sourceId: string,
    targetId: string,
  ): IRelationship {
    if (!record) {
      throw new Error("Invalid relationship record");
    }

    // Extract system properties and separate user properties
    const { id, createdAt, ...userProperties } = record.properties;

    return {
      id,
      type: record.type as RelationshipType,
      sourceId,
      targetId,
      properties: userProperties,
      createdAt,
    };
  }
}

// ========================================
// Singleton Export
// ========================================

let graphRepository: IGraphRepository | null = null;

export function getGraphRepository(): IGraphRepository {
  if (isNil(graphRepository)) {
    graphRepository = new GraphRepository(getNeo4jDriver());
  }
  return graphRepository;
}

export function destroyGraphRepository(): void {
  if (isNotNil(graphRepository)) {
    graphRepository = null;
  }
}

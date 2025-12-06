import { ErrorCode } from "@graph-mind/shared/lib/error-codes";
import type {
  CreateNodeInput,
  CreateRelationshipInput,
  GraphFilter,
  IGraph,
  INode,
  INodeNeighbors,
  INodeWithRelationships,
  IPaginatedNodes,
  IRelationship,
  ISubgraph,
  NeighborQuery,
  NodeFilter,
  NodeSearch,
  SubgraphQuery,
  UpdateNodeInput,
} from "@graph-mind/shared/validate/graph";
import {
  CreateNodeSchema,
  CreateRelationshipSchema,
  NeighborQuerySchema,
  NodeFilterSchema,
  NodeSearchSchema,
  SubgraphQuerySchema,
  UpdateNodeSchema,
} from "@graph-mind/shared/validate/graph";
import { isNil, isNotNil } from "es-toolkit";
import { BusinessException } from "@/exceptions/business-exception";
import { getLogger, infra } from "@/infra/logger";
import type { RDB } from "@/infra/redis";
import { getRdb } from "@/infra/redis";
import { RedisKeyFactory } from "@/infra/redis/keys";
import { RedisTTLCalculator } from "@/infra/redis/ttl";
import { getGraphRepository } from "@/repositories/graph.repository";
import type { IGraphRepository } from "@/repositories/graph.repository.interface";

export class GraphService {
  constructor(
    private graphRepo: IGraphRepository,
    private rdb: RDB,
  ) {}

  // ========================================
  // Node Operations
  // ========================================

  async createNode(input: CreateNodeInput): Promise<INode> {
    const logger = getLogger(infra.neo4j);
    logger.info`Creating node with label ${input.label}`;

    // Validate input
    const validated = CreateNodeSchema.parse(input);

    try {
      const node = await this.graphRepo.createNode(
        validated.label,
        validated.properties,
      );
      logger.info`Node created successfully: ${node.id}`;
      return node;
    } catch (error) {
      logger.error`Failed to create node: ${error}`;
      throw new BusinessException(500, {
        errcode: ErrorCode.GRAPH.GRAPH_QUERY_ERROR,
        message: "Failed to create node",
      });
    }
  }

  async getNodeById(id: string): Promise<INode> {
    const logger = getLogger(infra.neo4j);
    const rdbLogger = getLogger(infra.redis);
    logger.debug`Getting node by id ${id}`;

    // Try cache first
    const factory = new RedisKeyFactory();
    const cacheKey = factory.graph.node(id);
    const cached = await this.rdb.json.get(cacheKey);

    if (isNotNil(cached)) {
      rdbLogger.debug`Cache hit for node ${id}`;
      return cached as INode;
    }

    rdbLogger.debug`Cache miss for node ${id}`;

    // Query database
    const node = await this.graphRepo.findNodeById(id);

    if (isNil(node)) {
      throw new BusinessException(404, {
        errcode: ErrorCode.GRAPH.NODE_NOT_FOUND,
        message: `Node with id ${id} not found`,
      });
    }

    // Cache the result
    const ttl = new RedisTTLCalculator();
    this.rdb
      .multi()
      .json.set(cacheKey, "$", node)
      .expire(cacheKey, ttl.$5_minutes)
      .exec()
      .catch((err: unknown) => {
        const message = err instanceof Error ? err.message : "unknown error";
        rdbLogger.warn`Cache write failed for node ${id}: ${message}`;
      });

    return node;
  }

  async listNodes(filter: NodeFilter): Promise<IPaginatedNodes> {
    const logger = getLogger(infra.neo4j);
    logger.debug`Listing nodes with filter ${JSON.stringify(filter)}`;

    // Validate input
    const validated = NodeFilterSchema.parse(filter);

    try {
      const nodes = await this.graphRepo.findNodes(validated);
      const total = await this.graphRepo.countNodes(validated);

      return {
        nodes,
        pagination: {
          total,
          limit: validated.limit,
          offset: validated.offset,
        },
      };
    } catch (error) {
      logger.error`Failed to list nodes: ${error}`;
      throw new BusinessException(500, {
        errcode: ErrorCode.GRAPH.GRAPH_QUERY_ERROR,
        message: "Failed to list nodes",
      });
    }
  }

  async updateNode(id: string, input: UpdateNodeInput): Promise<INode> {
    const logger = getLogger(infra.neo4j);
    logger.info`Updating node ${id}`;

    // Validate input
    const validated = UpdateNodeSchema.parse(input);

    try {
      const node = await this.graphRepo.updateNode(id, validated.properties);

      // Invalidate cache
      await this.invalidateNodeCache(id);

      logger.info`Node updated successfully: ${id}`;
      return node;
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      if (message.includes("not found")) {
        throw new BusinessException(404, {
          errcode: ErrorCode.GRAPH.NODE_NOT_FOUND,
          message: `Node with id ${id} not found`,
        });
      }
      logger.error`Failed to update node: ${error}`;
      throw new BusinessException(500, {
        errcode: ErrorCode.GRAPH.GRAPH_QUERY_ERROR,
        message: "Failed to update node",
      });
    }
  }

  async deleteNode(id: string): Promise<void> {
    const logger = getLogger(infra.neo4j);
    logger.info`Deleting node ${id}`;

    try {
      await this.graphRepo.deleteNode(id);

      // Invalidate cache
      await this.invalidateNodeCache(id);

      logger.info`Node deleted successfully: ${id}`;
    } catch (error) {
      logger.error`Failed to delete node: ${error}`;
      throw new BusinessException(500, {
        errcode: ErrorCode.GRAPH.GRAPH_QUERY_ERROR,
        message: "Failed to delete node",
      });
    }
  }

  // ========================================
  // Relationship Operations
  // ========================================

  async createRelationship(
    input: CreateRelationshipInput,
  ): Promise<IRelationship> {
    const logger = getLogger(infra.neo4j);
    logger.info`Creating relationship ${input.type} from ${input.sourceId} to ${input.targetId}`;

    // Validate input
    const validated = CreateRelationshipSchema.parse(input);

    try {
      const relationship = await this.graphRepo.createRelationship(
        validated.type,
        validated.sourceId,
        validated.targetId,
        validated.properties,
      );

      // Invalidate related caches
      await this.invalidateNodeCache(validated.sourceId);
      await this.invalidateNodeCache(validated.targetId);
      await this.invalidateNeighborsCache(validated.sourceId);
      await this.invalidateNeighborsCache(validated.targetId);

      logger.info`Relationship created successfully: ${relationship.id}`;
      return relationship;
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      if (message.includes("not found")) {
        throw new BusinessException(400, {
          errcode: ErrorCode.GRAPH.INVALID_RELATIONSHIP,
          message: "Source or target node not found",
        });
      }
      logger.error`Failed to create relationship: ${error}`;
      throw new BusinessException(500, {
        errcode: ErrorCode.GRAPH.GRAPH_QUERY_ERROR,
        message: "Failed to create relationship",
      });
    }
  }

  async getRelationshipById(id: string): Promise<IRelationship> {
    const logger = getLogger(infra.neo4j);
    logger.debug`Getting relationship by id ${id}`;

    const relationship = await this.graphRepo.findRelationshipById(id);

    if (isNil(relationship)) {
      throw new BusinessException(404, {
        errcode: ErrorCode.GRAPH.RELATIONSHIP_NOT_FOUND,
        message: `Relationship with id ${id} not found`,
      });
    }

    return relationship;
  }

  async deleteRelationship(id: string): Promise<void> {
    const logger = getLogger(infra.neo4j);
    logger.info`Deleting relationship ${id}`;

    try {
      // Get relationship first to invalidate caches
      const relationship = await this.graphRepo.findRelationshipById(id);

      if (isNil(relationship)) {
        throw new BusinessException(404, {
          errcode: ErrorCode.GRAPH.RELATIONSHIP_NOT_FOUND,
          message: `Relationship with id ${id} not found`,
        });
      }

      await this.graphRepo.deleteRelationship(id);

      // Invalidate caches
      await this.invalidateNeighborsCache(relationship.sourceId);
      await this.invalidateNeighborsCache(relationship.targetId);

      logger.info`Relationship deleted successfully: ${id}`;
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      logger.error`Failed to delete relationship: ${error}`;
      throw new BusinessException(500, {
        errcode: ErrorCode.GRAPH.GRAPH_QUERY_ERROR,
        message: "Failed to delete relationship",
      });
    }
  }

  // ========================================
  // Graph Query Operations
  // ========================================

  async getGraph(filter: GraphFilter): Promise<IGraph> {
    const logger = getLogger(infra.neo4j);

    try {
      return await this.graphRepo.findGraph(filter.limit);
    } catch (error) {
      logger.error`Failed to get graph: ${error}`;
      throw new BusinessException(500, {
        errcode: ErrorCode.GRAPH.GRAPH_QUERY_ERROR,
        message: "Failed to retrieve graph",
      });
    }
  }

  async getSubgraph(nodeId: string, query?: SubgraphQuery): Promise<ISubgraph> {
    const logger = getLogger(infra.neo4j);
    const rdbLogger = getLogger(infra.redis);
    const validated = query ? SubgraphQuerySchema.parse(query) : { depth: 1 };

    logger.debug`Getting subgraph for node ${nodeId} with depth ${validated.depth}`;

    // Try cache first
    const factory = new RedisKeyFactory();
    const cacheKey = factory.graph.subgraph(nodeId, validated.depth);
    const cached = await this.rdb.json.get(cacheKey);

    if (isNotNil(cached)) {
      rdbLogger.debug`Cache hit for subgraph ${nodeId}:${validated.depth}`;
      return cached as ISubgraph;
    }

    rdbLogger.debug`Cache miss for subgraph ${nodeId}:${validated.depth}`;

    try {
      const subgraph = await this.graphRepo.findSubgraph(
        nodeId,
        validated.depth,
      );

      // Cache the result
      const ttl = new RedisTTLCalculator();
      this.rdb
        .multi()
        .json.set(cacheKey, "$", subgraph)
        .expire(cacheKey, ttl.$2_minutes)
        .exec()
        .catch((err: unknown) => {
          const message = err instanceof Error ? err.message : "unknown error";
          rdbLogger.warn`Cache write failed for subgraph ${nodeId}: ${message}`;
        });

      return subgraph;
    } catch (error) {
      logger.error`Failed to get subgraph: ${error}`;
      throw new BusinessException(500, {
        errcode: ErrorCode.GRAPH.GRAPH_QUERY_ERROR,
        message: "Failed to retrieve subgraph",
      });
    }
  }

  async getNeighbors(
    nodeId: string,
    query?: NeighborQuery,
  ): Promise<INodeNeighbors> {
    const logger = getLogger(infra.neo4j);
    const rdbLogger = getLogger(infra.redis);
    const validated = query
      ? NeighborQuerySchema.parse(query)
      : { direction: "both" as const };

    logger.debug`Getting neighbors for node ${nodeId}`;

    // Try cache first (only for simple queries)
    if (!validated.relationshipType) {
      const factory = new RedisKeyFactory();
      const cacheKey = factory.graph.neighbors(nodeId);
      const cached = await this.rdb.json.get(cacheKey);

      if (isNotNil(cached)) {
        rdbLogger.debug`Cache hit for neighbors ${nodeId}`;
        return cached as INodeNeighbors;
      }

      rdbLogger.debug`Cache miss for neighbors ${nodeId}`;
    }

    try {
      const neighbors = await this.graphRepo.findNeighbors(nodeId);

      // Cache the result (only for simple queries)
      if (!validated.relationshipType) {
        const factory = new RedisKeyFactory();
        const cacheKey = factory.graph.neighbors(nodeId);
        const ttl = new RedisTTLCalculator();
        this.rdb
          .multi()
          .json.set(cacheKey, "$", neighbors)
          .expire(cacheKey, ttl.$3_minutes)
          .exec()
          .catch((err: unknown) => {
            const message =
              err instanceof Error ? err.message : "unknown error";
            rdbLogger.warn`Cache write failed for neighbors ${nodeId}: ${message}`;
          });
      }

      return neighbors;
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      if (message.includes("not found")) {
        throw new BusinessException(404, {
          errcode: ErrorCode.GRAPH.NODE_NOT_FOUND,
          message: `Node with id ${nodeId} not found`,
        });
      }
      logger.error`Failed to get neighbors: ${error}`;
      throw new BusinessException(500, {
        errcode: ErrorCode.GRAPH.GRAPH_QUERY_ERROR,
        message: "Failed to retrieve neighbors",
      });
    }
  }

  async getNodeWithRelationships(
    nodeId: string,
  ): Promise<INodeWithRelationships> {
    const logger = getLogger(infra.neo4j);
    logger.debug`Getting node with relationships ${nodeId}`;

    try {
      return await this.graphRepo.findNodeWithRelationships(nodeId);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown error";
      if (message.includes("not found")) {
        throw new BusinessException(404, {
          errcode: ErrorCode.GRAPH.NODE_NOT_FOUND,
          message: `Node with id ${nodeId} not found`,
        });
      }
      logger.error`Failed to get node with relationships: ${error}`;
      throw new BusinessException(500, {
        errcode: ErrorCode.GRAPH.GRAPH_QUERY_ERROR,
        message: "Failed to retrieve node with relationships",
      });
    }
  }

  async searchNodes(search: NodeSearch): Promise<INode[]> {
    const logger = getLogger(infra.neo4j);
    logger.debug`Searching nodes with query "${search.q}"`;

    // Validate input
    const validated = NodeSearchSchema.parse(search);

    try {
      return await this.graphRepo.searchNodes(
        validated.q,
        validated.label,
        validated.limit,
      );
    } catch (error) {
      logger.error`Failed to search nodes: ${error}`;
      throw new BusinessException(500, {
        errcode: ErrorCode.GRAPH.GRAPH_QUERY_ERROR,
        message: "Failed to search nodes",
      });
    }
  }

  // ========================================
  // Cache Invalidation Helpers
  // ========================================

  private async invalidateNodeCache(nodeId: string): Promise<void> {
    const rdbLogger = getLogger(infra.redis);
    const factory = new RedisKeyFactory();

    try {
      await this.rdb.del(factory.graph.node(nodeId));
      rdbLogger.debug`Invalidated cache for node ${nodeId}`;
    } catch (error) {
      rdbLogger.warn`Failed to invalidate cache for node ${nodeId}: ${error}`;
    }
  }

  private async invalidateNeighborsCache(nodeId: string): Promise<void> {
    const rdbLogger = getLogger(infra.redis);
    const factory = new RedisKeyFactory();

    try {
      await this.rdb.del(factory.graph.neighbors(nodeId));
      rdbLogger.debug`Invalidated neighbors cache for node ${nodeId}`;
    } catch (error) {
      rdbLogger.warn`Failed to invalidate neighbors cache for node ${nodeId}: ${error}`;
    }
  }
}

// ========================================
// Singleton Export
// ========================================

let graphService: GraphService | null = null;

export function getGraphService(): GraphService {
  if (isNil(graphService)) {
    graphService = new GraphService(getGraphRepository(), getRdb());
  }
  return graphService;
}

export function destroyGraphService(): void {
  if (isNotNil(graphService)) {
    graphService = null;
  }
}

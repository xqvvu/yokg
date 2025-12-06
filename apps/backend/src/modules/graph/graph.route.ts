import {
  CreateNodeSchema,
  CreateRelationshipSchema,
  GraphFilterSchema,
  NeighborQuerySchema,
  NodeFilterSchema,
  NodeSearchSchema,
  SubgraphQuerySchema,
  UpdateNodeSchema,
} from "@graph-mind/shared/validate/graph";
import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";
import { R } from "@/lib/http";
import { getGraphService } from "./graph.service";

export const graph = new Hono<Env>().basePath("graph");

// ========================================
// Node Endpoints
// ========================================

/**
 * POST /api/graph/nodes
 * Create a new node
 */
graph.post(
  "/nodes",
  zValidator("json", CreateNodeSchema),
  async function createNodeHandler(c) {
    const input = c.req.valid("json");
    const service = getGraphService();
    const node = await service.createNode(input);
    return R.ok(c, node);
  },
);

/**
 * GET /api/graph/nodes/:id
 * Get a node by ID
 */
graph.get("/nodes/:id", async function getNodeByIdHandler(c) {
  const id = c.req.param("id");
  const service = getGraphService();
  const node = await service.getNodeById(id);
  return R.ok(c, node);
});

/**
 * GET /api/graph/nodes
 * List nodes with pagination and filtering
 */
graph.get(
  "/nodes",
  zValidator("query", NodeFilterSchema),
  async function listNodesHandler(c) {
    const filter = c.req.valid("query");
    const service = getGraphService();
    const result = await service.listNodes(filter);
    return R.ok(c, result);
  },
);

/**
 * PATCH /api/graph/nodes/:id
 * Update a node's properties
 */
graph.patch(
  "/nodes/:id",
  zValidator("json", UpdateNodeSchema),
  async function updateNodeHandler(c) {
    const id = c.req.param("id");
    const input = c.req.valid("json");
    const service = getGraphService();
    const node = await service.updateNode(id, input);
    return R.ok(c, node);
  },
);

/**
 * DELETE /api/graph/nodes/:id
 * Delete a node
 */
graph.delete("/nodes/:id", async function deleteNodeHandler(c) {
  const id = c.req.param("id");
  const service = getGraphService();
  await service.deleteNode(id);
  return R.ok(c, { deleted: true });
});

/**
 * GET /api/graph/nodes/:id/full
 * Get a node with all its relationships
 */
graph.get("/nodes/:id/full", async function getNodeFullHandler(c) {
  const id = c.req.param("id");
  const service = getGraphService();
  const result = await service.getNodeWithRelationships(id);
  return R.ok(c, result);
});

/**
 * GET /api/graph/nodes/:id/neighbors
 * Get neighbors of a node
 */
graph.get(
  "/nodes/:id/neighbors",
  zValidator("query", NeighborQuerySchema),
  async function getNeighborsHandler(c) {
    const id = c.req.param("id");
    const query = c.req.valid("query");
    const service = getGraphService();
    const result = await service.getNeighbors(id, query);
    return R.ok(c, result);
  },
);

/**
 * GET /api/graph/nodes/:id/subgraph
 * Get subgraph starting from a node
 */
graph.get(
  "/nodes/:id/subgraph",
  zValidator("query", SubgraphQuerySchema),
  async function getSubgraphHandler(c) {
    const id = c.req.param("id");
    const query = c.req.valid("query");
    const service = getGraphService();
    const result = await service.getSubgraph(id, query);
    return R.ok(c, result);
  },
);

// ========================================
// Relationship Endpoints
// ========================================

/**
 * POST /api/graph/relationships
 * Create a new relationship between two nodes
 */
graph.post(
  "/relationships",
  zValidator("json", CreateRelationshipSchema),
  async function createRelationshipHandler(c) {
    const input = c.req.valid("json");
    const service = getGraphService();
    const relationship = await service.createRelationship(input);
    return R.ok(c, relationship);
  },
);

/**
 * GET /api/graph/relationships/:id
 * Get a relationship by ID
 */
graph.get("/relationships/:id", async function getRelationshipByIdHandler(c) {
  const id = c.req.param("id");
  const service = getGraphService();
  const relationship = await service.getRelationshipById(id);
  return R.ok(c, relationship);
});

/**
 * DELETE /api/graph/relationships/:id
 * Delete a relationship
 */
graph.delete("/relationships/:id", async function deleteRelationshipHandler(c) {
  const id = c.req.param("id");
  const service = getGraphService();
  await service.deleteRelationship(id);
  return R.ok(c, { deleted: true });
});

// ========================================
// Graph Query Endpoints
// ========================================

/**
 * GET /api/graph
 * Get the entire graph or filtered subgraph
 */
graph.get(
  "/",
  zValidator("query", GraphFilterSchema),
  async function getGraphHandler(c) {
    const filter = c.req.valid("query");
    const service = getGraphService();
    const result = await service.getGraph(filter);
    return R.ok(c, result);
  },
);

/**
 * GET /api/graph/search
 * Search nodes by text query
 */
graph.get(
  "/search",
  zValidator("query", NodeSearchSchema),
  async function searchNodesHandler(c) {
    const query = c.req.valid("query");
    const service = getGraphService();
    const nodes = await service.searchNodes(query);
    return R.ok(c, { nodes });
  },
);

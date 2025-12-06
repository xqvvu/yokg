import { createWebKy } from "@graph-mind/ky/web";
import type {
  CreateNodeInput,
  CreateRelationshipInput,
  IGraph,
  INode,
  INodeNeighbors,
  INodeWithRelationships,
  IPaginatedNodes,
  IRelationship,
  ISubgraph,
  NodeFilter,
  NodeSearch,
} from "@graph-mind/shared/validate/graph";

const ky = createWebKy();

// ========================================
// Node Operations
// ========================================

/**
 * Create a new node
 */
export async function createNode(input: CreateNodeInput): Promise<INode> {
  return await ky.post("graph/nodes", { json: input }).json();
}

/**
 * Get a node by ID
 */
export async function getNodeById(id: string): Promise<INode> {
  return await ky.get(`graph/nodes/${id}`).json();
}

/**
 * List nodes with pagination and filtering
 */
export async function listNodes(filter?: NodeFilter): Promise<IPaginatedNodes> {
  const searchParams = filter
    ? new URLSearchParams(
        Object.entries(filter)
          .filter(([_, v]) => v !== undefined)
          .map(([k, v]) => [k, String(v)]),
      )
    : undefined;

  return await ky.get("graph/nodes", { searchParams }).json();
}

/**
 * Update a node's properties
 */
export async function updateNode(
  id: string,
  properties: Record<string, unknown>,
): Promise<INode> {
  return await ky.patch(`graph/nodes/${id}`, { json: { properties } }).json();
}

/**
 * Delete a node
 */
export async function deleteNode(id: string): Promise<{ deleted: boolean }> {
  return await ky.delete(`graph/nodes/${id}`).json();
}

/**
 * Get a node with all its relationships
 */
export async function getNodeWithRelationships(
  id: string,
): Promise<INodeWithRelationships> {
  return await ky.get(`graph/nodes/${id}/full`).json();
}

/**
 * Get neighbors of a node
 */
export async function getNodeNeighbors(id: string): Promise<INodeNeighbors> {
  return await ky.get(`graph/nodes/${id}/neighbors`).json();
}

/**
 * Get subgraph starting from a node
 */
export async function getSubgraph(
  id: string,
  depth?: number,
): Promise<ISubgraph> {
  const searchParams = depth
    ? new URLSearchParams({ depth: String(depth) })
    : undefined;
  return await ky.get(`graph/nodes/${id}/subgraph`, { searchParams }).json();
}

// ========================================
// Relationship Operations
// ========================================

/**
 * Create a new relationship between two nodes
 */
export async function createRelationship(
  input: CreateRelationshipInput,
): Promise<IRelationship> {
  return await ky.post("graph/relationships", { json: input }).json();
}

/**
 * Get a relationship by ID
 */
export async function getRelationshipById(id: string): Promise<IRelationship> {
  return await ky.get(`graph/relationships/${id}`).json();
}

/**
 * Delete a relationship
 */
export async function deleteRelationship(
  id: string,
): Promise<{ deleted: boolean }> {
  return await ky.delete(`graph/relationships/${id}`).json();
}

// ========================================
// Graph Query Operations
// ========================================

/**
 * Get the entire graph or filtered graph
 */
export async function getGraph(limit?: number): Promise<IGraph> {
  const searchParams = limit
    ? new URLSearchParams({ limit: String(limit) })
    : undefined;
  return await ky.get("graph", { searchParams }).json();
}

/**
 * Search nodes by text query
 */
export async function searchNodes(
  search: NodeSearch,
): Promise<{ nodes: INode[] }> {
  const searchParams = new URLSearchParams(
    Object.entries(search)
      .filter(([_, v]) => v !== undefined)
      .map(([k, v]) => [k, String(v)]),
  );
  return await ky.get("graph/search", { searchParams }).json();
}

// ========================================
// Helper function to convert new API format to legacy format
// ========================================

/**
 * Convert IGraph (new format) to IGraphData (legacy format for visualization)
 * This helps maintain compatibility with existing visualization components
 */
export function convertGraphToLegacyFormat(graph: IGraph): {
  nodes: Array<{
    id: string;
    type: string;
    label: string;
    properties: Record<string, unknown>;
  }>;
  edges: Array<{
    id: string;
    source: string;
    target: string;
    type: string;
    properties: Record<string, unknown>;
  }>;
} {
  return {
    nodes: graph.nodes.map((node) => ({
      id: node.id,
      type: node.label.toLowerCase(), // Convert "Person" to "person"
      label: (node.properties.name ||
        node.properties.title ||
        node.id) as string,
      properties: node.properties,
    })),
    edges: graph.relationships.map((rel) => ({
      id: rel.id,
      source: rel.sourceId,
      target: rel.targetId,
      type: rel.type.toLowerCase().replace(/_/g, "_"), // Keep underscore format
      properties: rel.properties,
    })),
  };
}

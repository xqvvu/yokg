import * as neo4j from "neo4j-driver";
import { z } from "zod";

// ========================================
// Node Schemas
// ========================================

/**
 * Node label schema - accepts any non-empty string
 * Allows dynamic node types for flexible knowledge graphs
 */
export const NodeLabelSchema = z.string().min(1).max(100);
export type NodeLabel = z.infer<typeof NodeLabelSchema>;

/**
 * Base node schema
 */
export const NodeSchema = z.object({
  id: z.string().uuid(),
  label: NodeLabelSchema,
  properties: z.record(z.string(), z.unknown()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
export type INode = z.infer<typeof NodeSchema>;

/**
 * Create node input schema
 */
export const CreateNodeSchema = z.object({
  label: NodeLabelSchema,
  properties: z.record(z.string(), z.unknown()).default({}),
});
export type CreateNodeInput = z.infer<typeof CreateNodeSchema>;

/**
 * Update node input schema
 */
export const UpdateNodeSchema = z.object({
  properties: z.record(z.string(), z.unknown()),
});
export type UpdateNodeInput = z.infer<typeof UpdateNodeSchema>;

/**
 * Node filter schema for queries
 */
export const NodeFilterSchema = z.object({
  label: NodeLabelSchema.optional(),
  limit: z.coerce.number<number>().int().min(1).max(1000).default(50),
  offset: z.coerce.number<number>().int().min(0).default(0),
});
export type NodeFilter = z.infer<typeof NodeFilterSchema>;

// ========================================
// Relationship Schemas
// ========================================

/**
 * Relationship type schema - accepts any non-empty string
 * Allows dynamic relationship types for flexible knowledge graphs
 */
export const RelationshipTypeSchema = z.string().min(1).max(100);
export type RelationshipType = z.infer<typeof RelationshipTypeSchema>;

/**
 * Base relationship schema
 */
export const RelationshipSchema = z.object({
  id: z.string().uuid(),
  type: RelationshipTypeSchema,
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
  properties: z.record(z.string(), z.unknown()),
  createdAt: z.string().datetime(),
});
export type IRelationship = z.infer<typeof RelationshipSchema>;

/**
 * Create relationship input schema
 */
export const CreateRelationshipSchema = z.object({
  type: RelationshipTypeSchema,
  sourceId: z.string().uuid(),
  targetId: z.string().uuid(),
  properties: z.record(z.string(), z.unknown()).default({}),
});
export type CreateRelationshipInput = z.infer<typeof CreateRelationshipSchema>;

/**
 * Relationship filter schema for queries
 */
export const RelationshipFilterSchema = z.object({
  type: RelationshipTypeSchema.optional(),
  direction: z.enum(["incoming", "outgoing", "both"]).default("both"),
});
export type RelationshipFilter = z.infer<typeof RelationshipFilterSchema>;

// ========================================
// Graph Schemas
// ========================================

/**
 * Graph structure (collection of nodes and relationships)
 */
export const GraphSchema = z.object({
  nodes: z.array(NodeSchema),
  relationships: z.array(RelationshipSchema),
});
export type IGraph = z.infer<typeof GraphSchema>;

/**
 * Paginated node list response
 */
export const PaginatedNodesSchema = z.object({
  nodes: z.array(NodeSchema),
  pagination: z.object({
    total: z.number().int().min(0),
    limit: z.number().int().min(1),
    offset: z.number().int().min(0),
  }),
});
export type IPaginatedNodes = z.infer<typeof PaginatedNodesSchema>;

/**
 * Graph query filter schema
 */
export const GraphFilterSchema = z.object({
  labels: z.array(NodeLabelSchema).optional(),
  limit: z.coerce
    .number<number>()
    .int()
    .min(1)
    .max(1000)
    .default(500)
    .transform((val) => neo4j.int(val)),
});
export type GraphFilter = z.output<typeof GraphFilterSchema>;

/**
 * Subgraph query schema
 */
export const SubgraphQuerySchema = z.object({
  depth: z.coerce.number<number>().int().min(1).max(3).default(1),
});
export type SubgraphQuery = z.infer<typeof SubgraphQuerySchema>;

/**
 * Subgraph response schema
 */
export const SubgraphSchema = z.object({
  nodes: z.array(NodeSchema),
  relationships: z.array(RelationshipSchema),
  depth: z.number().int(),
  centerNodeId: z.string().uuid(),
});
export type ISubgraph = z.infer<typeof SubgraphSchema>;

/**
 * Node with relationships response schema
 */
export const NodeWithRelationshipsSchema = z.object({
  node: NodeSchema,
  relationships: z.object({
    outgoing: z.array(
      z.object({
        relationship: RelationshipSchema,
        target: z.object({
          id: z.string().uuid(),
          label: NodeLabelSchema,
          name: z.string().optional(),
        }),
      }),
    ),
    incoming: z.array(
      z.object({
        relationship: RelationshipSchema,
        source: z.object({
          id: z.string().uuid(),
          label: NodeLabelSchema,
          name: z.string().optional(),
        }),
      }),
    ),
  }),
});
export type INodeWithRelationships = z.infer<
  typeof NodeWithRelationshipsSchema
>;

/**
 * Neighbor query schema
 */
export const NeighborQuerySchema = z.object({
  relationshipType: RelationshipTypeSchema.optional(),
  direction: z.enum(["incoming", "outgoing", "both"]).default("both"),
});
export type NeighborQuery = z.infer<typeof NeighborQuerySchema>;

/**
 * Node neighbors response schema
 */
export const NodeNeighborsSchema = z.object({
  center: NodeSchema,
  neighbors: z.array(NodeSchema),
  relationships: z.array(RelationshipSchema),
});
export type INodeNeighbors = z.infer<typeof NodeNeighborsSchema>;

/**
 * Node search query schema
 */
export const NodeSearchSchema = z.object({
  q: z.string().min(1),
  label: NodeLabelSchema.optional(),
  limit: z.coerce.number<number>().int().min(1).max(100).default(50),
});
export type NodeSearch = z.infer<typeof NodeSearchSchema>;

// ========================================
// Legacy Schemas (for backward compatibility with existing graph visualization)
// ========================================

/**
 * @deprecated Use NodeSchema instead
 * Legacy schema updated to support dynamic node types
 */
export const GraphNodeSchema = z.object({
  id: z.string(),
  type: z.string().min(1).max(100),
  label: z.string(),
  properties: z.record(z.string(), z.unknown()).default({}),
});
export type IGraphNode = z.infer<typeof GraphNodeSchema>;

/**
 * @deprecated Use RelationshipSchema instead
 * Legacy schema updated to support dynamic relationship types
 */
export const GraphEdgeSchema = z.object({
  id: z.string(),
  source: z.string(),
  target: z.string(),
  type: z.string().min(1).max(100),
  properties: z.record(z.string(), z.unknown()).default({}),
});
export type IGraphEdge = z.infer<typeof GraphEdgeSchema>;

/**
 * @deprecated Use GraphSchema instead
 */
export const GraphDataSchema = z.object({
  nodes: z.array(GraphNodeSchema),
  edges: z.array(GraphEdgeSchema),
});
export type IGraphData = z.infer<typeof GraphDataSchema>;

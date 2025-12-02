import { z } from "zod";

// ========================================
// Node Schemas
// ========================================

/**
 * Node label enum
 */
export const NodeLabelEnum = z.enum([
	"Person",
	"Document",
	"Concept",
	"Topic",
]);
export type NodeLabel = z.infer<typeof NodeLabelEnum>;

/**
 * Base node schema
 */
export const NodeSchema = z.object({
	id: z.string().uuid(),
	label: NodeLabelEnum,
	properties: z.record(z.unknown()),
	createdAt: z.string().datetime(),
	updatedAt: z.string().datetime(),
});
export type INode = z.infer<typeof NodeSchema>;

/**
 * Create node input schema
 */
export const CreateNodeSchema = z.object({
	label: NodeLabelEnum,
	properties: z.record(z.unknown()).default({}),
});
export type CreateNodeInput = z.infer<typeof CreateNodeSchema>;

/**
 * Update node input schema
 */
export const UpdateNodeSchema = z.object({
	properties: z.record(z.unknown()),
});
export type UpdateNodeInput = z.infer<typeof UpdateNodeSchema>;

/**
 * Node filter schema for queries
 */
export const NodeFilterSchema = z.object({
	label: NodeLabelEnum.optional(),
	limit: z.number().int().min(1).max(1000).default(50),
	offset: z.number().int().min(0).default(0),
});
export type NodeFilter = z.infer<typeof NodeFilterSchema>;

// ========================================
// Relationship Schemas
// ========================================

/**
 * Relationship type enum
 */
export const RelationshipTypeEnum = z.enum([
	"WROTE",
	"REFERENCES",
	"BELONGS_TO",
	"RELATES_TO",
	"MENTIONS",
]);
export type RelationshipType = z.infer<typeof RelationshipTypeEnum>;

/**
 * Base relationship schema
 */
export const RelationshipSchema = z.object({
	id: z.string().uuid(),
	type: RelationshipTypeEnum,
	sourceId: z.string().uuid(),
	targetId: z.string().uuid(),
	properties: z.record(z.unknown()),
	createdAt: z.string().datetime(),
});
export type IRelationship = z.infer<typeof RelationshipSchema>;

/**
 * Create relationship input schema
 */
export const CreateRelationshipSchema = z.object({
	type: RelationshipTypeEnum,
	sourceId: z.string().uuid(),
	targetId: z.string().uuid(),
	properties: z.record(z.unknown()).default({}),
});
export type CreateRelationshipInput = z.infer<
	typeof CreateRelationshipSchema
>;

/**
 * Relationship filter schema for queries
 */
export const RelationshipFilterSchema = z.object({
	type: RelationshipTypeEnum.optional(),
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
	labels: z.array(NodeLabelEnum).optional(),
	limit: z.number().int().min(1).max(1000).default(500),
});
export type GraphFilter = z.infer<typeof GraphFilterSchema>;

/**
 * Subgraph query schema
 */
export const SubgraphQuerySchema = z.object({
	depth: z.number().int().min(1).max(3).default(1),
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
					label: NodeLabelEnum,
					name: z.string().optional(),
				}),
			}),
		),
		incoming: z.array(
			z.object({
				relationship: RelationshipSchema,
				source: z.object({
					id: z.string().uuid(),
					label: NodeLabelEnum,
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
	relationshipType: RelationshipTypeEnum.optional(),
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
	label: NodeLabelEnum.optional(),
	limit: z.number().int().min(1).max(100).default(50),
});
export type NodeSearch = z.infer<typeof NodeSearchSchema>;

// ========================================
// Legacy Schemas (for backward compatibility with existing graph visualization)
// ========================================

/**
 * @deprecated Use NodeSchema instead
 */
export const GraphNodeSchema = z.object({
	id: z.string(),
	type: z.enum(["person", "document", "concept", "topic"]),
	label: z.string(),
	properties: z.record(z.string(), z.unknown()).default({}),
});
export type IGraphNode = z.infer<typeof GraphNodeSchema>;

/**
 * @deprecated Use RelationshipSchema instead
 */
export const GraphEdgeSchema = z.object({
	id: z.string(),
	source: z.string(),
	target: z.string(),
	type: z.enum(["wrote", "references", "related_to", "belongs_to"]),
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

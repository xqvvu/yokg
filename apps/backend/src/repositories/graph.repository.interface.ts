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
import type { Integer } from "neo4j-driver";

export interface IGraphRepository {
  // Node operations
  createNode(
    label: NodeLabel,
    properties: Record<string, unknown>,
  ): Promise<INode>;
  findNodeById(id: string): Promise<INode | null>;
  findNodes(filter: NodeFilter): Promise<INode[]>;
  countNodes(filter: Partial<NodeFilter>): Promise<number>;
  updateNode(id: string, properties: Record<string, unknown>): Promise<INode>;
  deleteNode(id: string): Promise<void>;

  // Relationship operations
  createRelationship(
    type: RelationshipType,
    sourceId: string,
    targetId: string,
    properties: Record<string, unknown>,
  ): Promise<IRelationship>;
  findRelationshipById(id: string): Promise<IRelationship | null>;
  findRelationships(
    nodeId: string,
    filter: RelationshipFilter,
  ): Promise<IRelationship[]>;
  deleteRelationship(id: string): Promise<void>;

  // Graph query operations
  findGraph(limit: Integer): Promise<IGraph>;
  findSubgraph(nodeId: string, depth: number): Promise<ISubgraph>;
  findNeighbors(nodeId: string): Promise<INodeNeighbors>;
  findNodeWithRelationships(nodeId: string): Promise<INodeWithRelationships>;
  searchNodes(
    query: string,
    label?: NodeLabel,
    limit?: number,
  ): Promise<INode[]>;
}

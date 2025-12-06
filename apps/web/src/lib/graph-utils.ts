import type { IGraphData, IGraphNode } from "@graph-mind/shared/validate/graph";
import type { LucideIcon } from "lucide-react";
import { BookOpen, Circle, FileText, Lightbulb, User } from "lucide-react";

/**
 * Node type style configuration
 */
export interface NodeStyleConfig {
  type: string;
  icon: LucideIcon;
  color: string;
  bg: string;
  label: string;
}

/**
 * Predefined configurations for known node types
 */
const KNOWN_TYPE_CONFIGS: Record<string, NodeStyleConfig> = {
  person: {
    type: "person",
    icon: User,
    color: "text-blue-600",
    bg: "bg-blue-50",
    label: "People",
  },
  document: {
    type: "document",
    icon: FileText,
    color: "text-green-600",
    bg: "bg-green-50",
    label: "Documents",
  },
  concept: {
    type: "concept",
    icon: Lightbulb,
    color: "text-violet-600",
    bg: "bg-violet-50",
    label: "Concepts",
  },
  topic: {
    type: "topic",
    icon: BookOpen,
    color: "text-amber-600",
    bg: "bg-amber-50",
    label: "Topics",
  },
};

/**
 * Color palette for unknown types (hash-based consistent colors)
 */
const FALLBACK_COLORS = [
  { color: "text-rose-600", bg: "bg-rose-50" },
  { color: "text-pink-600", bg: "bg-pink-50" },
  { color: "text-fuchsia-600", bg: "bg-fuchsia-50" },
  { color: "text-purple-600", bg: "bg-purple-50" },
  { color: "text-indigo-600", bg: "bg-indigo-50" },
  { color: "text-sky-600", bg: "bg-sky-50" },
  { color: "text-cyan-600", bg: "bg-cyan-50" },
  { color: "text-teal-600", bg: "bg-teal-50" },
  { color: "text-emerald-600", bg: "bg-emerald-50" },
  { color: "text-lime-600", bg: "bg-lime-50" },
  { color: "text-orange-600", bg: "bg-orange-50" },
  { color: "text-red-600", bg: "bg-red-50" },
];

/**
 * Simple string hash function for consistent color assignment
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Extract unique node types from graph data
 * @param nodes - Array of graph nodes
 * @returns Array of unique node type strings
 */
export function extractNodeTypes(nodes: IGraphNode[]): string[] {
  const typeSet = new Set<string>();
  for (const node of nodes) {
    typeSet.add(node.type);
  }
  return Array.from(typeSet).sort();
}

/**
 * Extract unique relationship types from graph data
 * @param edges - Array of graph edges
 * @returns Array of unique relationship type strings
 */
export function extractRelationshipTypes(edges: IGraphData["edges"]): string[] {
  const typeSet = new Set<string>();
  for (const edge of edges) {
    typeSet.add(edge.type);
  }
  return Array.from(typeSet).sort();
}

/**
 * Get style configuration for a node type
 * Returns predefined config for known types, or generates fallback config for unknown types
 *
 * Fallback strategy:
 * - Uses hash-based color assignment for consistency
 * - Uses Circle icon for unknown types
 * - Capitalizes type name for label
 *
 * @param type - Node type string
 * @returns Style configuration object
 */
export function getNodeStyleConfig(type: string): NodeStyleConfig {
  // Check if this is a known type (case-insensitive)
  const normalizedType = type.toLowerCase();
  if (normalizedType in KNOWN_TYPE_CONFIGS) {
    return KNOWN_TYPE_CONFIGS[normalizedType];
  }

  // Generate fallback config for unknown type
  const hash = hashString(type);
  const colorIndex = hash % FALLBACK_COLORS.length;
  const colors = FALLBACK_COLORS[colorIndex];

  return {
    type,
    icon: Circle,
    color: colors.color,
    bg: colors.bg,
    label: type.charAt(0).toUpperCase() + type.slice(1), // Capitalize first letter
  };
}

/**
 * Get icon component for a node type
 * @param type - Node type string
 * @returns Lucide icon component
 */
export function getNodeIcon(type: IGraphNode["type"]): LucideIcon {
  return getNodeStyleConfig(type).icon;
}

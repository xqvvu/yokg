import type { IGraphEdge } from "@graph-mind/shared/validate/graph";
import React, { useId } from "react";
import type { SimulationNode } from "@/components/graph/use-force-simulation";

interface GraphEdgeProps {
  edge: IGraphEdge;
  sourceNode: SimulationNode;
  targetNode: SimulationNode;
}

/**
 * Renders a single edge (relationship) between two nodes in the graph.
 *
 * Enhanced edges with:
 * - Curved paths for better visual flow
 * - Arrow markers indicating direction
 * - Type-specific styling
 */
function GraphEdgeComponent({ edge, sourceNode, targetNode }: GraphEdgeProps) {
  const arrowId = useId();

  // Enhanced edge styling based on relationship type
  const getEdgeStyle = (type: IGraphEdge["type"]) => {
    switch (type) {
      case "wrote":
        return {
          stroke: "#64748b",
          strokeWidth: 2.5,
          strokeDasharray: "none",
          opacity: 0.7,
        };
      case "references":
        return {
          stroke: "#94a3b8",
          strokeWidth: 2,
          strokeDasharray: "6,3",
          opacity: 0.6,
        };
      case "related_to":
        return {
          stroke: "#cbd5e1",
          strokeWidth: 1.5,
          strokeDasharray: "none",
          opacity: 0.5,
        };
      case "belongs_to":
        return {
          stroke: "#64748b",
          strokeWidth: 2,
          strokeDasharray: "3,3",
          opacity: 0.6,
        };
      default:
        return {
          stroke: "#cbd5e1",
          strokeWidth: 1.5,
          strokeDasharray: "none",
          opacity: 0.5,
        };
    }
  };

  const style = getEdgeStyle(edge.type);

  // Guard: only render if both nodes have positions
  if (
    sourceNode.x === undefined ||
    sourceNode.y === undefined ||
    targetNode.x === undefined ||
    targetNode.y === undefined
  ) {
    return null;
  }

  // Calculate curve control point for smoother edges
  const dx = targetNode.x - sourceNode.x;
  const dy = targetNode.y - sourceNode.y;
  const dr = Math.sqrt(dx * dx + dy * dy);

  // Create a curved path
  const pathData = `M ${sourceNode.x},${sourceNode.y} Q ${sourceNode.x + dx / 2},${sourceNode.y + dy / 2 - dr * 0.1} ${targetNode.x},${targetNode.y}`;

  return (
    <g>
      {/* Shadow edge for depth */}
      <path
        d={pathData}
        fill="none"
        opacity={style.opacity * 0.3}
        stroke="#000000"
        strokeDasharray={style.strokeDasharray}
        strokeLinecap="round"
        strokeWidth={style.strokeWidth}
        transform="translate(0, 1)"
      />

      {/* Main edge */}
      <path
        d={pathData}
        fill="none"
        markerEnd={`url(#${arrowId})`}
        opacity={style.opacity}
        stroke={style.stroke}
        strokeDasharray={style.strokeDasharray}
        strokeLinecap="round"
        strokeWidth={style.strokeWidth}
        style={{
          transition: "all 0.2s ease",
        }}
      >
        <title>{`${edge.type}: ${sourceNode.label} → ${targetNode.label}`}</title>
      </path>

      {/* Arrow marker definition */}
      <defs>
        <marker
          id={arrowId}
          markerHeight="10"
          markerUnits="strokeWidth"
          markerWidth="10"
          orient="auto"
          refX="9"
          refY="3"
          viewBox="0 0 10 10"
        >
          <path
            d="M 0 0 L 10 5 L 0 10 z"
            fill={style.stroke}
            opacity={style.opacity}
          />
        </marker>
      </defs>
    </g>
  );
}

export const GraphEdge = React.memo(GraphEdgeComponent);

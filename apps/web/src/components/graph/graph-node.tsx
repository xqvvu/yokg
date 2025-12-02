import type { IGraphNode } from "@graph-mind/shared/validate/graph";
import React, { useId, useState } from "react";
import type { SimulationNode } from "@/components/graph/use-force-simulation";

interface GraphNodeProps {
  node: SimulationNode;
  isSelected: boolean;
  onSelect: (nodeId: string) => void;
  onDragStart: (nodeId: string, x: number, y: number) => void;
  onDrag: (nodeId: string, x: number, y: number) => void;
  onDragEnd: (nodeId: string) => void;
}

/**
 * Enhanced node color palette based on node type.
 * Uses modern gradient-like colors for better visual appeal.
 */
const NODE_COLORS: Record<
  IGraphNode["type"],
  { fill: string; stroke: string }
> = {
  person: { fill: "#3b82f6", stroke: "#2563eb" }, // blue-500/600
  document: { fill: "#10b981", stroke: "#059669" }, // green-500/600
  concept: { fill: "#8b5cf6", stroke: "#7c3aed" }, // violet-500/600
  topic: { fill: "#f59e0b", stroke: "#d97706" }, // amber-500/600
};

/**
 * Renders a single node in the graph visualization.
 *
 * Nodes are rendered as circles with:
 * - Type-specific colors
 * - Labels below the circle
 * - Hover effects
 * - Selection state
 * - Drag interactions
 */
function GraphNodeComponent({
  node,
  isSelected,
  onSelect,
  onDragStart,
  onDrag,
  onDragEnd,
}: GraphNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const gradientId = useId();

  // Guard: only render if node has position
  if (node.x === undefined || node.y === undefined) {
    return null;
  }

  const baseRadius = 12;
  const radius = isSelected
    ? baseRadius + 3
    : isHovered
      ? baseRadius + 2
      : baseRadius;
  const colors = NODE_COLORS[node.type];

  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsDragging(true);
    onDragStart(node.id, event.clientX, event.clientY);
  };

  const handleMouseMove = (event: React.MouseEvent) => {
    if (isDragging) {
      onDrag(node.id, event.clientX, event.clientY);
    }
  };

  const handleMouseUp = () => {
    if (isDragging) {
      setIsDragging(false);
      onDragEnd(node.id);
    }
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (isDragging) {
      setIsDragging(false);
      onDragEnd(node.id);
    }
  };

  const handleClick = (event: React.MouseEvent) => {
    event.stopPropagation();
    onSelect(node.id);
  };

  return (
    <g
      aria-label={`${node.label} (${node.type})`}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(node.id);
        }
      }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      role="button"
      style={{
        cursor: isDragging ? "grabbing" : "grab",
        transition: "all 0.2s ease",
      }}
      tabIndex={0}
      transform={`translate(${node.x}, ${node.y})`}
    >
      {/* Outer glow for hover/selection */}
      {(isHovered || isSelected) && (
        <circle
          fill={colors.fill}
          opacity={0.2}
          pointerEvents="none"
          r={radius + 6}
        />
      )}

      {/* Node circle with shadow effect */}
      <circle
        fill={`url(#${gradientId})`}
        opacity={0.3}
        pointerEvents="none"
        r={radius}
        transform="translate(0, 2)"
      />

      {/* Main node circle */}
      <circle
        fill={colors.fill}
        opacity={1}
        r={radius}
        stroke={colors.stroke}
        strokeWidth={isSelected ? 3 : 2}
        style={{
          filter: isHovered ? "brightness(1.1)" : "brightness(1)",
          transition: "all 0.2s ease",
        }}
      >
        <title>{`${node.label} (${node.type})`}</title>
      </circle>

      {/* Highlight for 3D effect */}
      <circle
        cx={-radius / 3}
        cy={-radius / 3}
        fill="white"
        opacity={0.3}
        pointerEvents="none"
        r={radius / 3}
      />

      {/* Node label with background */}
      <rect
        fill="white"
        height="18"
        opacity={isHovered || isSelected ? 0.9 : 0.8}
        pointerEvents="none"
        rx="4"
        width={node.label.length * 7 + 8}
        x={-(node.label.length * 7 + 8) / 2}
        y={radius + 8}
      />
      <text
        fill="#0f172a"
        fontSize="11"
        fontWeight={isSelected ? "600" : "500"}
        pointerEvents="none"
        textAnchor="middle"
        y={radius + 20}
      >
        {node.label}
      </text>

      {/* Selection ring */}
      {isSelected && (
        <circle
          fill="none"
          opacity={0.6}
          pointerEvents="none"
          r={radius + 8}
          stroke={colors.fill}
          strokeDasharray="4 2"
          strokeWidth={2}
          style={{
            animation: "pulse 2s ease-in-out infinite",
          }}
        />
      )}

      {/* SVG Definitions for gradients */}
      <defs>
        <radialGradient id={gradientId}>
          <stop
            offset="0%"
            stopColor="#000000"
            stopOpacity="0.3"
          />
          <stop
            offset="100%"
            stopColor="#000000"
            stopOpacity="0"
          />
        </radialGradient>
      </defs>
    </g>
  );
}

export const GraphNode = React.memo(GraphNodeComponent);

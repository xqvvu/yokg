import { createFileRoute } from "@tanstack/react-router";
import { isNotNil } from "es-toolkit";
import { useMemo, useRef, useState } from "react";
import type { GraphCanvasHandle } from "@/components/graph/graph-canvas";
import { GraphCanvas } from "@/components/graph/graph-canvas";
import { GraphControls } from "@/components/graph/graph-controls";
import { GraphLegend } from "@/components/graph/graph-legend";
import { GraphToolbar } from "@/components/graph/graph-toolbar";
import { NodeDetailPanel } from "@/components/graph/node-detail-panel";
import { mockGraphData } from "@/lib/mocks/graph-data";

export const Route = createFileRoute("/graph/")({
  component: Graph,
});

function Graph() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [nodeTypeFilter, setNodeTypeFilter] = useState("all");
  const graphCanvasRef = useRef<GraphCanvasHandle>(null);

  // Get the selected node object
  const selectedNode = selectedNodeId
    ? (mockGraphData.nodes.find((n) => n.id === selectedNodeId) ?? null)
    : null;

  // Filter graph data based on search and filters
  const filteredGraphData = useMemo(() => {
    let filteredNodes = mockGraphData.nodes;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filteredNodes = filteredNodes.filter(
        (node) =>
          node.label.toLowerCase().includes(query) ||
          node.type.toLowerCase().includes(query),
      );
    }

    // Apply type filter
    if (nodeTypeFilter !== "all") {
      filteredNodes = filteredNodes.filter(
        (node) => node.type === nodeTypeFilter,
      );
    }

    // Filter edges to only include those connected to filtered nodes
    const nodeIds = new Set(filteredNodes.map((n) => n.id));
    const filteredEdges = mockGraphData.edges.filter(
      (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
    );

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  }, [searchQuery, nodeTypeFilter]);

  const handleNodeSelect = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  };

  const handleClosePanel = () => {
    setSelectedNodeId(null);
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export graph");
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    console.log("Share graph");
  };

  const handleInfo = () => {
    // TODO: Implement info modal
    console.log("Show graph info");
  };

  return (
    <div className="flex flex-col w-full h-screen bg-background">
      {/* Top toolbar */}
      <GraphToolbar
        nodeTypeFilter={nodeTypeFilter}
        onExport={handleExport}
        onInfo={handleInfo}
        onNodeTypeFilterChange={setNodeTypeFilter}
        onSearchChange={setSearchQuery}
        onShare={handleShare}
        searchQuery={searchQuery}
      />

      {/* Main content area */}
      <div className="flex flex-1 relative overflow-hidden">
        {/* Graph canvas */}
        <div className="flex-1 relative">
          <GraphCanvas
            data={filteredGraphData}
            height={800}
            onNodeSelect={handleNodeSelect}
            ref={graphCanvasRef}
            width={1200}
          />

          {/* Floating zoom controls - bottom right */}
          <div className="absolute bottom-6 right-6 z-10">
            <GraphControls
              onResetZoom={() => graphCanvasRef.current?.resetZoom()}
              onZoomIn={() => graphCanvasRef.current?.zoomIn()}
              onZoomOut={() => graphCanvasRef.current?.zoomOut()}
            />
          </div>

          {/* Legend - bottom left */}
          <div className="absolute bottom-6 left-6 z-10 w-64">
            <GraphLegend graphData={mockGraphData} />
          </div>
        </div>
      </div>

      {/* Node detail panel (sheet overlay) */}
      <NodeDetailPanel
        graphData={mockGraphData}
        node={selectedNode}
        onClose={handleClosePanel}
        open={isNotNil(selectedNode)}
      />
    </div>
  );
}

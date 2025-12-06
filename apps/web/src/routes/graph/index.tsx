import type { IGraphEdge, IGraphNode } from "@graph-mind/shared/validate/graph";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { isNotNil } from "es-toolkit";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { AddNodeDialog } from "@/components/graph/add-node-dialog";
import { AddRelationshipDialog } from "@/components/graph/add-relationship-dialog";
import { CommandPalette } from "@/components/graph/command-palette";
import { FloatingActionMenu } from "@/components/graph/floating-action-menu";
import type { GraphCanvasHandle } from "@/components/graph/graph-canvas";
import { GraphCanvas } from "@/components/graph/graph-canvas";
import { GraphEmptyState } from "@/components/graph/graph-empty-state";
import { GraphLegend } from "@/components/graph/graph-legend";
import { GraphSidebar } from "@/components/graph/graph-sidebar";
import { GraphToolbar } from "@/components/graph/graph-toolbar";
import { NodeDetailPanel } from "@/components/graph/node-detail-panel";
import {
  convertGraphToLegacyFormat,
  createNode,
  createRelationship,
  deleteNode,
  getGraph,
} from "@/lib/api/graph";

export const Route = createFileRoute("/graph/")({
  component: Graph,
});

function Graph() {
  const queryClient = useQueryClient();
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [nodeTypeFilter, setNodeTypeFilter] = useState("all");
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [addNodeDialogOpen, setAddNodeDialogOpen] = useState(false);
  const [addRelationshipDialogOpen, setAddRelationshipDialogOpen] =
    useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const graphCanvasRef = useRef<GraphCanvasHandle>(null);

  // Fetch graph data from API
  const {
    data: graphData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["graph"],
    queryFn: async () => {
      const graph = await getGraph(500); // Limit to 500 nodes
      return convertGraphToLegacyFormat(graph);
    },
    staleTime: 1000 * 60 * 2, // 2 minutes
  });

  // Create node mutation
  const createNodeMutation = useMutation({
    mutationFn: createNode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["graph"] });
      toast.success("Node created successfully");
      setAddNodeDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create node: ${error.message}`);
    },
  });

  // Delete node mutation
  const deleteNodeMutation = useMutation({
    mutationFn: deleteNode,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["graph"] });
      toast.success("Node deleted successfully");
      setSelectedNodeId(null);
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete node: ${error.message}`);
    },
  });

  // Create relationship mutation
  const createRelationshipMutation = useMutation({
    mutationFn: createRelationship,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["graph"] });
      toast.success("Relationship created successfully");
      setAddRelationshipDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error(`Failed to create relationship: ${error.message}`);
    },
  });

  // Define handlers with useCallback to prevent re-renders
  const handleAddNode = useCallback(() => {
    setAddNodeDialogOpen(true);
  }, []);

  const handleAddRelationship = useCallback(() => {
    setAddRelationshipDialogOpen(true);
  }, []);

  const handleDeleteNode = useCallback(
    (node: { id: string; label: string } | null) => {
      if (!node) return;
      // Delete node via API
      deleteNodeMutation.mutate(node.id);
    },
    [deleteNodeMutation],
  );

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      // Cmd/Ctrl + K for command palette
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setCommandPaletteOpen(true);
        return;
      }

      // Cmd/Ctrl + N for Add Node
      if ((e.metaKey || e.ctrlKey) && e.key === "n") {
        e.preventDefault();
        handleAddNode();
        return;
      }

      // Cmd/Ctrl + E for Add Relationship
      if ((e.metaKey || e.ctrlKey) && e.key === "e") {
        e.preventDefault();
        handleAddRelationship();
        return;
      }

      // Cmd/Ctrl + F to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === "f") {
        e.preventDefault();
        // Focus the search bar in toolbar (would need to implement ref)
        toast.info("Search shortcut - focus search bar");
        return;
      }

      // Delete or Backspace to delete selected node
      if ((e.key === "Delete" || e.key === "Backspace") && selectedNodeId) {
        e.preventDefault();
        const node = graphData?.nodes.find((n) => n.id === selectedNodeId);
        if (node) {
          handleDeleteNode(node);
        }
        return;
      }

      // Escape to close dialogs/panels
      if (e.key === "Escape") {
        if (commandPaletteOpen) {
          setCommandPaletteOpen(false);
        } else if (addNodeDialogOpen) {
          setAddNodeDialogOpen(false);
        } else if (addRelationshipDialogOpen) {
          setAddRelationshipDialogOpen(false);
        } else if (selectedNodeId) {
          setSelectedNodeId(null);
        }
        return;
      }

      // ? for keyboard shortcuts help
      if (e.key === "?" && !e.shiftKey) {
        e.preventDefault();
        toast.info(
          "Keyboard shortcuts: ⌘K (Search), ⌘N (New Node), ⌘E (New Relation), Del (Delete)",
        );
        return;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    commandPaletteOpen,
    addNodeDialogOpen,
    addRelationshipDialogOpen,
    selectedNodeId,
    handleAddNode,
    handleAddRelationship,
    handleDeleteNode,
    graphData,
  ]);

  // Get the selected node object
  const selectedNode = selectedNodeId
    ? (graphData?.nodes.find((n) => n.id === selectedNodeId) ?? null)
    : null;

  // Filter graph data based on search and filters
  const filteredGraphData = useMemo(() => {
    if (!graphData) {
      return { nodes: [], edges: [] };
    }

    let filteredNodes = graphData.nodes;

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
    const filteredEdges = graphData.edges.filter(
      (edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target),
    );

    return {
      nodes: filteredNodes,
      edges: filteredEdges,
    };
  }, [graphData, searchQuery, nodeTypeFilter]);

  const handleNodeSelect = (nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  };

  const handleClosePanel = () => {
    setSelectedNodeId(null);
  };

  const handleSettings = () => {
    // TODO: Open Settings dialog when implemented
    toast.info("Settings dialog coming soon!");
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast.info("Export functionality coming soon!");
  };

  const handleShare = () => {
    // TODO: Implement share functionality
    toast.info("Share functionality coming soon!");
  };

  const handleInfo = () => {
    // TODO: Implement info modal
    toast.info("Graph info coming soon!");
  };

  const handleCommandPaletteNodeSelect = (nodeId: string) => {
    setSelectedNodeId(nodeId);
    // Center the node in the viewport (TODO: implement scroll to node)
    const node = graphData?.nodes.find((n) => n.id === nodeId);
    if (node) {
      toast.success(`Selected node: ${node.label}`);
    }
  };

  const handleEditNode = (node: typeof selectedNode) => {
    if (!node) return;
    // TODO: Open Edit Node dialog when implemented
    toast.info(`Edit node: ${node.label}`);
  };

  const handleDuplicateNode = (node: typeof selectedNode) => {
    if (!node) return;
    // TODO: Implement node duplication
    toast.success(`Duplicated node: ${node.label}`);
  };

  const handleNodeSubmit = useCallback(
    (data: Partial<IGraphNode>) => {
      if (!data.type || !data.label) {
        toast.error("Type and label are required");
        return;
      }
      // Use the type as label (now supports any dynamic type)
      createNodeMutation.mutate({
        label: data.type,
        properties: {
          ...(data.properties || {}),
          name: data.label,
        },
      });
    },
    [createNodeMutation],
  );

  const handleRelationshipSubmit = useCallback(
    (data: Partial<IGraphEdge>) => {
      if (!data.source || !data.target || !data.type) {
        toast.error("Source, target, and type are required");
        return;
      }

      // Use the type directly (now supports any dynamic type)
      createRelationshipMutation.mutate({
        type: data.type,
        sourceId: data.source,
        targetId: data.target,
        properties: data.properties || {},
      });
    },
    [createRelationshipMutation],
  );

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg">Loading graph...</div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-lg text-red-500">
          Error loading graph:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </div>
      </div>
    );
  }

  // Check if graph has data
  const hasGraphData =
    graphData && (graphData.nodes.length > 0 || graphData.edges.length > 0);

  return (
    <div className="flex flex-col w-full h-screen bg-background">
      {/* Command Palette */}
      <CommandPalette
        graphData={graphData || { nodes: [], edges: [] }}
        onAddNode={handleAddNode}
        onAddRelationship={handleAddRelationship}
        onNodeSelect={handleCommandPaletteNodeSelect}
        onOpenChange={setCommandPaletteOpen}
        open={commandPaletteOpen}
      />

      {/* Enhanced Top Toolbar */}
      <GraphToolbar
        nodes={graphData?.nodes ?? []}
        nodeTypeFilter={nodeTypeFilter}
        onAddNode={handleAddNode}
        onExport={handleExport}
        onInfo={handleInfo}
        onNodeTypeFilterChange={setNodeTypeFilter}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        onSearchChange={setSearchQuery}
        onSettings={handleSettings}
        onShare={handleShare}
        searchQuery={searchQuery}
      />

      {/* Main content area */}
      <div className="flex flex-1 relative overflow-hidden">
        {hasGraphData ? (
          <>
            {/* Collapsible Sidebar */}
            <GraphSidebar
              graphData={graphData || { nodes: [], edges: [] }}
              isOpen={sidebarOpen}
              nodeTypeFilter={nodeTypeFilter}
              onNodeTypeFilterChange={setNodeTypeFilter}
              onToggle={() => setSidebarOpen(!sidebarOpen)}
            />

            {/* Graph canvas */}
            <div
              className="flex-1 relative transition-all duration-300"
              style={{ marginLeft: sidebarOpen ? "320px" : "0" }}
            >
              <GraphCanvas
                data={filteredGraphData}
                height={800}
                onNodeSelect={handleNodeSelect}
                ref={graphCanvasRef}
                width={1200}
              />

              {/* Floating Action Menu - bottom right */}
              <div className="absolute bottom-6 right-6 z-10">
                <FloatingActionMenu
                  onAddNode={handleAddNode}
                  onExport={handleExport}
                  onFitToScreen={() => graphCanvasRef.current?.resetZoom()}
                  onResetZoom={() => graphCanvasRef.current?.resetZoom()}
                  onZoomIn={() => graphCanvasRef.current?.zoomIn()}
                  onZoomOut={() => graphCanvasRef.current?.zoomOut()}
                />
              </div>

              {/* Legend - bottom left */}
              <div className="absolute bottom-6 left-6 z-10 w-64">
                <GraphLegend
                  graphData={graphData || { nodes: [], edges: [] }}
                />
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <GraphEmptyState onAddNode={handleAddNode} />
        )}
      </div>

      {/* Node detail panel (sheet overlay) */}
      <NodeDetailPanel
        graphData={graphData || { nodes: [], edges: [] }}
        node={selectedNode}
        onClose={handleClosePanel}
        onDelete={handleDeleteNode}
        onDuplicate={handleDuplicateNode}
        onEdit={handleEditNode}
        open={isNotNil(selectedNode)}
      />

      {/* Add Node Dialog */}
      <AddNodeDialog
        onOpenChange={setAddNodeDialogOpen}
        onSubmit={handleNodeSubmit}
        open={addNodeDialogOpen}
      />

      {/* Add Relationship Dialog */}
      <AddRelationshipDialog
        graphData={graphData || { nodes: [], edges: [] }}
        onOpenChange={setAddRelationshipDialogOpen}
        onSubmit={handleRelationshipSubmit}
        open={addRelationshipDialogOpen}
        sourceNodeId={selectedNodeId ?? undefined}
      />
    </div>
  );
}

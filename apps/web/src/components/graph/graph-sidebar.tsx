import type { IGraphData } from "@graph-mind/shared/validate/graph";
import {
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Filter,
  Network,
  X,
} from "lucide-react";
import { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";

interface GraphSidebarProps {
  graphData: IGraphData;
  nodeTypeFilter: string;
  onNodeTypeFilterChange: (type: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

/**
 * Collapsible sidebar with filters and graph statistics.
 * Shows node type filters, graph metrics, and most connected nodes.
 */
export function GraphSidebar({
  graphData,
  nodeTypeFilter,
  onNodeTypeFilterChange,
  isOpen,
  onToggle,
}: GraphSidebarProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    // Count nodes by type
    const nodeTypeCounts: Record<string, number> = {};
    for (const node of graphData.nodes) {
      nodeTypeCounts[node.type] = (nodeTypeCounts[node.type] || 0) + 1;
    }

    // Count relationships by type
    const relationshipTypeCounts: Record<string, number> = {};
    for (const edge of graphData.edges) {
      relationshipTypeCounts[edge.type] =
        (relationshipTypeCounts[edge.type] || 0) + 1;
    }

    // Calculate node connections
    const nodeConnections: Record<string, number> = {};
    for (const edge of graphData.edges) {
      nodeConnections[edge.source] = (nodeConnections[edge.source] || 0) + 1;
      nodeConnections[edge.target] = (nodeConnections[edge.target] || 0) + 1;
    }

    // Get most connected nodes
    const mostConnected = graphData.nodes
      .map((node) => ({
        node,
        connections: nodeConnections[node.id] || 0,
      }))
      .sort((a, b) => b.connections - a.connections)
      .slice(0, 5);

    return {
      nodeTypeCounts,
      relationshipTypeCounts,
      mostConnected,
      totalNodes: graphData.nodes.length,
      totalEdges: graphData.edges.length,
    };
  }, [graphData]);

  const handleClearFilters = () => {
    onNodeTypeFilterChange("all");
  };

  if (!isOpen) {
    return (
      <div className="absolute left-0 top-0 z-20 p-4">
        <Button
          onClick={onToggle}
          size="icon"
          variant="outline"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="absolute left-0 top-0 bottom-0 z-20 w-80 bg-background border-r shadow-lg flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h3 className="font-semibold flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Filters & Statistics
        </h3>
        <Button
          onClick={onToggle}
          size="icon"
          variant="ghost"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Filter Panel */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  Node Type Filter
                </CardTitle>
                {nodeTypeFilter !== "all" && (
                  <Button
                    onClick={handleClearFilters}
                    size="sm"
                    variant="ghost"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <button
                className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${
                  nodeTypeFilter === "all"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-muted"
                }`}
                onClick={() => onNodeTypeFilterChange("all")}
                type="button"
              >
                <span className="text-sm font-medium">All Types</span>
                <Badge variant="secondary">{stats.totalNodes}</Badge>
              </button>

              {Object.entries(stats.nodeTypeCounts).map(([type, count]) => (
                <button
                  className={`w-full flex items-center justify-between p-2 rounded-md transition-colors ${
                    nodeTypeFilter === type
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  key={type}
                  onClick={() => onNodeTypeFilterChange(type)}
                  type="button"
                >
                  <span className="text-sm font-medium capitalize">{type}</span>
                  <Badge variant="secondary">{count}</Badge>
                </button>
              ))}
            </CardContent>
          </Card>

          <Separator />

          {/* Statistics Panel */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Graph Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total Nodes</span>
                <span className="font-bold">{stats.totalNodes}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Total Relationships
                </span>
                <span className="font-bold">{stats.totalEdges}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Node Types</span>
                <span className="font-bold">
                  {Object.keys(stats.nodeTypeCounts).length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Relationship Types
                </span>
                <span className="font-bold">
                  {Object.keys(stats.relationshipTypeCounts).length}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Most Connected Nodes */}
          {stats.mostConnected.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Network className="h-4 w-4" />
                  Most Connected
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {stats.mostConnected.map(({ node, connections }) => (
                  <div
                    className="flex items-center justify-between p-2 rounded-md bg-muted/50 hover:bg-muted transition-colors cursor-pointer"
                    key={node.id}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {node.label}
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {node.type}
                      </p>
                    </div>
                    <Badge
                      className="ml-2"
                      variant="outline"
                    >
                      {connections}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

import type { IGraphData } from "@graph-mind/shared/validate/graph";
import { BookOpen, FileText, Lightbulb, Network, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface GraphLegendProps {
  graphData: IGraphData;
}

/**
 * Legend and statistics panel for the graph visualization
 */
export function GraphLegend({ graphData }: GraphLegendProps) {
  // Calculate statistics
  const nodesByType = graphData.nodes.reduce(
    (acc, node) => {
      acc[node.type] = (acc[node.type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const typeConfigs = [
    {
      type: "person",
      icon: User,
      color: "text-blue-600",
      bg: "bg-blue-50",
      label: "People",
    },
    {
      type: "document",
      icon: FileText,
      color: "text-green-600",
      bg: "bg-green-50",
      label: "Documents",
    },
    {
      type: "concept",
      icon: Lightbulb,
      color: "text-violet-600",
      bg: "bg-violet-50",
      label: "Concepts",
    },
    {
      type: "topic",
      icon: BookOpen,
      color: "text-amber-600",
      bg: "bg-amber-50",
      label: "Topics",
    },
  ];

  return (
    <Card className="shadow-lg">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Network className="h-4 w-4" />
          Graph Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total counts */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Nodes</p>
            <p className="text-2xl font-bold">{graphData.nodes.length}</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Edges</p>
            <p className="text-2xl font-bold">{graphData.edges.length}</p>
          </div>
        </div>

        <Separator />

        {/* Node types legend */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Node Types
          </p>
          <div className="space-y-2">
            {typeConfigs.map((config) => {
              const count = nodesByType[config.type] || 0;
              const Icon = config.icon;

              return (
                <div
                  className="flex items-center justify-between text-sm"
                  key={config.type}
                >
                  <div className="flex items-center gap-2">
                    <div className={`p-1.5 rounded ${config.bg}`}>
                      <Icon className={`h-3 w-3 ${config.color}`} />
                    </div>
                    <span className="font-medium">{config.label}</span>
                  </div>
                  <Badge
                    className="text-xs"
                    variant="secondary"
                  >
                    {count}
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>

        <Separator />

        {/* Edge types */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase">
            Relationships
          </p>
          <div className="space-y-1">
            {Array.from(new Set(graphData.edges.map((e) => e.type))).map(
              (type) => {
                const count = graphData.edges.filter(
                  (e) => e.type === type,
                ).length;
                return (
                  <div
                    className="flex items-center justify-between text-sm py-1"
                    key={type}
                  >
                    <span className="text-muted-foreground capitalize">
                      {type}
                    </span>
                    <Badge
                      className="text-xs"
                      variant="outline"
                    >
                      {count}
                    </Badge>
                  </div>
                );
              },
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import type { IGraphData, IGraphNode } from "@graph-mind/shared/validate/graph";
import {
  ArrowRight,
  BookOpen,
  Calendar,
  Copy,
  Edit,
  FileText,
  Lightbulb,
  Network,
  Tag,
  Trash2,
  User,
} from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface NodeDetailPanelProps {
  node: IGraphNode | null;
  graphData: IGraphData;
  open: boolean;
  onClose: () => void;
  onEdit?: (node: IGraphNode) => void;
  onDelete?: (node: IGraphNode) => void;
  onDuplicate?: (node: IGraphNode) => void;
}

/**
 * Enhanced side panel displaying detailed information about a selected node.
 *
 * Shows:
 * - Node label and type with icon
 * - Node properties in cards
 * - Connected nodes and their relationships
 */
export function NodeDetailPanel({
  node,
  graphData,
  open,
  onClose,
  onEdit,
  onDelete,
  onDuplicate,
}: NodeDetailPanelProps) {
  if (!node) return null;

  // Find all edges connected to this node
  const connectedEdges = graphData.edges.filter(
    (edge) => edge.source === node.id || edge.target === node.id,
  );

  // Group connections by relationship type
  const incomingConnections = connectedEdges.filter(
    (edge) => edge.target === node.id,
  );
  const outgoingConnections = connectedEdges.filter(
    (edge) => edge.source === node.id,
  );

  // Get node labels for connections
  const getNodeLabel = (nodeId: string) => {
    return graphData.nodes.find((n) => n.id === nodeId)?.label ?? nodeId;
  };

  // Node type configuration
  const getTypeConfig = (type: IGraphNode["type"]) => {
    switch (type) {
      case "person":
        return {
          icon: User,
          variant: "default" as const,
          color: "text-blue-600",
          bg: "bg-blue-50",
        };
      case "document":
        return {
          icon: FileText,
          variant: "secondary" as const,
          color: "text-green-600",
          bg: "bg-green-50",
        };
      case "concept":
        return {
          icon: Lightbulb,
          variant: "outline" as const,
          color: "text-violet-600",
          bg: "bg-violet-50",
        };
      case "topic":
        return {
          icon: BookOpen,
          variant: "default" as const,
          color: "text-amber-600",
          bg: "bg-amber-50",
        };
      default:
        return {
          icon: Tag,
          variant: "outline" as const,
          color: "text-slate-600",
          bg: "bg-slate-50",
        };
    }
  };

  const typeConfig = getTypeConfig(node.type);
  const TypeIcon = typeConfig.icon;

  return (
    <Sheet
      onOpenChange={onClose}
      open={open}
    >
      <SheetContent className="w-[400px] sm:w-[540px] p-0">
        <SheetHeader className="px-6 py-4 border-b">
          <div className="flex items-start gap-4">
            <Avatar className={`h-12 w-12 ${typeConfig.bg}`}>
              <AvatarFallback className={typeConfig.bg}>
                <TypeIcon className={`h-6 w-6 ${typeConfig.color}`} />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <SheetTitle className="text-xl font-bold truncate">
                {node.label}
              </SheetTitle>
              <Badge
                className="mt-2"
                variant={typeConfig.variant}
              >
                {node.type}
              </Badge>
            </div>
          </div>
        </SheetHeader>

        <Tabs
          className="flex-1 flex flex-col"
          defaultValue="overview"
        >
          <TabsList className="mx-6 mt-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="properties">Properties</TabsTrigger>
            <TabsTrigger value="connections">
              Connections
              <Badge
                className="ml-2"
                variant="secondary"
              >
                {connectedEdges.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 h-[calc(100vh-180px)]">
            {/* Overview Tab */}
            <TabsContent
              className="px-6 pb-6 space-y-4 mt-0"
              value="overview"
            >
              {/* Quick Actions */}
              <div className="flex gap-2 pt-4">
                <Button
                  className="flex-1"
                  onClick={() => onEdit?.(node)}
                  size="sm"
                  variant="outline"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => onDuplicate?.(node)}
                  size="sm"
                  variant="outline"
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </Button>
                <Button
                  onClick={() => onDelete?.(node)}
                  size="sm"
                  variant="outline"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>

              {/* Node Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Node Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">ID</span>
                    <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                      {node.id}
                    </code>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Type</span>
                    <Badge variant={typeConfig.variant}>{node.type}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Connections</span>
                    <span className="font-medium">{connectedEdges.length}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Key Properties Preview */}
              {Object.keys(node.properties).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Tag className="h-4 w-4" />
                      Key Properties
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    {Object.entries(node.properties)
                      .slice(0, 3)
                      .map(([key, value]) => (
                        <div
                          className="flex items-start justify-between gap-4 text-sm"
                          key={key}
                        >
                          <span className="text-muted-foreground font-medium capitalize">
                            {key}:
                          </span>
                          <span className="text-right font-mono text-xs bg-muted px-2 py-1 rounded max-w-[200px] truncate">
                            {String(value)}
                          </span>
                        </div>
                      ))}
                    {Object.keys(node.properties).length > 3 && (
                      <p className="text-xs text-muted-foreground text-center pt-2">
                        +{Object.keys(node.properties).length - 3} more in
                        Properties tab
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Properties Tab */}
            <TabsContent
              className="px-6 pb-6 space-y-4 mt-0"
              value="properties"
            >
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    All Properties
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {Object.keys(node.properties).length > 0 ? (
                    Object.entries(node.properties).map(([key, value]) => (
                      <div
                        className="flex items-start justify-between gap-4 text-sm border-b border-border/50 pb-3 last:border-0 last:pb-0"
                        key={key}
                      >
                        <span className="text-muted-foreground font-medium capitalize">
                          {key}:
                        </span>
                        <span className="text-right font-mono text-xs bg-muted px-2 py-1 rounded break-all max-w-[250px]">
                          {String(value)}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No properties defined
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Connections Tab */}
            <TabsContent
              className="px-6 pb-6 space-y-4 mt-0"
              value="connections"
            >
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Network className="h-4 w-4" />
                    All Connections
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Outgoing connections */}
                  {outgoingConnections.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                        Outgoing ({outgoingConnections.length})
                      </h5>
                      <div className="space-y-2">
                        {outgoingConnections.map((edge) => (
                          <div
                            className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm cursor-pointer"
                            key={edge.id}
                          >
                            <Badge
                              className="text-xs shrink-0"
                              variant="outline"
                            >
                              {edge.type}
                            </Badge>
                            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                            <span className="font-medium truncate">
                              {getNodeLabel(edge.target)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {outgoingConnections.length > 0 &&
                    incomingConnections.length > 0 && <Separator />}

                  {/* Incoming connections */}
                  {incomingConnections.length > 0 && (
                    <div>
                      <h5 className="text-xs font-semibold text-muted-foreground uppercase mb-3">
                        Incoming ({incomingConnections.length})
                      </h5>
                      <div className="space-y-2">
                        {incomingConnections.map((edge) => (
                          <div
                            className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 hover:bg-muted transition-colors text-sm cursor-pointer"
                            key={edge.id}
                          >
                            <span className="font-medium truncate">
                              {getNodeLabel(edge.source)}
                            </span>
                            <ArrowRight className="h-3 w-3 text-muted-foreground shrink-0" />
                            <Badge
                              className="text-xs shrink-0"
                              variant="outline"
                            >
                              {edge.type}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {connectedEdges.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No connections found
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent
              className="px-6 pb-6 space-y-4 mt-0"
              value="history"
            >
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Activity History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground text-center py-8">
                    History tracking coming soon
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}

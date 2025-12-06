import type { IGraphData, IGraphEdge } from "@graph-mind/shared/validate/graph";
import { ArrowRight, Plus, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddRelationshipDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  graphData: IGraphData;
  sourceNodeId?: string; // Pre-selected source node
  onSubmit?: (edge: Partial<IGraphEdge>) => void;
}

interface EdgeProperty {
  key: string;
  value: string;
}

const RELATIONSHIP_TYPES = [
  "related_to",
  "authored_by",
  "cites",
  "part_of",
  "references",
  "influences",
] as const;

/**
 * Dialog for creating a new relationship between nodes.
 * Allows user to select source and target nodes, relationship type, and properties.
 */
export function AddRelationshipDialog({
  open,
  onOpenChange,
  graphData,
  sourceNodeId,
  onSubmit,
}: AddRelationshipDialogProps) {
  const [sourceId, setSourceId] = useState(sourceNodeId || "");
  const [targetId, setTargetId] = useState("");
  const [relationshipType, setRelationshipType] =
    useState<IGraphEdge["type"]>("related_to");
  const [properties, setProperties] = useState<EdgeProperty[]>([]);

  const handleAddProperty = () => {
    setProperties([...properties, { key: "", value: "" }]);
  };

  const handleRemoveProperty = (index: number) => {
    setProperties(properties.filter((_, i) => i !== index));
  };

  const handlePropertyChange = (
    index: number,
    field: "key" | "value",
    value: string,
  ) => {
    const updated = [...properties];
    updated[index][field] = value;
    setProperties(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!sourceId) {
      toast.error("Source node is required");
      return;
    }
    if (!targetId) {
      toast.error("Target node is required");
      return;
    }
    if (sourceId === targetId) {
      toast.error("Source and target nodes must be different");
      return;
    }

    // Check for duplicate property keys
    const propertyKeys = properties.map((p) => p.key).filter((k) => k.trim());
    const uniqueKeys = new Set(propertyKeys);
    if (propertyKeys.length !== uniqueKeys.size) {
      toast.error("Property keys must be unique");
      return;
    }

    // Convert properties array to object
    const propertiesObj: Record<string, string> = {};
    for (const prop of properties) {
      if (prop.key.trim()) {
        propertiesObj[prop.key.trim()] = prop.value;
      }
    }

    // Generate ID
    const id = `edge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newEdge: Partial<IGraphEdge> = {
      id,
      source: sourceId,
      target: targetId,
      type: relationshipType,
      properties: propertiesObj,
    };

    onSubmit?.(newEdge);

    const sourceNode = graphData.nodes.find((n) => n.id === sourceId);
    const targetNode = graphData.nodes.find((n) => n.id === targetId);
    toast.success(
      `Relationship created: ${sourceNode?.label} → ${targetNode?.label}`,
    );

    // Reset form
    setSourceId(sourceNodeId || "");
    setTargetId("");
    setRelationshipType("related_to");
    setProperties([]);
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset form
    setSourceId(sourceNodeId || "");
    setTargetId("");
    setRelationshipType("related_to");
    setProperties([]);
    onOpenChange(false);
  };

  // Helper to get node label
  const getNodeLabel = (nodeId: string) => {
    const node = graphData.nodes.find((n) => n.id === nodeId);
    return node ? `${node.label} (${node.type})` : nodeId;
  };

  return (
    <Dialog
      onOpenChange={onOpenChange}
      open={open}
    >
      <DialogContent className="sm:max-w-[550px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add Relationship</DialogTitle>
            <DialogDescription>
              Create a new relationship between two nodes in your graph.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Source Node Selector */}
            <div className="space-y-2">
              <Label htmlFor="source">
                Source Node <span className="text-destructive">*</span>
              </Label>
              <Select
                onValueChange={setSourceId}
                value={sourceId}
              >
                <SelectTrigger id="source">
                  <SelectValue placeholder="Select source node" />
                </SelectTrigger>
                <SelectContent>
                  {graphData.nodes.map((node) => (
                    <SelectItem
                      key={node.id}
                      value={node.id}
                    >
                      <div className="flex items-center gap-2">
                        <Badge
                          className="text-xs"
                          variant="outline"
                        >
                          {node.type}
                        </Badge>
                        <span>{node.label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Relationship Type */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Relationship Type <span className="text-destructive">*</span>
              </Label>
              <Select
                onValueChange={(value) =>
                  setRelationshipType(value as IGraphEdge["type"])
                }
                value={relationshipType}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select relationship type" />
                </SelectTrigger>
                <SelectContent>
                  {RELATIONSHIP_TYPES.map((type) => (
                    <SelectItem
                      key={type}
                      value={type}
                    >
                      <span className="capitalize">
                        {type.replace(/_/g, " ")}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Target Node Selector */}
            <div className="space-y-2">
              <Label htmlFor="target">
                Target Node <span className="text-destructive">*</span>
              </Label>
              <Select
                onValueChange={setTargetId}
                value={targetId}
              >
                <SelectTrigger id="target">
                  <SelectValue placeholder="Select target node" />
                </SelectTrigger>
                <SelectContent>
                  {graphData.nodes
                    .filter((node) => node.id !== sourceId)
                    .map((node) => (
                      <SelectItem
                        key={node.id}
                        value={node.id}
                      >
                        <div className="flex items-center gap-2">
                          <Badge
                            className="text-xs"
                            variant="outline"
                          >
                            {node.type}
                          </Badge>
                          <span>{node.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>

            {/* Properties */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Properties (optional)</Label>
                <Button
                  onClick={handleAddProperty}
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Property
                </Button>
              </div>

              {properties.length > 0 && (
                <div className="space-y-2 max-h-32 overflow-y-auto border rounded-md p-3">
                  {properties.map((property, index) => (
                    <div
                      className="flex items-center gap-2"
                      key={index}
                    >
                      <Input
                        className="flex-1"
                        onChange={(e) =>
                          handlePropertyChange(index, "key", e.target.value)
                        }
                        placeholder="Key"
                        value={property.key}
                      />
                      <Input
                        className="flex-1"
                        onChange={(e) =>
                          handlePropertyChange(index, "value", e.target.value)
                        }
                        placeholder="Value"
                        value={property.value}
                      />
                      <Button
                        onClick={() => handleRemoveProperty(index)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Preview */}
            {sourceId && targetId && (
              <div className="border rounded-md p-3 bg-muted/50">
                <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium truncate max-w-[150px]">
                    {getNodeLabel(sourceId)}
                  </span>
                  <div className="flex items-center gap-1">
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    <Badge
                      className="text-xs"
                      variant="secondary"
                    >
                      {relationshipType.replace(/_/g, " ")}
                    </Badge>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="font-medium truncate max-w-[150px]">
                    {getNodeLabel(targetId)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              onClick={handleCancel}
              type="button"
              variant="outline"
            >
              Cancel
            </Button>
            <Button type="submit">Create Relationship</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

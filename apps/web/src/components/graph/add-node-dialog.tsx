import type { IGraphNode } from "@graph-mind/shared/validate/graph";
import { Plus, X } from "lucide-react";
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

interface AddNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (node: Partial<IGraphNode>) => void;
}

interface NodeProperty {
  key: string;
  value: string;
}

const NODE_TYPES = ["person", "document", "concept", "topic"] as const;

/**
 * Dialog for creating a new graph node.
 * Allows user to set label, type, and custom properties.
 */
export function AddNodeDialog({
  open,
  onOpenChange,
  onSubmit,
}: AddNodeDialogProps) {
  const [label, setLabel] = useState("");
  const [type, setType] = useState<IGraphNode["type"]>("concept");
  const [properties, setProperties] = useState<NodeProperty[]>([]);

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
    if (!label.trim()) {
      toast.error("Node label is required");
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

    // Generate ID (in real app, would be done by backend)
    const id = `node_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const newNode: Partial<IGraphNode> = {
      id,
      label: label.trim(),
      type,
      properties: propertiesObj,
    };

    onSubmit?.(newNode);
    toast.success(`Node "${label}" created successfully`);

    // Reset form
    setLabel("");
    setType("concept");
    setProperties([]);
    onOpenChange(false);
  };

  const handleCancel = () => {
    // Reset form
    setLabel("");
    setType("concept");
    setProperties([]);
    onOpenChange(false);
  };

  return (
    <Dialog
      onOpenChange={onOpenChange}
      open={open}
    >
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Add New Node</DialogTitle>
            <DialogDescription>
              Create a new node in your knowledge graph. All fields except
              properties are required.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Label field */}
            <div className="space-y-2">
              <Label htmlFor="label">
                Label <span className="text-destructive">*</span>
              </Label>
              <Input
                id="label"
                onChange={(e) => setLabel(e.target.value)}
                placeholder="e.g., Machine Learning"
                required
                value={label}
              />
            </div>

            {/* Type selector */}
            <div className="space-y-2">
              <Label htmlFor="type">
                Type <span className="text-destructive">*</span>
              </Label>
              <Select
                onValueChange={(value) => setType(value as IGraphNode["type"])}
                value={type}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select node type" />
                </SelectTrigger>
                <SelectContent>
                  {NODE_TYPES.map((nodeType) => (
                    <SelectItem
                      key={nodeType}
                      value={nodeType}
                    >
                      <span className="capitalize">{nodeType}</span>
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
                <div className="space-y-2 max-h-48 overflow-y-auto border rounded-md p-3">
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
              {properties.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  No properties added yet
                </p>
              )}
            </div>

            {/* Preview */}
            {label && (
              <div className="border rounded-md p-3 bg-muted/50">
                <p className="text-xs text-muted-foreground mb-2">Preview:</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">{type}</Badge>
                  <span className="font-medium">{label}</span>
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
            <Button type="submit">Create Node</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import type { IGraphData } from "@graph-mind/shared/validate/graph";
import { Link, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  extractNodeTypes,
  getNodeIcon,
  getNodeStyleConfig,
} from "@/lib/graph-utils";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  graphData: IGraphData;
  onNodeSelect: (nodeId: string) => void;
  onAddNode?: () => void;
  onAddRelationship?: () => void;
}

/**
 * Command Palette for universal search and quick actions
 * Dynamically discovers and displays node types from graph data
 * Keyboard shortcut: Cmd/Ctrl + K
 */
export function CommandPalette({
  open,
  onOpenChange,
  graphData,
  onNodeSelect,
  onAddNode,
  onAddRelationship,
}: CommandPaletteProps) {
  // Dynamically discover available node types
  const availableTypes = extractNodeTypes(graphData.nodes);
  const [search, setSearch] = useState("");

  // Filter nodes based on search query
  const filteredNodes = graphData.nodes.filter((node) => {
    const query = search.toLowerCase();
    return (
      node.label.toLowerCase().includes(query) ||
      node.type.toLowerCase().includes(query)
    );
  });

  // Reset search when dialog closes
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  const handleNodeSelect = (nodeId: string) => {
    onNodeSelect(nodeId);
    onOpenChange(false);
  };

  const handleAddNode = () => {
    onAddNode?.();
    onOpenChange(false);
  };

  const handleAddRelationship = () => {
    onAddRelationship?.();
    onOpenChange(false);
  };

  return (
    <CommandDialog
      onOpenChange={onOpenChange}
      open={open}
    >
      <CommandInput
        onValueChange={setSearch}
        placeholder="Search nodes or run a command..."
        value={search}
      />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        {/* Quick Actions */}
        <CommandGroup heading="Quick Actions">
          {onAddNode && (
            <CommandItem onSelect={handleAddNode}>
              <Plus className="mr-2 h-4 w-4" />
              <span>Add New Node</span>
            </CommandItem>
          )}
          {onAddRelationship && (
            <CommandItem onSelect={handleAddRelationship}>
              <Link className="mr-2 h-4 w-4" />
              <span>Add Relationship</span>
            </CommandItem>
          )}
        </CommandGroup>

        <CommandSeparator />

        {/* Search Results */}
        {search && filteredNodes.length > 0 && (
          <CommandGroup heading={`Nodes (${filteredNodes.length})`}>
            {filteredNodes.slice(0, 10).map((node) => {
              const Icon = getNodeIcon(node.type);
              return (
                <CommandItem
                  key={node.id}
                  onSelect={() => handleNodeSelect(node.id)}
                  value={`${node.label} ${node.type}`}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <div className="flex flex-col">
                    <span>{node.label}</span>
                    <span className="text-xs text-muted-foreground capitalize">
                      {node.type}
                    </span>
                  </div>
                </CommandItem>
              );
            })}
            {filteredNodes.length > 10 && (
              <CommandItem disabled>
                <span className="text-xs text-muted-foreground">
                  +{filteredNodes.length - 10} more results...
                </span>
              </CommandItem>
            )}
          </CommandGroup>
        )}

        {/* Browse by Type (when no search) - Dynamically generated */}
        {!search && availableTypes.length > 0 && (
          <CommandGroup heading="Browse by Type">
            {availableTypes.map((type) => {
              const config = getNodeStyleConfig(type);
              const Icon = config.icon;
              return (
                <CommandItem
                  key={type}
                  onSelect={() => setSearch(type)}
                >
                  <Icon className="mr-2 h-4 w-4" />
                  <span>{config.label}</span>
                </CommandItem>
              );
            })}
          </CommandGroup>
        )}
      </CommandList>
    </CommandDialog>
  );
}

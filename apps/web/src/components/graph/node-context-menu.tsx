import type { IGraphNode } from "@graph-mind/shared/validate/graph";
import { Copy, Edit, Eye, Link, Network, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface NodeContextMenuProps {
  node: IGraphNode;
  children: ReactNode;
  onViewDetails?: (node: IGraphNode) => void;
  onEdit?: (node: IGraphNode) => void;
  onAddRelationship?: (node: IGraphNode) => void;
  onDuplicate?: (node: IGraphNode) => void;
  onDelete?: (node: IGraphNode) => void;
  onExpandConnections?: (node: IGraphNode) => void;
}

/**
 * Context menu wrapper for graph nodes.
 * Right-click on a node to access actions.
 */
export function NodeContextMenu({
  node,
  children,
  onViewDetails,
  onEdit,
  onAddRelationship,
  onDuplicate,
  onDelete,
  onExpandConnections,
}: NodeContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={() => onViewDetails?.(node)}>
          <Eye />
          View Details
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onEdit?.(node)}>
          <Edit />
          Edit Properties
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onAddRelationship?.(node)}>
          <Link />
          Add Relationship
        </ContextMenuItem>
        <ContextMenuItem onClick={() => onExpandConnections?.(node)}>
          <Network />
          Expand Connections
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={() => onDuplicate?.(node)}>
          <Copy />
          Duplicate Node
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem
          onClick={() => onDelete?.(node)}
          variant="destructive"
        >
          <Trash2 />
          Delete Node
          <ContextMenuShortcut>⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

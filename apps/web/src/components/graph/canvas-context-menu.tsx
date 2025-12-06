import { Download, Maximize, Plus, Settings } from "lucide-react";
import type { ReactNode } from "react";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger,
} from "@/components/ui/context-menu";

interface CanvasContextMenuProps {
  children: ReactNode;
  onAddNode?: () => void;
  onFitToScreen?: () => void;
  onExport?: () => void;
  onSettings?: () => void;
}

/**
 * Context menu for the graph canvas background.
 * Right-click on empty space to access global actions.
 */
export function CanvasContextMenu({
  children,
  onAddNode,
  onFitToScreen,
  onExport,
  onSettings,
}: CanvasContextMenuProps) {
  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>{children}</ContextMenuTrigger>
      <ContextMenuContent className="w-56">
        <ContextMenuItem onClick={onAddNode}>
          <Plus />
          Add New Node
          <ContextMenuShortcut>⌘N</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onFitToScreen}>
          <Maximize />
          Fit to Screen
        </ContextMenuItem>
        <ContextMenuItem onClick={onExport}>
          <Download />
          Export View
          <ContextMenuShortcut>⌘E</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem onClick={onSettings}>
          <Settings />
          Graph Settings
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}

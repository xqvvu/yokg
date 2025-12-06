import {
  Camera,
  Download,
  LayoutGrid,
  Maximize,
  Plus,
  RotateCcw,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface FloatingActionMenuProps {
  onAddNode?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onResetZoom?: () => void;
  onFitToScreen?: () => void;
  onExport?: () => void;
}

/**
 * Floating Action Menu (FAB) for quick graph actions.
 * Primary action: Add Node
 * Secondary actions: Zoom controls, layout options, export
 */
export function FloatingActionMenu({
  onAddNode,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen,
  onExport,
}: FloatingActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <TooltipProvider>
      <div className="flex flex-col items-center gap-2">
        {/* Secondary Actions Menu */}
        <div
          className={`flex flex-col gap-2 transition-all duration-300 ${
            isOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 pointer-events-none"
          }`}
        >
          {/* Zoom Controls */}
          <div className="flex flex-col gap-2 bg-background border rounded-lg shadow-lg p-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onZoomIn}
                  size="icon"
                  variant="ghost"
                >
                  <ZoomIn className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Zoom In</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onZoomOut}
                  size="icon"
                  variant="ghost"
                >
                  <ZoomOut className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Zoom Out</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onFitToScreen}
                  size="icon"
                  variant="ghost"
                >
                  <Maximize className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Fit to Screen</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onResetZoom}
                  size="icon"
                  variant="ghost"
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">Reset Zoom</TooltipContent>
            </Tooltip>
          </div>

          {/* Additional Actions */}
          <DropdownMenu>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenuTrigger asChild>
                  <Button
                    className="h-12 w-12 rounded-full shadow-lg"
                    size="icon"
                    variant="outline"
                  >
                    <LayoutGrid className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
              </TooltipTrigger>
              <TooltipContent side="left">More Actions</TooltipContent>
            </Tooltip>
            <DropdownMenuContent
              align="end"
              side="left"
            >
              <DropdownMenuItem onClick={onExport}>
                <Download className="mr-2 h-4 w-4" />
                Export Graph
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => alert("Screenshot coming soon")}>
                <Camera className="mr-2 h-4 w-4" />
                Take Screenshot
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => alert("Layout options coming soon")}
              >
                <LayoutGrid className="mr-2 h-4 w-4" />
                Change Layout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Primary FAB - Add Node */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              className="h-14 w-14 rounded-full shadow-xl hover:shadow-2xl transition-all"
              onClick={() => {
                if (isOpen) {
                  setIsOpen(false);
                  // Small delay to allow menu to close before opening add node
                  setTimeout(() => onAddNode?.(), 150);
                } else {
                  setIsOpen(!isOpen);
                }
              }}
              size="icon"
            >
              <Plus
                className={`h-6 w-6 transition-transform ${
                  isOpen ? "rotate-45" : "rotate-0"
                }`}
              />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">
            {isOpen ? "Close Menu" : "Quick Actions"}
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

import { Locate, Maximize2, ZoomIn, ZoomOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GraphControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  onFitToScreen?: () => void;
}

/**
 * Enhanced floating control panel for graph zoom and pan operations.
 *
 * Provides controls for:
 * - Zoom In/Out: Adjust zoom level
 * - Reset View: Return to default position
 * - Fit to Screen: Auto-fit all nodes
 */
export function GraphControls({
  onZoomIn,
  onZoomOut,
  onResetZoom,
  onFitToScreen,
}: GraphControlsProps) {
  return (
    <TooltipProvider>
      <Card className="shadow-lg">
        <div className="flex flex-col gap-1 p-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="h-9 w-9"
                onClick={onZoomIn}
                size="icon"
                type="button"
                variant="ghost"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Zoom In</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="h-9 w-9"
                onClick={onZoomOut}
                size="icon"
                type="button"
                variant="ghost"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Zoom Out</p>
            </TooltipContent>
          </Tooltip>

          <Separator className="my-1" />

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                className="h-9 w-9"
                onClick={onResetZoom}
                size="icon"
                type="button"
                variant="ghost"
              >
                <Locate className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Reset View</p>
            </TooltipContent>
          </Tooltip>

          {onFitToScreen && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="h-9 w-9"
                  onClick={onFitToScreen}
                  size="icon"
                  type="button"
                  variant="ghost"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">
                <p>Fit to Screen</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </Card>
    </TooltipProvider>
  );
}

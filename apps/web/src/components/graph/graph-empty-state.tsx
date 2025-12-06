import { Network, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface GraphEmptyStateProps {
  onAddNode?: () => void;
}

/**
 * Empty state displayed when no graph data exists
 * Provides clear call-to-action to create first node
 */
export function GraphEmptyState({ onAddNode }: GraphEmptyStateProps) {
  return (
    <div className="flex items-center justify-center h-full p-8">
      <Card className="w-full max-w-md border-dashed">
        <CardContent className="flex flex-col items-center justify-center text-center p-12">
          <div className="rounded-full bg-muted p-4 mb-4">
            <Network className="h-12 w-12 text-muted-foreground" />
          </div>

          <h2 className="text-2xl font-semibold tracking-tight mb-2">
            No graph data yet
          </h2>

          <p className="text-muted-foreground mb-6 max-w-sm">
            Create your first node to start building your knowledge graph and
            visualize connections between ideas.
          </p>

          {onAddNode && (
            <Button
              className="gap-2"
              onClick={onAddNode}
            >
              <Plus className="h-4 w-4" />
              Create First Node
            </Button>
          )}

          <p className="text-xs text-muted-foreground mt-4">
            Tip: Use ⌘K to open the command palette anytime
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

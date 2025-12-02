import { Download, Filter, Info, Search, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface GraphToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  nodeTypeFilter: string;
  onNodeTypeFilterChange: (type: string) => void;
  onExport?: () => void;
  onShare?: () => void;
  onInfo?: () => void;
}

/**
 * Top toolbar for graph page with search and filter controls
 */
export function GraphToolbar({
  searchQuery,
  onSearchChange,
  nodeTypeFilter,
  onNodeTypeFilterChange,
  onExport,
  onShare,
  onInfo,
}: GraphToolbarProps) {
  return (
    <TooltipProvider>
      <div className="flex items-center gap-3 p-4 bg-background border-b">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            className="pl-9"
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search nodes..."
            type="search"
            value={searchQuery}
          />
        </div>

        {/* Filter by node type */}
        <Select
          onValueChange={onNodeTypeFilterChange}
          value={nodeTypeFilter}
        >
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="person">Person</SelectItem>
            <SelectItem value="document">Document</SelectItem>
            <SelectItem value="concept">Concept</SelectItem>
            <SelectItem value="topic">Topic</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-1 ml-auto">
          {onExport && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onExport}
                  size="icon"
                  variant="ghost"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export Graph</p>
              </TooltipContent>
            </Tooltip>
          )}

          {onShare && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onShare}
                  size="icon"
                  variant="ghost"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share</p>
              </TooltipContent>
            </Tooltip>
          )}

          {onInfo && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onInfo}
                  size="icon"
                  variant="ghost"
                >
                  <Info className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Graph Info</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </div>
    </TooltipProvider>
  );
}

import type { IGraphNode } from "@graph-mind/shared/validate/graph";
import {
  Command,
  Download,
  Filter,
  Info,
  Plus,
  Search,
  Settings,
  Share2,
} from "lucide-react";
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
import { extractNodeTypes } from "@/lib/graph-utils";

interface GraphToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  nodeTypeFilter: string;
  onNodeTypeFilterChange: (type: string) => void;
  nodes: IGraphNode[]; // Add nodes prop for dynamic type discovery
  onOpenCommandPalette?: () => void;
  onAddNode?: () => void;
  onSettings?: () => void;
  onExport?: () => void;
  onShare?: () => void;
  onInfo?: () => void;
}

/**
 * Enhanced top toolbar for graph page with search, filters, and actions
 * Dynamically generates type filter options from graph data
 */
export function GraphToolbar({
  searchQuery,
  onSearchChange,
  nodeTypeFilter,
  onNodeTypeFilterChange,
  nodes,
  onOpenCommandPalette,
  onAddNode,
  onSettings,
  onExport,
  onShare,
  onInfo,
}: GraphToolbarProps) {
  // Dynamically discover available node types
  const availableTypes = extractNodeTypes(nodes);
  return (
    <TooltipProvider>
      <div className="flex items-center gap-4 px-6 py-3 bg-background border-b shadow-sm">
        {/* Left Section: Title and Command Palette Trigger */}
        <div className="flex items-center gap-3">
          <h1 className="text-lg font-semibold text-foreground hidden sm:block">
            Knowledge Graph
          </h1>
          {onOpenCommandPalette && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="gap-2"
                  onClick={onOpenCommandPalette}
                  size="sm"
                  variant="outline"
                >
                  <Command className="h-4 w-4" />
                  <span className="hidden md:inline">Search</span>
                  <kbd className="hidden md:inline pointer-events-none h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                    <span className="text-xs">⌘</span>K
                  </kbd>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open Command Palette (⌘K)</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Center Section: Search and Filter */}
        <div className="flex items-center gap-2 flex-1 max-w-2xl">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-9 h-9"
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search nodes by name or type..."
              type="search"
              value={searchQuery}
            />
          </div>

          <Select
            onValueChange={onNodeTypeFilterChange}
            value={nodeTypeFilter}
          >
            <SelectTrigger className="w-[160px] h-9">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {availableTypes.map((type) => (
                <SelectItem
                  className="capitalize"
                  key={type}
                  value={type}
                >
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Right Section: Action Buttons */}
        <div className="flex items-center gap-1 ml-auto">
          {onAddNode && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  className="gap-2"
                  onClick={onAddNode}
                  size="sm"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden lg:inline">Add Node</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Add New Node</p>
              </TooltipContent>
            </Tooltip>
          )}

          {onSettings && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onSettings}
                  size="sm"
                  variant="ghost"
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Graph Settings</p>
              </TooltipContent>
            </Tooltip>
          )}

          {onExport && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onExport}
                  size="sm"
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
                  size="sm"
                  variant="ghost"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Share Graph</p>
              </TooltipContent>
            </Tooltip>
          )}

          {onInfo && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={onInfo}
                  size="sm"
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

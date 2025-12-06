# Change: Dynamic Node Type Discovery in Frontend UI

## Why
The backend schema was recently refactored to support arbitrary node labels and relationship types (removing hardcoded Person/Document/Concept/Topic constraints). However, the frontend UI components still hardcode these four types in filters, legends, command palettes, and icons. This creates a UX gap where new node types work in the backend but appear with default styling and are excluded from type-based navigation in the UI.

## What Changes
- **Frontend components** will dynamically discover node and relationship types from actual graph data
- **Graph legend** will show all node types present in the current graph (not just the four predefined types)
- **Graph toolbar filter** will populate available types from actual data
- **Command palette** "Browse by Type" section will be data-driven
- **Icon/color mapping** will use a fallback system for unknown types instead of only supporting four types
- Type statistics and counts will work for any type discovered in the data

## Impact
- Affected specs: `graph-visualization`
- Affected code:
  - `apps/web/src/components/graph/graph-legend.tsx` - Dynamic type discovery and display
  - `apps/web/src/components/graph/graph-toolbar.tsx` - Dynamic filter options
  - `apps/web/src/components/graph/command-palette.tsx` - Dynamic type browsing
  - `apps/web/src/lib/graph-utils.ts` (new) - Shared utilities for type discovery and styling
- Benefits:
  - Seamless support for any custom node types without frontend code changes
  - Better UX consistency between backend capabilities and frontend presentation
  - Future-proof: graph can evolve with new domains (projects, events, locations, etc.)

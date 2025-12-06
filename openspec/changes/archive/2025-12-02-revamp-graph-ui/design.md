# Design Document: Graph UI Revamp

## Architecture Overview

This document outlines the technical architecture and design decisions for the comprehensive graph UI redesign.

## Component Hierarchy

```
/graph (route)
└── GraphPage
    ├── GraphPageHeader
    │   ├── Breadcrumb (shadcn/ui)
    │   ├── SearchWithFilters
    │   │   ├── Input (shadcn/ui)
    │   │   └── DropdownMenu (shadcn/ui) - Advanced filters
    │   └── ActionButtons
    │       ├── Button (Add Node, Settings, Export, Share)
    │       └── Tooltip (shadcn/ui)
    │
    ├── GraphPageLayout
    │   ├── GraphSidebar (collapsible)
    │   │   ├── Sheet (shadcn/ui variant or custom)
    │   │   ├── FilterPanel
    │   │   │   ├── Checkbox groups (node types, relationships)
    │   │   │   ├── Slider (property ranges)
    │   │   │   └── Button (Clear filters)
    │   │   ├── StatisticsPanel
    │   │   │   ├── Card (shadcn/ui)
    │   │   │   ├── Badge (counts)
    │   │   │   └── Progress bars or charts
    │   │   └── MinimapPanel (optional)
    │   │       └── Mini canvas with viewport indicator
    │   │
    │   ├── GraphCanvasContainer
    │   │   ├── GraphCanvas (existing, enhanced)
    │   │   │   ├── SVG with zoom/pan
    │   │   │   ├── GraphNode components
    │   │   │   └── GraphEdge components
    │   │   ├── NodeContextMenu (shadcn/ui)
    │   │   ├── CanvasContextMenu (shadcn/ui)
    │   │   ├── SelectionRectangle (new)
    │   │   └── Tooltip (hover tooltips)
    │   │
    │   └── FloatingActionMenu
    │       ├── Button (primary FAB)
    │       └── DropdownMenu (secondary actions)
    │
    ├── NodeDetailSheet (enhanced)
    │   ├── Sheet (shadcn/ui)
    │   ├── SheetHeader with Avatar
    │   ├── Tabs (shadcn/ui)
    │   │   ├── Overview tab
    │   │   ├── Properties tab (with Form)
    │   │   ├── Connections tab
    │   │   └── History tab (placeholder)
    │   └── Button (Edit, Delete, Duplicate)
    │
    ├── CommandPalette (new)
    │   ├── Command (shadcn/ui)
    │   ├── CommandInput
    │   ├── CommandList
    │   │   ├── CommandGroup (Search results)
    │   │   ├── CommandGroup (Quick actions)
    │   │   └── CommandGroup (Recent items)
    │   └── CommandItem
    │
    ├── Dialogs (shadcn/ui Dialog)
    │   ├── AddNodeDialog
    │   │   └── Form (label, type, properties)
    │   ├── AddRelationshipDialog
    │   │   └── Form (source, type, target)
    │   ├── GraphSettingsDialog
    │   │   └── Tabs (Layout, Display, Performance)
    │   ├── ExportDialog
    │   │   └── Form (format, scope, options)
    │   ├── ShareDialog (placeholder)
    │   └── KeyboardShortcutsDialog
    │
    └── ToastProvider (Sonner)
        └── Toast notifications
```

## State Management Strategy

### Local Component State (React useState)

- **GraphPage**:
  - `selectedNodeIds: string[]` - Currently selected nodes
  - `isSidebarOpen: boolean` - Sidebar visibility
  - `viewMode: 'graph' | 'list' | 'table'` - Current view mode

- **GraphCanvas**:
  - `hoveredNodeId: string | null` - Node currently being hovered
  - `isDraggingSelection: boolean` - Selection rectangle drag state
  - `selectionRect: { x, y, width, height } | null`

- **CommandPalette**:
  - `isOpen: boolean` - Palette visibility
  - `searchQuery: string` - Search input value
  - `selectedIndex: number` - Keyboard navigation index

### Context API (for cross-component state)

Consider creating a `GraphContext` for shared state:

```typescript
type GraphContextValue = {
  graphData: IGraphData;
  selectedNodeIds: string[];
  filters: GraphFilters;
  settings: GraphSettings;

  // Actions
  selectNode: (id: string) => void;
  deselectNode: (id: string) => void;
  updateFilters: (filters: Partial<GraphFilters>) => void;
  createNode: (node: Omit<IGraphNode, 'id'>) => Promise<void>;
  updateNode: (id: string, updates: Partial<IGraphNode>) => Promise<void>;
  deleteNode: (id: string) => Promise<void>;
  createRelationship: (edge: Omit<IGraphEdge, 'id'>) => Promise<void>;
  deleteRelationship: (id: string) => Promise<void>;
};
```

This avoids prop drilling and makes state accessible to deeply nested components.

### TanStack Query for Server State

Once backend APIs are available, use TanStack Query for:
- Fetching graph data
- Optimistic updates for CRUD operations
- Caching and invalidation

```typescript
const { data: graphData, isLoading } = useQuery({
  queryKey: ['graph', graphId],
  queryFn: () => fetchGraphData(graphId),
});

const createNodeMutation = useMutation({
  mutationFn: createNode,
  onSuccess: () => {
    queryClient.invalidateQueries(['graph', graphId]);
    toast.success('Node created');
  },
});
```

## Responsive Design Strategy

### Breakpoints (Tailwind)
- `sm`: 640px - Mobile landscape
- `md`: 768px - Tablet
- `lg`: 1024px - Desktop
- `xl`: 1280px - Large desktop

### Layout Adaptations

**Mobile (< 768px)**:
- Sidebar collapsed by default, full-screen overlay when open
- Toolbar: Hamburger menu for actions, search icon only (expands on tap)
- Floating action menu: Only primary FAB visible
- Node detail sheet: Full-screen overlay
- Command palette: Full-screen

**Tablet (768px - 1024px)**:
- Sidebar: Collapsible, 320px when open
- Toolbar: Full layout with smaller buttons
- Floating action menu: Visible with tooltip labels

**Desktop (> 1024px)**:
- Sidebar: Open by default, 400px wide
- Toolbar: Full layout with labels
- All features visible and accessible

### Canvas Responsiveness

Replace fixed `width` and `height` props with container-based sizing:

```typescript
const GraphCanvas = ({ data, onNodeSelect }: GraphCanvasProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect;
      setDimensions({ width, height });
    });

    resizeObserver.observe(containerRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg width={dimensions.width} height={dimensions.height}>
        {/* graph content */}
      </svg>
    </div>
  );
};
```

## Keyboard Navigation Architecture

### Global Keyboard Handler

Create a `useKeyboardShortcuts` hook:

```typescript
const useKeyboardShortcuts = (options: {
  onOpenCommandPalette: () => void;
  onDeleteSelected: () => void;
  onCreateNode: () => void;
  onFocusSearch: () => void;
  // ... other handlers
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Cmd/Ctrl + K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        options.onOpenCommandPalette();
      }

      // Delete / Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        options.onDeleteSelected();
      }

      // Cmd/Ctrl + N
      if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
        e.preventDefault();
        options.onCreateNode();
      }

      // Escape
      if (e.key === 'Escape') {
        // Close topmost dialog/sheet/menu
        // This can be handled by shadcn components automatically
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [options]);
};
```

### Focus Management

- When dialogs open, focus first input field
- When dialogs close, return focus to triggering element
- Tab order should be logical: toolbar → sidebar → canvas → FAB
- Skip invisible elements (collapsed sidebar panels)

## Animation Strategy

### Transition Principles

1. **Fast feedback**: Immediate visual response (< 100ms)
2. **Smooth transitions**: 200-300ms for UI changes
3. **Purposeful motion**: Animations should communicate relationships or changes

### Key Animations

**Sidebar collapse/expand**:
```css
transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
```

**Node selection**:
```css
transition: stroke-width 150ms ease-out, filter 150ms ease-out;
```

**Dialog appearance**:
```css
@keyframes dialog-enter {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}
animation: dialog-enter 200ms ease-out;
```

**Toast notifications** (using Sonner defaults):
- Slide in from top-right: 200ms
- Auto-dismiss after 3s (success) or manual (error)

### Canvas Performance

For smooth 60fps rendering with D3 simulation:

```typescript
// Throttle React re-renders to 60fps (16.67ms)
const useThrottledSimulation = (simulation: d3.Simulation) => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  useEffect(() => {
    let rafId: number;

    const tick = () => {
      forceUpdate();
      rafId = requestAnimationFrame(tick);
    };

    simulation.on('tick', () => {
      // Only schedule update, don't force immediately
    });

    rafId = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId);
      simulation.on('tick', null);
    };
  }, [simulation]);
};
```

For large graphs (> 500 nodes), consider:
- Canvas rendering instead of SVG
- Level-of-detail (LOD): Hide labels when zoomed out
- Culling: Only render nodes in viewport

## Accessibility Considerations

### ARIA Labels

- Graph canvas: `role="img"` with `aria-label="Knowledge graph visualization"`
- Nodes: `role="button"` with `aria-label="[Node type]: [Node label]"`
- Edges: Not focusable, described via node connections

### Keyboard Navigation in Canvas

Make canvas keyboard-navigable:

```typescript
const [focusedNodeIndex, setFocusedNodeIndex] = useState<number>(-1);

const handleCanvasKeyDown = (e: KeyboardEvent) => {
  if (e.key === 'Tab') {
    e.preventDefault();
    const nextIndex = (focusedNodeIndex + 1) % nodes.length;
    setFocusedNodeIndex(nextIndex);
    // Apply focus styling to nodes[nextIndex]
  }

  if (e.key === 'Enter' && focusedNodeIndex >= 0) {
    // Open detail sheet for focused node
    onNodeSelect(nodes[focusedNodeIndex].id);
  }
};
```

### Color Contrast

Ensure WCAG AA compliance:
- Node colors: Contrast ratio ≥ 4.5:1 against white background
- Text labels: Use dark text or add white outline for visibility
- Interactive elements: Clear focus indicators (2px outline)

### Screen Reader Support

- Announce dynamic changes via `aria-live` regions:
  - "Node created: [label]"
  - "Filter applied: Showing 15 nodes"
- Provide text alternatives for visual information:
  - Statistics panel should be readable without charts
  - Graph structure described in node detail connections

## Performance Optimization

### Bundle Size

**New dependencies** (estimate):
- `cmdk` (Command palette): ~15KB gzipped
- Additional shadcn components: ~5KB gzipped
- Total increase: ~20KB gzipped

**Code splitting**:
```typescript
// Lazy load heavy dialogs
const AddNodeDialog = lazy(() => import('./add-node-dialog'));
const GraphSettingsDialog = lazy(() => import('./graph-settings-dialog'));
```

### Render Optimization

**Memoization**:
```typescript
const MemoizedGraphNode = memo(GraphNode, (prev, next) => {
  return (
    prev.node.id === next.node.id &&
    prev.isSelected === next.isSelected &&
    prev.node.x === next.node.x &&
    prev.node.y === next.node.y
  );
});
```

**Virtualization** (for List view):
```typescript
import { useVirtualizer } from '@tanstack/react-virtual';

const virtualizer = useVirtualizer({
  count: nodes.length,
  getScrollElement: () => containerRef.current,
  estimateSize: () => 60, // row height
});
```

### LocalStorage Strategy

Store preferences efficiently:

```typescript
const STORAGE_KEYS = {
  graphSettings: (graphId: string) => `graph-settings-${graphId}`,
  sidebarState: 'graph-sidebar-open',
  recentNodes: 'graph-recent-nodes',
  commandHistory: 'graph-command-history',
};

// Debounce writes to localStorage
const useDebouncedLocalStorage = (key: string, value: any, delay = 500) => {
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(key, JSON.stringify(value));
    }, delay);

    return () => clearTimeout(timeoutId);
  }, [key, value, delay]);
};
```

## Error Handling

### Graceful Degradation

If certain features fail:
- **Command palette fails to load**: Fallback to toolbar search
- **D3 simulation crashes**: Show static positioned graph
- **LocalStorage quota exceeded**: Warn user, continue without persistence

### Error Boundaries

Wrap major sections in error boundaries:

```typescript
<ErrorBoundary fallback={<GraphErrorState />}>
  <GraphCanvas data={graphData} />
</ErrorBoundary>
```

### User-Facing Errors

Use toast notifications for all errors with actionable messages:
- ❌ "Failed to create node: Label is required"
- ❌ "Connection error: Unable to save changes. Retry?"
- ❌ "Export failed: Browser does not support file downloads"

## Testing Strategy

### Component Testing (Vitest + React Testing Library)

Test critical interactions:
```typescript
describe('NodeContextMenu', () => {
  it('should open on right-click', () => {
    const { getByRole } = render(<GraphCanvas data={mockData} />);
    const node = getByRole('button', { name: /Node 1/ });

    fireEvent.contextMenu(node);

    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Delete Node')).toBeInTheDocument();
  });
});
```

### Integration Testing

Test full user flows:
- Create node → View in graph → Edit properties → Save → Verify update
- Search node → Select from results → Open detail sheet → Delete → Confirm

### Visual Regression Testing (Optional)

Use tools like Percy or Chromatic to catch visual regressions in UI components.

## Migration Path

### Phase 1: Non-Breaking Additions
- Add new components alongside existing ones
- Feature flag new UI elements
- Run both old and new in parallel

### Phase 2: Incremental Replacement
- Replace components one by one
- Maintain backward compatibility
- Test each replacement thoroughly

### Phase 3: Cleanup
- Remove old components
- Update types and interfaces
- Final polish and optimization

## Open Technical Questions

1. **Canvas vs SVG for large graphs**: When to switch from SVG to Canvas rendering?
   - **Proposal**: Use SVG for < 500 nodes, Canvas for ≥ 500 nodes

2. **State management library**: Do we need Zustand/Jotai or is Context enough?
   - **Proposal**: Start with Context + TanStack Query, add Zustand only if complexity grows

3. **Command palette library**: Use `cmdk` or build custom?
   - **Proposal**: Use `cmdk` (shadcn's Command is built on it)

4. **Minimap implementation**: Canvas-based or SVG-based?
   - **Proposal**: Use Canvas for performance, update on zoom/pan debounced

5. **Undo/redo implementation**: Local state or external library?
   - **Proposal**: Simple local stack for now (max 10 history items)

## Success Metrics

### Performance Targets
- Initial page load: < 2s
- Command palette open time: < 100ms
- Graph interaction (pan/zoom): 60fps
- Node creation: < 500ms from submit to visible

### Accessibility Targets
- Lighthouse accessibility score: ≥ 95
- Keyboard navigation: All features accessible
- Screen reader: All actions announced

### User Experience Targets
- Task completion rate: > 90% for common flows
- User satisfaction: Subjective improvement (based on user feedback)

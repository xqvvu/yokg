# Proposal: Revamp Graph UI with Enhanced shadcn/ui Design

## Overview

This proposal aims to comprehensively redesign the graph visualization page (`/graph`) with enhanced shadcn/ui components and improved interaction patterns. The current implementation has basic functionality but suffers from scattered controls, poor visual hierarchy, and limited user actions. This change will create a polished, intuitive, and feature-rich graph exploration experience.

## Why

### Current Problems

1. **Scattered UI Elements**: Controls are placed in multiple locations (top toolbar, floating bottom-left legend, floating bottom-right zoom controls), making the interface feel disorganized
2. **Limited Interactivity**: Users can only view and select nodes - no ability to add, edit, or delete graph elements
3. **Poor Visual Feedback**: Minimal hover effects, no loading states, no contextual actions
4. **Inconsistent Design Language**: Mix of custom styles without full shadcn/ui component integration
5. **Lack of Keyboard Shortcuts**: No power-user features for efficient navigation
6. **Mobile Unfriendly**: Fixed canvas dimensions don't adapt well to smaller screens

### User Pain Points

Based on user feedback, the main issues are:
- **All use cases needed**: browsing/exploration, search/filtering, creation/editing, and relationship analysis
- **UI is cluttered and not aesthetically pleasing**: current design feels unpolished
- **Workflow is not smooth**: transitions between actions feel clunky

### Expected Benefits

- **Professional appearance**: Modern, cohesive design using shadcn/ui throughout
- **Improved discoverability**: All features accessible from intuitive locations
- **Enhanced productivity**: Quick actions, keyboard shortcuts, contextual menus
- **Better information architecture**: Clearer visual hierarchy and grouping
- **Smooth interactions**: Animated transitions, instant feedback, responsive design

## What

### Core Changes

#### 1. Unified Command Palette (NEW)
- Add shadcn/ui `Command` component for universal search and actions
- Keyboard shortcut: `Cmd/Ctrl + K` to open
- Features:
  - Search nodes by name/type
  - Quick actions (add node, create relationship, export, share)
  - Filter presets
  - Recent items
  - Keyboard navigation

#### 2. Enhanced Top Toolbar
- **Left section**: Logo/title, breadcrumb navigation
- **Center section**: Integrated search bar with advanced filters (dropdown)
- **Right section**: Action buttons (Add Node, Settings, Export, Share)
- Use shadcn/ui `DropdownMenu` for advanced filter options
- Add loading indicator when fetching graph data

#### 3. Context Menu System (NEW)
- Right-click on nodes → Context menu with actions:
  - View Details
  - Edit Properties
  - Add Relationship
  - Duplicate Node
  - Delete Node
  - Expand Connections (show more related nodes)
- Right-click on canvas → Background menu:
  - Add New Node
  - Fit to Screen
  - Export View
  - Graph Settings
- Implement with shadcn/ui `ContextMenu` component

#### 4. Improved Node Detail Panel
- Keep shadcn/ui `Sheet` component but enhance content:
  - Add tabs for: Overview, Properties, Connections, History
  - Editable fields with inline form validation
  - Quick action buttons: Edit, Delete, Duplicate
  - Relationship graph mini-view showing direct connections
  - Use shadcn/ui `Tabs`, `Form`, `Badge`, `Avatar` components

#### 5. Smart Sidebar (NEW)
- Collapsible left sidebar (shadcn/ui `Sheet` variant)
- **Filter Panel**:
  - Node type checkboxes with counts
  - Relationship type filters
  - Property filters (e.g., year range, citation count)
  - Clear/Reset filters button
- **Statistics Panel**:
  - Visual graph metrics (nodes, edges, clusters)
  - Node type distribution chart
  - Most connected nodes list
- **Minimap** (optional):
  - Small overview of entire graph
  - Current viewport indicator
  - Click to navigate

#### 6. Floating Action Button (FAB) Menu
- Bottom-right floating menu with shadcn/ui `Button` variants
- Primary action: "Add Node" (prominent)
- Secondary actions in expandable menu:
  - Zoom controls (In/Out/Fit/Reset)
  - Layout algorithm selector
  - View mode toggle (Graph/List/Table)
  - Screenshot/Export

#### 7. Enhanced Graph Canvas
- Responsive sizing (use container dimensions instead of fixed width/height)
- Add selection rectangle (click-drag to select multiple nodes)
- Add minimap overlay (small corner view showing full graph)
- Implement hover tooltips with shadcn/ui `Tooltip`
- Add connection highlighting on hover (dim unrelated nodes)
- Smooth animations for layout changes

#### 8. Dialog Modals for Complex Actions
- Use shadcn/ui `Dialog` for:
  - Add/Edit Node form
  - Add Relationship wizard (select source/target, set type)
  - Graph settings
  - Export options (format, filters)
  - Share dialog (generate link, permissions)

#### 9. Toast Notifications
- Use shadcn/ui `Sonner` or `Toast` for feedback:
  - Success: "Node created", "Relationship added"
  - Error: "Failed to delete node", "Connection error"
  - Info: "Graph updated", "5 new nodes loaded"

#### 10. Empty States
- When no data: Attractive empty state with:
  - Illustration/icon
  - "Create your first node" CTA button
  - Quick tutorial link

### Component Architecture Updates

```
routes/graph/index.tsx (refactored)
├── GraphPageHeader (new)
│   ├── Breadcrumb
│   ├── SearchBar + FilterDropdown
│   └── ActionButtons (Add, Settings, Export, Share)
├── GraphPageLayout (new)
│   ├── GraphSidebar (new, collapsible)
│   │   ├── FilterPanel
│   │   ├── StatisticsPanel
│   │   └── MinimapPanel (optional)
│   ├── GraphCanvasContainer (enhanced)
│   │   ├── GraphCanvas (existing, enhanced)
│   │   ├── NodeContextMenu (new)
│   │   ├── CanvasContextMenu (new)
│   │   └── SelectionOverlay (new)
│   └── FloatingActionMenu (new)
├── NodeDetailSheet (enhanced)
│   └── Tabs: Overview, Properties, Connections, History
├── CommandPalette (new)
├── AddNodeDialog (new)
├── AddRelationshipDialog (new)
└── GraphSettingsDialog (new)
```

### Design Principles

1. **Progressive Disclosure**: Show basic controls first, reveal advanced features on demand
2. **Consistent Patterns**: Use shadcn/ui components consistently across all UI elements
3. **Visual Hierarchy**: Use spacing, size, and color to guide attention
4. **Immediate Feedback**: Every action should have visible feedback (animation, toast, state change)
5. **Responsive by Default**: All components adapt to viewport size
6. **Accessible**: Keyboard navigation, ARIA labels, focus management

## Impact

### User Experience
- **Significantly improved**: Professional, polished interface that feels modern
- **More discoverable**: Command palette and context menus make features easy to find
- **Higher productivity**: Quick actions and keyboard shortcuts speed up workflows
- **Better on mobile**: Responsive design works on tablets and smaller screens

### Technical
- **More shadcn/ui components**: Add `Command`, `ContextMenu`, `Dialog`, `Form`, `DropdownMenu`, `Sonner/Toast`
- **New component files**: ~8 new component files, ~5 enhanced existing components
- **State management**: More complex local state for sidebar, dialogs, selection
- **Bundle size**: Minimal increase (~20KB gzipped) from additional components

### Breaking Changes
- None - this is purely a frontend visual/UX enhancement
- Backend API remains unchanged
- Mock data structure unchanged

## Scope

### In Scope
- Complete redesign of `/graph` page UI
- Integration of new shadcn/ui components
- Enhanced interactivity (context menus, command palette, dialogs)
- Responsive layout system
- Empty states and loading states
- Toast notification system
- Keyboard shortcuts
- Sidebar with filters and statistics

### Out of Scope
- Backend API implementation (handled by `implement-graph-module`)
- Real-time collaboration features
- Advanced graph algorithms (clustering, path finding)
- Graph export to external formats (GraphML, GEXF) - basic JSON export only
- User authentication/permissions
- Mobile-specific gesture controls (pinch-to-zoom)
- Undo/redo functionality (future enhancement)

## Success Criteria

1. ✅ Command palette accessible via `Cmd/Ctrl + K` with search and quick actions
2. ✅ Right-click context menus work on nodes and canvas
3. ✅ Left sidebar with collapsible filter and statistics panels
4. ✅ Top toolbar has integrated search, filters, and action buttons
5. ✅ Node detail panel uses tabs and is fully editable (forms validate)
6. ✅ Floating action menu in bottom-right with primary + secondary actions
7. ✅ Add Node and Add Relationship dialogs are functional with validation
8. ✅ Toast notifications appear for all user actions
9. ✅ Empty state displays when no graph data exists
10. ✅ Graph canvas is responsive and fills available space
11. ✅ All new components use shadcn/ui and match design system
12. ✅ Keyboard shortcuts work: `Cmd+K` (search), `Escape` (close), `Delete` (delete selected)
13. ✅ Hover effects and animations are smooth (60fps)

## Related Changes

### Dependencies
- `graph-visualization` spec (existing) - base visualization requirements
- shadcn/ui component library - already integrated

### Follow-up Work
- `implement-graph-crud-api` - Backend APIs for create/update/delete operations
- `implement-graph-keyboard-shortcuts` - Comprehensive keyboard shortcut system
- `implement-graph-collaboration` - Real-time multi-user editing
- `implement-graph-export` - Advanced export formats (GraphML, PNG, SVG)

## Alternatives Considered

### Alternative 1: Minimal Incremental Update
**Pros:** Less work, lower risk
**Cons:** Doesn't address fundamental UX issues, still feels incomplete
**Decision:** Rejected - user explicitly asked for comprehensive redesign

### Alternative 2: Custom Component Library
**Pros:** Full design control, optimized for graph use case
**Cons:** Reinvent wheel, no shadcn/ui consistency, more maintenance
**Decision:** Rejected - shadcn/ui provides excellent foundation

### Alternative 3: Use React Flow or Similar Library
**Pros:** Pre-built graph library with many features
**Cons:** Harder to customize, different design system, large bundle size
**Decision:** Rejected - current D3 implementation works well, just needs better UI around it

## Open Questions

1. **Command Palette Search**: Should it search node content/properties or just names?
   - **Proposal**: Start with names + types, expand to properties in future

2. **Sidebar Default State**: Open or closed by default?
   - **Proposal**: Open on desktop (>1024px), closed on mobile/tablet

3. **Node Editing**: Inline on canvas or always in sheet panel?
   - **Proposal**: Sheet panel for complex edits, inline for quick label changes (future)

4. **Keyboard Shortcuts**: Which actions deserve shortcuts?
   - **Proposal**: Start with: `Cmd+K` (search), `Del` (delete), `Esc` (close), `Cmd+N` (new node)

5. **Minimap**: Essential or nice-to-have?
   - **Proposal**: Nice-to-have, implement if time permits (not in success criteria)

## Validation Checklist

- [ ] Proposal reviewed and approved by maintainer
- [ ] Design document captures component architecture
- [ ] Tasks broken down into verifiable increments
- [ ] All specs have scenarios with WHEN-THEN structure
- [ ] No ambiguous requirements remain

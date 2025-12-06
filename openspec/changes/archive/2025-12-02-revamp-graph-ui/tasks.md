# Tasks: Revamp Graph UI

## Overview
Implementation checklist for comprehensive graph page UI redesign with shadcn/ui components.

## Prerequisites
- [ ] Review existing graph components and understand current architecture
- [ ] Install additional shadcn/ui components needed
- [ ] Review shadcn/ui documentation for Command, ContextMenu, Dialog patterns

## Phase 1: Foundation & Setup

- [ ] Install new shadcn/ui components:
  - `command` - Command palette
  - `context-menu` - Right-click menus
  - `dialog` - Modal dialogs
  - `dropdown-menu` - Advanced filter dropdowns
  - `form` - Node/relationship forms
  - `sonner` (or `toast`) - Notification system
- [ ] Create new component directory structure under `components/graph/`
- [ ] Set up toast/sonner provider in app layout
- [ ] Add keyboard event listener setup utilities

## Phase 2: Top Toolbar Enhancement

- [ ] Create `GraphPageHeader` component with three sections (left/center/right)
- [ ] Implement breadcrumb navigation in left section
- [ ] Move search bar to center with integrated styling
- [ ] Add `DropdownMenu` for advanced filter options (node types, date ranges, etc.)
- [ ] Create action button group in right section (Add Node, Settings, Export, Share)
- [ ] Add loading indicator state to toolbar
- [ ] Style toolbar with consistent spacing and shadows
- [ ] Test responsive behavior (collapse to hamburger menu on mobile)

## Phase 3: Command Palette

- [ ] Create `CommandPalette` component using shadcn/ui `Command`
- [ ] Implement keyboard shortcut handler (`Cmd/Ctrl + K`)
- [ ] Add search functionality for nodes (filter by name/type)
- [ ] Implement quick actions list (Add Node, Create Relationship, Export, etc.)
- [ ] Add recent items section
- [ ] Implement filter presets (show only documents, show only people, etc.)
- [ ] Add keyboard navigation (arrow keys, enter to select)
- [ ] Test with large node lists (virtualization if needed)

## Phase 4: Context Menu System

- [ ] Create `NodeContextMenu` component using shadcn/ui `ContextMenu`
  - Add menu items: View Details, Edit Properties, Add Relationship
  - Add menu items: Duplicate Node, Delete Node, Expand Connections
  - Add icons to menu items using lucide-react
  - Handle menu item click events
- [ ] Create `CanvasContextMenu` component for background right-clicks
  - Add menu items: Add New Node, Fit to Screen, Export View, Settings
  - Position menu at cursor location
  - Close menu on action or outside click
- [ ] Integrate context menus into `GraphCanvas` component
- [ ] Add keyboard shortcuts for common menu actions (Delete key for delete)
- [ ] Test menu positioning edge cases (near viewport edges)

## Phase 5: Enhanced Node Detail Sheet

- [ ] Refactor existing `NodeDetailPanel` to use `Tabs` component
- [ ] Create "Overview" tab:
  - Node icon and label
  - Type badge
  - Creation/modification dates
  - Quick action buttons (Edit, Delete, Duplicate)
- [ ] Create "Properties" tab:
  - Editable form fields for all properties
  - Add/remove property functionality
  - Inline validation with error messages
  - Save/Cancel buttons
- [ ] Create "Connections" tab:
  - List of incoming/outgoing relationships
  - Clickable connection to navigate to related node
  - Mini relationship graph visualization (optional)
  - Add new relationship button
- [ ] Create "History" tab (placeholder for future):
  - Change log
  - Activity timeline
- [ ] Add loading states for async data fetching
- [ ] Test with nodes of different types and property counts

## Phase 6: Collapsible Sidebar

- [ ] Create `GraphSidebar` component using shadcn/ui `Sheet` (or custom sidebar)
- [ ] Implement collapse/expand toggle button
- [ ] Create `FilterPanel` section:
  - Node type checkboxes with live counts
  - Relationship type filters
  - Property range filters (e.g., year slider, citation count)
  - Clear All / Reset Filters button
- [ ] Create `StatisticsPanel` section:
  - Total nodes/edges counts with icons
  - Node type distribution (visual chart or list)
  - Most connected nodes ranking
  - Graph density metric
- [ ] Create `MinimapPanel` section (optional):
  - Small canvas showing entire graph
  - Current viewport rectangle indicator
  - Click to pan to location
- [ ] Wire sidebar filters to graph data filtering logic
- [ ] Add smooth collapse/expand animation
- [ ] Store sidebar state in localStorage
- [ ] Test responsive behavior (auto-close on mobile)

## Phase 7: Floating Action Menu

- [ ] Create `FloatingActionMenu` component
- [ ] Position in bottom-right corner with fixed positioning
- [ ] Add primary FAB: "Add Node" with prominent styling (larger, colored)
- [ ] Create expandable secondary menu with shadcn/ui `DropdownMenu`:
  - Zoom In/Out/Fit/Reset icons
  - Layout algorithm selector (force-directed, hierarchical, circular)
  - View mode toggle (Graph/List/Table views)
  - Screenshot/Export quick action
- [ ] Add smooth expand/collapse animation
- [ ] Implement z-index layering to avoid conflicts
- [ ] Test positioning on different viewport sizes

## Phase 8: Dialog Modals

- [ ] Create `AddNodeDialog` component:
  - Form with label, type selector, properties fields
  - Add property button (dynamic fields)
  - Validation (required fields, unique ID)
  - Submit/Cancel buttons
  - Success toast on creation
- [ ] Create `AddRelationshipDialog` component:
  - Source node selector (autocomplete)
  - Relationship type dropdown
  - Target node selector (autocomplete)
  - Properties fields (optional)
  - Submit/Cancel buttons
  - Success toast on creation
- [ ] Create `GraphSettingsDialog` component:
  - Layout algorithm settings (force strength, link distance)
  - Display settings (show labels, node size)
  - Performance settings (animation speed, max nodes)
  - Apply/Reset/Cancel buttons
- [ ] Create `ExportDialog` component:
  - Format selector (JSON, PNG, SVG)
  - Filter options (export visible only, export selected)
  - Download button
- [ ] Create `ShareDialog` component (placeholder):
  - Generate shareable link
  - Permission settings (view/edit)
  - Copy link button
- [ ] Wire dialogs to open from toolbar buttons and command palette
- [ ] Test form validation and error handling

## Phase 9: Enhanced Graph Canvas

- [ ] Update `GraphCanvas` to use responsive container sizing (remove fixed width/height)
  - Use ResizeObserver or container query
  - Auto-adjust SVG viewBox
- [ ] Implement multi-select with selection rectangle:
  - Click-drag on empty space to draw selection box
  - Highlight selected nodes
  - Bulk actions on selected nodes
- [ ] Add hover tooltips for nodes and edges using shadcn/ui `Tooltip`
- [ ] Implement connection highlighting on hover:
  - Dim unrelated nodes
  - Highlight connected edges
  - Show tooltip with relationship type
- [ ] Add smooth animations for layout changes (use requestAnimationFrame)
- [ ] Optimize rendering for large graphs (canvas rendering fallback if > 500 nodes)
- [ ] Test zoom/pan interactions with new UI elements

## Phase 10: Toast Notifications & Empty States

- [ ] Configure toast provider (Sonner or shadcn Toast)
- [ ] Add toast notifications for all user actions:
  - Success: "Node created", "Relationship added", "Graph saved"
  - Error: "Failed to delete node", "Connection error", "Validation failed"
  - Info: "Graph updated", "5 new nodes loaded"
- [ ] Create `GraphEmptyState` component:
  - Centered layout
  - Illustration or icon (e.g., network icon)
  - Headline: "No graph data yet"
  - Description: "Create your first node to start building your knowledge graph"
  - Primary CTA button: "Create Node"
  - Secondary link: "View tutorial"
- [ ] Create loading skeleton for initial graph load
- [ ] Test empty state transitions and CTA actions

## Phase 11: Keyboard Shortcuts

- [ ] Set up global keyboard event listener in graph page
- [ ] Implement shortcuts:
  - `Cmd/Ctrl + K`: Open command palette
  - `Escape`: Close dialogs/panels/menus
  - `Delete` or `Backspace`: Delete selected node(s)
  - `Cmd/Ctrl + N`: Open Add Node dialog
  - `Cmd/Ctrl + E`: Open Add Relationship dialog
  - `Cmd/Ctrl + F`: Focus search bar
  - `?`: Show keyboard shortcuts help dialog
- [ ] Create `KeyboardShortcutsDialog` component listing all shortcuts
- [ ] Add visual indicators for keyboard-navigable elements
- [ ] Test shortcut conflicts and override behavior

## Phase 12: Polish & Refinements

- [ ] Review all animations and transitions (ensure 60fps)
- [ ] Add micro-interactions (button hover effects, loading spinners)
- [ ] Ensure consistent spacing using Tailwind spacing scale
- [ ] Verify color contrast ratios for accessibility (WCAG AA)
- [ ] Add ARIA labels to interactive elements
- [ ] Test keyboard-only navigation (tab order, focus management)
- [ ] Test screen reader compatibility
- [ ] Add dark mode support (if not already handled by shadcn/ui theme)
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on different screen sizes (mobile, tablet, desktop, ultra-wide)
- [ ] Fix any layout bugs or visual inconsistencies

## Phase 13: Integration & Testing

- [ ] Integrate all new components into `/graph` page route
- [ ] Remove old/replaced components and cleanup unused code
- [ ] Update component imports and dependency tree
- [ ] Test complete user flows:
  - Browse graph → Select node → View details → Edit properties → Save
  - Search node → Right-click → Add relationship → Select target → Confirm
  - Open command palette → Quick action → Create node → Fill form → Submit
  - Filter by type → View statistics → Export filtered graph
- [ ] Test error scenarios and edge cases:
  - Empty graph data
  - Network errors
  - Invalid form inputs
  - Deleting node with relationships
- [ ] Performance testing with large graphs (100+, 500+, 1000+ nodes)
- [ ] Fix any bugs or issues discovered during testing

## Phase 14: Documentation & Cleanup

- [ ] Add JSDoc comments to all new components
- [ ] Update component README if exists
- [ ] Document keyboard shortcuts in user-facing help
- [ ] Add Storybook stories for new components (if Storybook is used)
- [ ] Run linter and fix any warnings (`pnpm check`)
- [ ] Run type checker and fix any errors
- [ ] Remove console.logs and debug code
- [ ] Update task checklist (mark all items complete)

## Verification

### Manual Testing Checklist
- [ ] Command palette opens with `Cmd+K` and has working search
- [ ] Right-click on node shows context menu with all actions
- [ ] Right-click on canvas shows background context menu
- [ ] Sidebar filters work and update graph in real-time
- [ ] Sidebar collapses/expands smoothly
- [ ] Top toolbar search and filters work correctly
- [ ] Add Node dialog opens, validates, and creates nodes
- [ ] Add Relationship dialog opens, validates, and creates relationships
- [ ] Node detail sheet opens with tabs and editable fields
- [ ] Toast notifications appear for all actions
- [ ] Empty state displays when no data
- [ ] Floating action menu works with all buttons
- [ ] Graph canvas is responsive and fills container
- [ ] All keyboard shortcuts work as expected
- [ ] Animations are smooth (no jank)
- [ ] UI is accessible (keyboard nav, screen reader)

### Automated Testing
- [ ] Write unit tests for new utility functions
- [ ] Write integration tests for complex interactions (optional)
- [ ] Verify all components pass type checking
- [ ] Ensure no console errors in browser

## Definition of Done
- All tasks checked off
- All success criteria from proposal met
- No critical bugs or visual issues
- Code passes linter and type checks
- Manual testing checklist complete
- Documentation updated

# graph-visualization Specification Delta

## MODIFIED Requirements

### Requirement: Responsive Layout

The system SHALL adapt the graph visualization to different screen sizes with a flexible container-based approach.

#### Scenario: Responsive container sizing

- **WHEN** the graph is rendered in any viewport
- **THEN** the SVG canvas SHALL automatically fill the available container dimensions using ResizeObserver or container queries
- **AND** the graph SHALL maintain its center position and zoom level
- **AND** no fixed width/height props should be passed to GraphCanvas

#### Scenario: Window resize handling

- **WHEN** the browser window or container is resized
- **THEN** the graph canvas SHALL smoothly adjust its dimensions
- **AND** the current zoom level and pan position SHALL be preserved
- **AND** the force simulation SHALL reposition nodes if necessary to fit the new dimensions

### Requirement: Enhanced Node Visualization

The system SHALL display graph nodes with improved visual feedback and accessibility.

#### Scenario: Advanced hover effects

- **WHEN** user hovers over a node
- **THEN** the node SHALL display enhanced highlight effect with smooth transition
- **AND** a tooltip SHALL appear using shadcn/ui Tooltip component showing node label, type, and key properties
- **AND** all connected edges SHALL be highlighted
- **AND** unrelated nodes SHALL be dimmed (reduced opacity)

#### Scenario: Multi-node selection

- **WHEN** user clicks and drags on empty canvas space
- **THEN** a selection rectangle SHALL be drawn following the cursor
- **AND** all nodes within the rectangle SHALL be highlighted as selected
- **AND** selected nodes SHALL have a distinct visual indicator (e.g., colored border)
- **AND** bulk actions SHALL be available for selected nodes

#### Scenario: Keyboard-driven node navigation

- **WHEN** user presses Tab key with graph focused
- **THEN** keyboard focus SHALL move to the first/next node
- **AND** focused node SHALL have visible focus indicator
- **AND** Enter key SHALL open node detail sheet
- **AND** Delete key SHALL trigger delete confirmation

### Requirement: Enhanced Edge Visualization

The system SHALL display relationships with improved clarity and interactivity.

#### Scenario: Edge hover tooltips

- **WHEN** user hovers over an edge
- **THEN** a tooltip SHALL appear showing relationship type and properties
- **AND** the edge SHALL be highlighted with increased stroke width
- **AND** connected source and target nodes SHALL be highlighted

#### Scenario: Curved edges for readability

- **WHEN** multiple edges connect the same two nodes
- **THEN** edges SHALL be drawn with curved paths to avoid overlapping
- **AND** edge curves SHALL automatically adjust based on number of relationships

## ADDED Requirements

### Requirement: Command Palette for Universal Search and Actions

The system SHALL provide a keyboard-accessible command palette for quick navigation and actions.

#### Scenario: Opening command palette

- **WHEN** user presses `Cmd/Ctrl + K` while on graph page
- **THEN** a modal command palette SHALL open using shadcn/ui Command component
- **AND** the search input SHALL be auto-focused
- **AND** the palette SHALL overlay the graph with backdrop blur

#### Scenario: Searching nodes in command palette

- **WHEN** user types in command palette search input
- **THEN** node results SHALL be filtered by name and type in real-time
- **AND** matching text SHALL be highlighted in results
- **AND** node type icons SHALL be displayed next to each result
- **AND** pressing Enter SHALL navigate to and select the first result

#### Scenario: Quick actions in command palette

- **WHEN** command palette is open
- **THEN** a list of quick actions SHALL be available:
  - "Add Node" - opens Add Node dialog
  - "Create Relationship" - opens Add Relationship dialog
  - "Export Graph" - opens Export dialog
  - "Share Graph" - opens Share dialog
  - "Graph Settings" - opens Settings dialog
- **AND** actions SHALL be keyboard navigable with arrow keys
- **AND** pressing Enter on an action SHALL execute it

#### Scenario: Recent items in command palette

- **WHEN** command palette is opened
- **THEN** a "Recent" section SHALL display last 5 accessed nodes
- **AND** clicking a recent item SHALL navigate to that node
- **AND** recent items SHALL persist across sessions in localStorage

### Requirement: Context Menu System

The system SHALL provide right-click context menus for quick access to node and canvas actions.

#### Scenario: Node context menu

- **WHEN** user right-clicks on a node
- **THEN** a context menu SHALL appear at cursor position using shadcn/ui ContextMenu
- **AND** the menu SHALL include options:
  - "View Details" - opens node detail sheet
  - "Edit Properties" - opens node detail sheet in edit mode
  - "Add Relationship" - opens Add Relationship dialog with source pre-filled
  - "Duplicate Node" - creates a copy of the node
  - "Delete Node" - shows delete confirmation dialog
  - "Expand Connections" - loads and displays additional connected nodes
- **AND** menu items SHALL have icons from lucide-react
- **AND** disabled items SHALL be visually dimmed with tooltip explaining why

#### Scenario: Canvas context menu

- **WHEN** user right-clicks on empty canvas area
- **THEN** a context menu SHALL appear at cursor position
- **AND** the menu SHALL include options:
  - "Add New Node" - opens Add Node dialog
  - "Fit to Screen" - auto-zooms to show all nodes
  - "Export View" - exports current viewport as image
  - "Graph Settings" - opens settings dialog
- **AND** menu SHALL close when user clicks outside or presses Escape

#### Scenario: Context menu keyboard navigation

- **WHEN** context menu is open
- **THEN** user SHALL be able to navigate with arrow keys
- **AND** pressing Enter SHALL execute the focused menu item
- **AND** pressing Escape SHALL close the menu

### Requirement: Collapsible Sidebar with Filters and Statistics

The system SHALL provide a left sidebar for filtering graph data and viewing statistics.

#### Scenario: Sidebar visibility toggle

- **WHEN** user clicks the sidebar toggle button in toolbar
- **THEN** the sidebar SHALL smoothly slide in/out with 300ms transition
- **AND** sidebar state (open/closed) SHALL persist in localStorage
- **AND** on desktop (>1024px width), sidebar SHALL be open by default
- **AND** on mobile/tablet (<1024px width), sidebar SHALL be closed by default

#### Scenario: Filter panel node type filters

- **WHEN** sidebar filter panel is displayed
- **THEN** checkboxes for each node type SHALL be shown (Person, Document, Concept, Topic)
- **AND** each checkbox SHALL display the count of nodes of that type (e.g., "Person (5)")
- **AND** unchecking a type SHALL immediately hide those nodes from the graph
- **AND** a "Clear Filters" button SHALL reset all filters to default state

#### Scenario: Filter panel relationship type filters

- **WHEN** sidebar filter panel is displayed
- **THEN** checkboxes for relationship types SHALL be shown (wrote, references, related_to, belongs_to)
- **AND** unchecking a relationship type SHALL hide those edges
- **AND** hiding an edge SHALL not hide its connected nodes

#### Scenario: Filter panel property filters

- **WHEN** sidebar filter panel is displayed
- **THEN** property-based filters SHALL be available (e.g., year range slider, citation count input)
- **AND** property filters SHALL apply to node properties
- **AND** only nodes matching all active property filters SHALL be displayed

#### Scenario: Statistics panel display

- **WHEN** sidebar statistics panel is displayed
- **THEN** total node count and edge count SHALL be shown with icons
- **AND** a node type distribution SHALL be displayed (list with counts or simple bar chart)
- **AND** a "Most Connected Nodes" ranking SHALL list top 5 nodes by connection count
- **AND** clicking a node in the ranking SHALL select it in the graph

#### Scenario: Minimap panel (optional)

- **WHEN** sidebar minimap panel is displayed
- **THEN** a small canvas SHALL show an overview of the entire graph
- **AND** the current viewport SHALL be indicated by a draggable rectangle
- **AND** clicking or dragging in the minimap SHALL pan the main graph view

### Requirement: Enhanced Top Toolbar

The system SHALL provide a unified top toolbar with integrated search, filters, and actions.

#### Scenario: Toolbar layout structure

- **WHEN** graph page is loaded
- **THEN** the toolbar SHALL be fixed at the top with three sections:
  - Left: Breadcrumb navigation ("Home > Graph > [Graph Name]")
  - Center: Search bar with integrated advanced filter dropdown
  - Right: Action buttons (Add Node, Settings, Export, Share)
- **AND** toolbar SHALL have consistent padding and subtle bottom border shadow

#### Scenario: Integrated search with filters

- **WHEN** user types in toolbar search bar
- **THEN** graph SHALL filter to show only matching nodes
- **AND** a dropdown button next to search SHALL open advanced filter menu using shadcn/ui DropdownMenu
- **AND** advanced filters SHALL include: node type multi-select, date range, property filters
- **AND** active filter count SHALL be displayed as a badge on filter button

#### Scenario: Action buttons in toolbar

- **WHEN** toolbar is displayed
- **THEN** the following buttons SHALL be available on the right:
  - "Add Node" button (primary style) - opens Add Node dialog
  - Settings icon button - opens Graph Settings dialog
  - Export icon button - opens Export dialog
  - Share icon button - opens Share dialog
- **AND** buttons SHALL have tooltips on hover
- **AND** buttons SHALL show loading state when action is in progress

### Requirement: Floating Action Menu

The system SHALL provide a floating action button menu in the bottom-right corner for quick access to common actions.

#### Scenario: Primary floating action button

- **WHEN** graph page is displayed
- **THEN** a large circular "Add Node" button SHALL float in the bottom-right corner
- **AND** the button SHALL have prominent styling (colored, elevated shadow)
- **AND** clicking the button SHALL open the Add Node dialog

#### Scenario: Secondary action menu

- **WHEN** user clicks the expand trigger on floating menu
- **THEN** a menu of secondary actions SHALL expand upward using shadcn/ui DropdownMenu:
  - Zoom In / Zoom Out / Fit to Screen / Reset View (with icons)
  - Layout algorithm selector (Force-Directed, Hierarchical, Circular)
  - View mode toggle (Graph / List / Table)
  - Screenshot / Export quick action
- **AND** menu SHALL collapse when user selects an action or clicks outside

#### Scenario: Floating menu positioning

- **WHEN** floating menu is displayed
- **THEN** it SHALL be positioned 24px from bottom and 24px from right
- **AND** it SHALL have higher z-index than graph canvas but lower than dialogs
- **AND** it SHALL not overlap with node detail sheet when sheet is open

### Requirement: Dialog Modals for Complex Actions

The system SHALL provide modal dialogs for creating and editing graph entities using shadcn/ui Dialog component.

#### Scenario: Add Node dialog

- **WHEN** "Add Node" action is triggered (toolbar button, FAB, command palette, or context menu)
- **THEN** a dialog SHALL open with a form including:
  - Label input (required, text)
  - Type selector (required, dropdown: Person/Document/Concept/Topic)
  - Property fields (optional, key-value pairs with + Add Property button)
- **AND** clicking "Create" SHALL validate form, create node, show success toast, and close dialog
- **AND** clicking "Cancel" or pressing Escape SHALL close dialog without saving

#### Scenario: Add Relationship dialog

- **WHEN** "Create Relationship" action is triggered
- **THEN** a dialog SHALL open with a form including:
  - Source node selector (autocomplete search, pre-filled if triggered from node context menu)
  - Relationship type dropdown (wrote, references, related_to, belongs_to, or custom)
  - Target node selector (autocomplete search)
  - Properties (optional, key-value pairs)
- **AND** clicking "Create" SHALL validate form, create relationship, show success toast, close dialog, and update graph
- **AND** form validation SHALL ensure source and target are different nodes

#### Scenario: Graph Settings dialog

- **WHEN** "Settings" button is clicked
- **THEN** a dialog SHALL open with tabs for different setting categories:
  - Layout: Force simulation settings (strength, link distance, charge)
  - Display: Show/hide labels, node size, edge thickness
  - Performance: Animation speed, maximum visible nodes, canvas rendering threshold
- **AND** clicking "Apply" SHALL update graph with new settings and close dialog
- **AND** clicking "Reset" SHALL revert to default settings
- **AND** settings SHALL persist in localStorage

#### Scenario: Export dialog

- **WHEN** "Export" button is clicked
- **THEN** a dialog SHALL open with export options:
  - Format selector: JSON (graph data), PNG (image), SVG (vector)
  - Scope: Export all, Export visible only, Export selected
  - Options: Include filters, High resolution (for images)
- **AND** clicking "Download" SHALL generate file and trigger browser download
- **AND** a loading state SHALL be shown during export generation

### Requirement: Toast Notification System

The system SHALL provide user feedback for all actions via toast notifications using shadcn/ui Sonner or Toast.

#### Scenario: Success notifications

- **WHEN** user successfully creates, updates, or deletes a graph entity
- **THEN** a success toast SHALL appear at top-right with message:
  - "Node created successfully"
  - "Relationship added"
  - "Properties updated"
  - "Node deleted"
- **AND** toast SHALL auto-dismiss after 3 seconds
- **AND** toast SHALL have a checkmark icon and success color (green)

#### Scenario: Error notifications

- **WHEN** an action fails (validation error, network error, server error)
- **THEN** an error toast SHALL appear with descriptive message:
  - "Failed to create node: [error reason]"
  - "Connection error. Please try again."
  - "Validation failed: Label is required"
- **AND** toast SHALL remain visible until user dismisses it
- **AND** toast SHALL have an error icon and error color (red)

#### Scenario: Info notifications

- **WHEN** graph data is updated or loaded
- **THEN** an info toast SHALL appear with message:
  - "Graph updated with 5 new nodes"
  - "Loading graph data..."
  - "Applying filters..."
- **AND** toast SHALL auto-dismiss after 2 seconds
- **AND** toast SHALL have an info icon and neutral color (blue)

### Requirement: Empty State

The system SHALL display an attractive empty state when no graph data exists.

#### Scenario: Empty graph display

- **WHEN** graph page loads with no nodes or edges
- **THEN** an empty state component SHALL be centered in the canvas area
- **AND** the empty state SHALL include:
  - An illustration or icon (e.g., network/graph icon)
  - Headline: "No graph data yet"
  - Description: "Create your first node to start building your knowledge graph"
  - Primary CTA button: "Create Node"
  - Secondary link: "View Tutorial" or "Import Sample Data"
- **AND** clicking "Create Node" SHALL open the Add Node dialog

#### Scenario: Loading state

- **WHEN** graph data is being fetched from API
- **THEN** a loading skeleton or spinner SHALL be displayed
- **AND** a "Loading graph..." message SHALL be shown
- **AND** the loading state SHALL replace the empty state once data arrives

### Requirement: Keyboard Shortcuts

The system SHALL support keyboard shortcuts for common actions to improve power-user productivity.

#### Scenario: Command palette shortcut

- **WHEN** user presses `Cmd/Ctrl + K` on graph page
- **THEN** the command palette SHALL open with search focused

#### Scenario: Dialog and panel shortcuts

- **WHEN** user presses `Escape` key
- **THEN** the topmost open dialog, sheet, or dropdown SHALL close

#### Scenario: Node manipulation shortcuts

- **WHEN** user has a node selected and presses `Delete` or `Backspace` key
- **THEN** a delete confirmation dialog SHALL appear
- **AND** confirming deletion SHALL remove the node and show success toast

#### Scenario: Create shortcuts

- **WHEN** user presses `Cmd/Ctrl + N`
- **THEN** the Add Node dialog SHALL open
- **WHEN** user presses `Cmd/Ctrl + E`
- **THEN** the Add Relationship dialog SHALL open (if a node is selected, it SHALL be pre-filled as source)

#### Scenario: Search shortcut

- **WHEN** user presses `Cmd/Ctrl + F`
- **THEN** focus SHALL move to the toolbar search input

#### Scenario: Help shortcut

- **WHEN** user presses `?` key
- **THEN** a Keyboard Shortcuts Help dialog SHALL open listing all available shortcuts

## REMOVED Requirements

None. All existing requirements are preserved and enhanced.

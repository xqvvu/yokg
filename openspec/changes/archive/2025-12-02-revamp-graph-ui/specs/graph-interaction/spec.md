# graph-interaction Specification

## Purpose

Define interactive editing and manipulation capabilities for the graph visualization UI, enabling users to create, modify, and delete graph entities through intuitive UI components.

## ADDED Requirements

### Requirement: Node Creation Flow

The system SHALL provide an intuitive flow for creating new graph nodes with validation.

#### Scenario: Create node via dialog

- **WHEN** user opens Add Node dialog (from toolbar, FAB, command palette, or context menu)
- **THEN** a dialog form SHALL be displayed with fields:
  - Label (text input, required, max 200 characters)
  - Type (dropdown selector: Person, Document, Concept, Topic)
  - Properties (dynamic key-value pairs, optional)
- **AND** clicking "+ Add Property" button SHALL add a new key-value field pair
- **AND** form validation SHALL show inline errors for:
  - Empty required fields
  - Duplicate property keys
  - Invalid characters in property keys
- **AND** clicking "Create" with valid data SHALL:
  - Create the node in graph data
  - Display success toast notification
  - Close the dialog
  - Auto-select and center the new node in graph view
- **AND** the new node SHALL be positioned near the center of current viewport

#### Scenario: Create node with keyboard shortcut

- **WHEN** user presses `Cmd/Ctrl + N` on graph page
- **THEN** the Add Node dialog SHALL open with focus on label input
- **AND** user SHALL be able to navigate form with Tab key
- **AND** pressing Enter with valid form SHALL submit and create node

### Requirement: Node Editing Flow

The system SHALL allow users to edit existing node properties through the detail panel.

#### Scenario: Edit node properties inline

- **WHEN** user opens node detail sheet and clicks "Edit" button
- **THEN** the Properties tab SHALL switch to edit mode
- **AND** all property fields SHALL become editable text inputs
- **AND** the label field SHALL become editable
- **AND** "Save" and "Cancel" buttons SHALL appear
- **AND** form validation SHALL run on blur for each field

#### Scenario: Save property changes

- **WHEN** user modifies properties and clicks "Save"
- **THEN** form validation SHALL run on all fields
- **AND** if validation passes:
  - Node data SHALL be updated
  - Success toast SHALL appear: "Properties updated"
  - Edit mode SHALL exit, reverting to read-only view
  - Graph visualization SHALL update node if label or type changed
- **AND** if validation fails:
  - Error messages SHALL appear on invalid fields
  - Form SHALL remain in edit mode

#### Scenario: Cancel property changes

- **WHEN** user clicks "Cancel" in edit mode
- **THEN** all unsaved changes SHALL be discarded
- **AND** form SHALL revert to original values
- **AND** edit mode SHALL exit

### Requirement: Node Deletion Flow

The system SHALL allow users to safely delete nodes with confirmation.

#### Scenario: Delete node from context menu

- **WHEN** user right-clicks a node and selects "Delete Node"
- **THEN** a confirmation dialog SHALL appear with:
  - Warning message: "Are you sure you want to delete '[Node Label]'?"
  - Description: "This will also delete all relationships connected to this node."
  - Checkbox: "Don't ask me again" (optional, stores preference in localStorage)
  - "Delete" button (destructive style, red)
  - "Cancel" button
- **AND** clicking "Delete" SHALL:
  - Remove node from graph data
  - Remove all connected edges
  - Show success toast: "Node deleted"
  - Close node detail sheet if it was open
  - Update graph visualization

#### Scenario: Delete node with keyboard shortcut

- **WHEN** a node is selected and user presses `Delete` or `Backspace` key
- **THEN** the same delete confirmation dialog SHALL appear
- **AND** pressing Enter in dialog SHALL confirm deletion
- **AND** pressing Escape SHALL cancel deletion

#### Scenario: Bulk delete selected nodes

- **WHEN** multiple nodes are selected and user presses Delete key or chooses "Delete Selected" from context menu
- **THEN** a confirmation dialog SHALL appear stating: "Delete [N] nodes and their relationships?"
- **AND** confirming SHALL delete all selected nodes and their edges
- **AND** a success toast SHALL show: "[N] nodes deleted"

### Requirement: Relationship Creation Flow

The system SHALL enable users to create relationships between nodes with type selection.

#### Scenario: Create relationship via dialog

- **WHEN** user opens Add Relationship dialog
- **THEN** a dialog form SHALL be displayed with fields:
  - Source node (autocomplete search input)
  - Relationship type (dropdown: wrote, references, related_to, belongs_to, custom)
  - Target node (autocomplete search input)
  - Properties (dynamic key-value pairs, optional)
- **AND** autocomplete SHALL show matching nodes as user types (search by label)
- **AND** if dialog opened from node context menu, source node SHALL be pre-filled
- **AND** form validation SHALL ensure:
  - Source and target nodes are different
  - Relationship type is selected
  - Source and target nodes exist

#### Scenario: Create relationship and update visualization

- **WHEN** user submits valid Add Relationship form
- **THEN** the relationship SHALL be created in graph data
- **AND** a new edge SHALL appear in graph connecting source to target
- **AND** success toast SHALL show: "Relationship added"
- **AND** dialog SHALL close
- **AND** the new edge SHALL animate in smoothly (fade or draw animation)

#### Scenario: Create relationship from command palette

- **WHEN** user selects "Create Relationship" from command palette
- **THEN** Add Relationship dialog SHALL open
- **AND** if a node is currently selected, it SHALL be pre-filled as source

### Requirement: Relationship Editing Flow

The system SHALL allow users to edit relationship properties.

#### Scenario: Edit relationship from detail panel

- **WHEN** user clicks on an edge or views relationship in node detail sheet Connections tab
- **THEN** a relationship detail popover or inline editor SHALL appear
- **AND** relationship properties SHALL be editable (key-value pairs)
- **AND** relationship type SHALL be changeable via dropdown
- **AND** "Save" and "Cancel" buttons SHALL be available

#### Scenario: Save relationship changes

- **WHEN** user modifies relationship and clicks "Save"
- **THEN** relationship data SHALL be updated
- **AND** success toast SHALL show: "Relationship updated"
- **AND** edge styling SHALL update if type changed (color, line style, etc.)

### Requirement: Relationship Deletion Flow

The system SHALL allow users to delete relationships.

#### Scenario: Delete relationship from node detail

- **WHEN** user views a relationship in node detail Connections tab
- **THEN** each relationship SHALL have a delete icon button
- **AND** clicking delete SHALL show confirmation: "Delete this relationship?"
- **AND** confirming SHALL remove the edge from graph
- **AND** success toast SHALL show: "Relationship deleted"

#### Scenario: Delete relationship from context menu

- **WHEN** user right-clicks on an edge
- **THEN** a context menu SHALL appear with "Delete Relationship" option
- **AND** selecting it SHALL show confirmation dialog
- **AND** confirming SHALL delete the edge

### Requirement: Node Duplication

The system SHALL allow users to duplicate nodes with modified labels.

#### Scenario: Duplicate node from context menu

- **WHEN** user right-clicks a node and selects "Duplicate Node"
- **THEN** a new node SHALL be created with:
  - Same type as original
  - Label: "[Original Label] (Copy)"
  - Same properties as original
  - New unique ID
- **AND** the duplicate SHALL be positioned near the original node
- **AND** success toast SHALL show: "Node duplicated"
- **AND** the duplicate node SHALL be auto-selected

#### Scenario: Edit duplicated node label

- **WHEN** node is duplicated
- **THEN** the node detail sheet SHALL open for the duplicate
- **AND** the label field SHALL be auto-focused for immediate editing
- **AND** user SHALL be prompted to rename the duplicate

### Requirement: Expand Connections

The system SHALL allow users to load additional connected nodes for exploration.

#### Scenario: Expand connections from context menu

- **WHEN** user right-clicks a node and selects "Expand Connections"
- **THEN** a loading indicator SHALL appear on the node
- **AND** the system SHALL fetch additional nodes connected to this node (up to 2 hops away)
- **AND** new nodes and edges SHALL be added to the graph with animation
- **AND** info toast SHALL show: "Loaded [N] new connections"

#### Scenario: Expand connections limit

- **WHEN** expanding connections would load more than 50 new nodes
- **THEN** a confirmation dialog SHALL appear: "This will load [N] nodes. Continue?"
- **AND** user SHALL be able to confirm or cancel
- **AND** if cancelled, no new nodes are loaded

### Requirement: Graph Layout Algorithm Selection

The system SHALL allow users to switch between different graph layout algorithms.

#### Scenario: Select layout algorithm

- **WHEN** user opens layout algorithm selector (from floating action menu or settings)
- **THEN** the following options SHALL be available:
  - Force-Directed (default, using D3 force simulation)
  - Hierarchical (top-down tree layout)
  - Circular (nodes arranged in a circle)
  - Grid (nodes in a grid pattern)
- **AND** selecting an algorithm SHALL re-layout the graph with smooth animation
- **AND** layout preference SHALL be saved in localStorage

#### Scenario: Layout algorithm transition

- **WHEN** layout algorithm is changed
- **THEN** nodes SHALL animate from current positions to new positions over 1 second
- **AND** edges SHALL smoothly adjust to follow nodes
- **AND** a loading toast SHALL show during transition: "Applying [Algorithm] layout..."

### Requirement: View Mode Toggle

The system SHALL provide alternative view modes for displaying graph data.

#### Scenario: Switch to List view

- **WHEN** user selects "List" view mode from floating action menu
- **THEN** the graph canvas SHALL be replaced with a table/list view
- **AND** nodes SHALL be displayed as list items with:
  - Node label
  - Node type badge
  - Connection count
  - Key properties
- **AND** clicking a list item SHALL open node detail sheet
- **AND** the view mode preference SHALL persist in localStorage

#### Scenario: Switch to Table view

- **WHEN** user selects "Table" view mode
- **THEN** the graph SHALL be displayed as a data table with columns:
  - Label, Type, Properties, Connections
- **AND** table SHALL be sortable and filterable
- **AND** clicking a row SHALL open node detail sheet

#### Scenario: Switch back to Graph view

- **WHEN** user selects "Graph" view mode
- **THEN** the visualization SHALL return to the D3 force-directed canvas
- **AND** the last viewport position and zoom level SHALL be restored

### Requirement: Graph Screenshot and Export

The system SHALL allow users to capture and export the graph visualization.

#### Scenario: Export as PNG image

- **WHEN** user selects "PNG" format in Export dialog and clicks "Download"
- **THEN** the current graph viewport SHALL be rendered to a PNG image
- **AND** image resolution SHALL be configurable (1x, 2x, 3x)
- **AND** a file download SHALL be triggered with filename: "graph-[timestamp].png"
- **AND** success toast SHALL show: "Graph exported as PNG"

#### Scenario: Export as SVG vector

- **WHEN** user selects "SVG" format in Export dialog
- **THEN** the graph SHALL be exported as an SVG file
- **AND** SVG SHALL be scalable and retain all visual properties
- **AND** file download SHALL be triggered with filename: "graph-[timestamp].svg"

#### Scenario: Export as JSON data

- **WHEN** user selects "JSON" format in Export dialog
- **THEN** the graph data (nodes and edges) SHALL be exported as JSON
- **AND** user SHALL be able to choose:
  - Export all data
  - Export only visible/filtered data
  - Export only selected nodes and their connections
- **AND** file download SHALL be triggered with filename: "graph-data-[timestamp].json"

### Requirement: Graph Settings Persistence

The system SHALL persist user preferences across sessions.

#### Scenario: Save graph settings

- **WHEN** user modifies settings in Graph Settings dialog and clicks "Apply"
- **THEN** settings SHALL be saved to localStorage with key "graph-settings-[graphId]"
- **AND** settings SHALL include:
  - Layout algorithm preference
  - Display preferences (show labels, node size, edge thickness)
  - Performance settings (animation speed, max nodes)
  - Filter states
  - Sidebar open/closed state

#### Scenario: Restore graph settings on load

- **WHEN** graph page loads
- **THEN** settings SHALL be loaded from localStorage
- **AND** graph SHALL be rendered with saved preferences
- **AND** if no saved settings exist, defaults SHALL be used

### Requirement: Undo/Redo for Destructive Actions

The system SHALL provide undo functionality for node and relationship deletion.

#### Scenario: Undo node deletion

- **WHEN** user deletes a node
- **THEN** a toast notification SHALL appear with "Undo" button
- **AND** clicking "Undo" within 5 seconds SHALL:
  - Restore the deleted node and its edges
  - Show info toast: "Deletion undone"
- **AND** after 5 seconds, the undo option SHALL disappear

#### Scenario: Undo relationship deletion

- **WHEN** user deletes a relationship
- **THEN** a toast with "Undo" button SHALL appear
- **AND** clicking "Undo" SHALL restore the deleted edge

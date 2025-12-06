## MODIFIED Requirements

### Requirement: Node Visualization

The system SHALL display graph nodes as visual elements with type-specific styling and labels, dynamically adapting to any node types present in the graph data.

#### Scenario: Node rendering with dynamic type differentiation

- **WHEN** graph data contains nodes of any types (including but not limited to person, document, concept, topic)
- **THEN** the system SHALL dynamically discover all unique node types from the data
- **AND** each discovered type SHALL be assigned a visual style (color, icon) using a deterministic mapping
- **AND** known types (person, document, concept, topic) SHALL use predefined styles:
  - Person nodes: blue (#3b82f6) with User icon
  - Document nodes: green (#10b981) with FileText icon
  - Concept nodes: violet (#8b5cf6) with Lightbulb icon
  - Topic nodes: amber (#f59e0b) with BookOpen icon
- **AND** unknown types SHALL use auto-generated colors from a consistent palette
- **AND** unknown types SHALL use a fallback icon (e.g., Circle or HelpCircle)
- **AND** each node SHALL display its label below the circle

#### Scenario: Node interactivity

- **WHEN** user hovers over a node
- **THEN** the node SHALL display a highlight effect (e.g., increased size, glow)
- **AND** a tooltip SHALL appear showing the node's label and type

#### Scenario: Node dragging

- **WHEN** user clicks and drags a node
- **THEN** the node SHALL follow the cursor position
- **AND** the force simulation SHALL adjust connected nodes accordingly
- **AND** releasing the node SHALL allow the simulation to resume natural positioning

### Requirement: Edge Visualization

The system SHALL display relationships between nodes as visual lines connecting them, with styling that adapts to any relationship types present in the data.

#### Scenario: Edge rendering

- **WHEN** graph data contains edges between nodes
- **THEN** each edge SHALL be rendered as a line connecting the source and target nodes
- **AND** the line SHALL update its position automatically as nodes move

#### Scenario: Edge styling by type

- **WHEN** edges have any relationship types (including but not limited to wrote, references, related_to, belongs_to)
- **THEN** the system SHALL dynamically discover all unique relationship types from the data
- **AND** edges MAY have visual differentiation by type (e.g., line style, color, arrow direction)
- **AND** unknown relationship types SHALL render with a default style

## ADDED Requirements

### Requirement: Dynamic Type Discovery

The system SHALL provide utilities to discover and classify node and relationship types present in graph data at runtime.

#### Scenario: Extract node types from graph data

- **WHEN** graph data is loaded with nodes of various types
- **THEN** a utility function SHALL extract all unique node type values
- **AND** return them as a list (e.g., `["Person", "Document", "Project", "Location"]`)
- **AND** the list SHALL preserve the types exactly as they appear in the data

#### Scenario: Extract relationship types from graph data

- **WHEN** graph data is loaded with edges of various types
- **THEN** a utility function SHALL extract all unique relationship type values
- **AND** return them as a list (e.g., `["WROTE", "REFERENCES", "MANAGES"]`)
- **AND** the list SHALL preserve the types exactly as they appear in the data

#### Scenario: Type style configuration with fallback

- **WHEN** UI components need to display a node type
- **THEN** a utility function SHALL return a style configuration (icon, color, label) for that type
- **AND** for known types (person, document, concept, topic), predefined configurations SHALL be returned
- **AND** for unknown types, a deterministic fallback configuration SHALL be generated
- **AND** the fallback SHALL use hash-based color assignment for consistency across renders
- **AND** the fallback SHALL use a default icon (e.g., Circle, HelpCircle, or Network)

### Requirement: Dynamic UI Controls

The system SHALL populate UI controls (filters, legends, command palettes) based on types discovered in the current graph data.

#### Scenario: Dynamic legend display

- **WHEN** the graph legend component renders
- **THEN** it SHALL display a list of all node types present in the current graph
- **AND** each type SHALL show its icon, label, and count
- **AND** the legend SHALL update automatically when graph data changes

#### Scenario: Dynamic type filter

- **WHEN** the graph toolbar filter dropdown is opened
- **THEN** it SHALL display "All Types" plus one option for each node type present in the data
- **AND** the options SHALL be generated dynamically from discovered types
- **AND** the filter SHALL work correctly for both known and custom types

#### Scenario: Dynamic command palette browsing

- **WHEN** user opens the command palette without a search query
- **THEN** the "Browse by Type" section SHALL list all node types discovered in the data
- **AND** each type SHALL display with its corresponding icon
- **AND** clicking a type SHALL filter search results to that type
- **AND** the list SHALL adapt to custom types beyond the original four

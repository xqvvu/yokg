# graph-query-api

## Purpose
Provides high-level graph query capabilities for retrieving subgraphs, neighbors, and traversals, enabling frontend visualization and exploration.

## ADDED Requirements

### Requirement: Get Entire Graph

The system SHALL provide an endpoint to retrieve the entire knowledge graph or a filtered subset.

#### Scenario: Retrieve full graph

- **WHEN** a GET request is sent to `/api/graph`
- **THEN** the system SHALL return all nodes and relationships:
  ```json
  {
    "ok": true,
    "code": 0,
    "data": {
      "nodes": [
        { "id": "uuid-1", "label": "Person", "properties": {...}, "createdAt": "...", "updatedAt": "..." },
        { "id": "uuid-2", "label": "Document", "properties": {...}, "createdAt": "...", "updatedAt": "..." }
      ],
      "relationships": [
        { "id": "uuid-3", "type": "WROTE", "sourceId": "uuid-1", "targetId": "uuid-2", "properties": {...}, "createdAt": "..." }
      ]
    }
  }
  ```

#### Scenario: Limit graph size

- **WHEN** a GET request is sent with query parameter `limit=100`
- **THEN** the system SHALL return at most 100 nodes
- **AND** the system SHALL return only relationships between the returned nodes
- **AND** the default limit SHALL be 500 nodes if not specified

#### Scenario: Filter graph by node label

- **WHEN** a GET request is sent with query parameter `labels=Person,Document`
- **THEN** the system SHALL return only nodes with labels `Person` or `Document`
- **AND** the system SHALL return only relationships between the filtered nodes

#### Scenario: Large graph warning

- **WHEN** the total number of nodes exceeds 1000
- **THEN** the system SHOULD include a warning in the response metadata
- **AND** the warning SHALL suggest using filters or subgraph queries

### Requirement: Get Node Neighbors

The system SHALL provide an endpoint to retrieve immediate neighbors of a specified node.

#### Scenario: Retrieve 1-hop neighbors

- **WHEN** a GET request is sent to `/api/graph/nodes/{nodeId}/neighbors`
- **THEN** the system SHALL return:
  - All nodes directly connected to the specified node (1-hop distance)
  - All relationships connecting the specified node to its neighbors
  ```json
  {
    "ok": true,
    "code": 0,
    "data": {
      "center": { "id": "uuid-1", "label": "Person", ... },
      "neighbors": [
        { "id": "uuid-2", "label": "Document", ... },
        { "id": "uuid-3", "label": "Concept", ... }
      ],
      "relationships": [
        { "id": "uuid-4", "type": "WROTE", "sourceId": "uuid-1", "targetId": "uuid-2", ... }
      ]
    }
  }
  ```

#### Scenario: Filter neighbors by relationship type

- **WHEN** a GET request is sent with query parameter `relationshipType=WROTE`
- **THEN** the system SHALL return only neighbors connected via `WROTE` relationships
- **AND** other relationship types SHALL be excluded

#### Scenario: Filter neighbors by direction

- **WHEN** a GET request is sent with query parameter `direction=outgoing`
- **THEN** the system SHALL return only nodes that the specified node points to (outgoing relationships)
- **WHEN** query parameter is `direction=incoming`
- **THEN** the system SHALL return only nodes that point to the specified node
- **WHEN** `direction=both` or omitted
- **THEN** the system SHALL return neighbors in both directions (default)

### Requirement: Get Subgraph

The system SHALL provide an endpoint to retrieve a subgraph centered on a node up to a specified depth.

#### Scenario: Retrieve 2-hop subgraph

- **WHEN** a GET request is sent to `/api/graph/nodes/{nodeId}/subgraph?depth=2`
- **THEN** the system SHALL return:
  - The center node
  - All nodes within 2 hops of the center node
  - All relationships connecting these nodes
  ```json
  {
    "ok": true,
    "code": 0,
    "data": {
      "nodes": [ /* all nodes within 2 hops */ ],
      "relationships": [ /* all relationships between these nodes */ ],
      "depth": 2,
      "centerNodeId": "uuid-1"
    }
  }
  ```

#### Scenario: Limit subgraph depth

- **WHEN** a GET request is sent with `depth` greater than 3
- **THEN** the system SHALL return a 400 Bad Request error
- **AND** the error SHALL indicate that maximum depth is 3
- **NOTE:** This prevents expensive unbounded traversals

#### Scenario: Empty subgraph

- **WHEN** a node has no relationships
- **THEN** the subgraph SHALL contain only the center node
- **AND** the `relationships` array SHALL be empty

### Requirement: Get Node with Relationships

The system SHALL provide an endpoint to retrieve a node along with all its relationships and connected nodes.

#### Scenario: Retrieve node with full context

- **WHEN** a GET request is sent to `/api/graph/nodes/{nodeId}/full`
- **THEN** the system SHALL return:
  - The node itself
  - All relationships (incoming and outgoing)
  - Summary of connected nodes (id, label, name only)
  ```json
  {
    "ok": true,
    "code": 0,
    "data": {
      "node": { "id": "uuid-1", "label": "Person", "properties": {...}, ... },
      "relationships": {
        "outgoing": [
          {
            "relationship": { "id": "uuid-2", "type": "WROTE", ... },
            "target": { "id": "uuid-3", "label": "Document", "name": "Paper Title" }
          }
        ],
        "incoming": [
          {
            "relationship": { "id": "uuid-4", "type": "MENTIONS", ... },
            "source": { "id": "uuid-5", "label": "Document", "name": "Another Paper" }
          }
        ]
      }
    }
  }
  ```

### Requirement: Path Finding (future)

The system SHALL support finding paths between two nodes (deferred to future iteration).

#### Scenario: Find shortest path (not implemented)

- **WHEN** a GET request is sent to `/api/graph/paths?from={id1}&to={id2}` (not implemented in this phase)
- **THEN** the system SHALL return a 501 Not Implemented status
- **NOTE:** Path finding algorithms (Dijkstra, A*) are deferred

### Requirement: Query Performance

The system SHALL optimize graph queries for acceptable performance.

#### Scenario: Subgraph query caching

- **WHEN** a subgraph query is executed
- **THEN** the result SHALL be cached in Redis with key `graph:subgraph:{nodeId}:{depth}`
- **AND** the cache SHALL have a TTL of 2 minutes
- **AND** the cache SHALL be invalidated when any node or relationship in the subgraph is modified

#### Scenario: Pagination for large result sets

- **WHEN** a graph query would return more than 500 nodes
- **THEN** the system SHALL apply pagination (limit + offset)
- **AND** the response SHALL include pagination metadata

### Requirement: Graph Statistics (future)

The system SHALL provide endpoints for graph statistics and metrics (deferred).

#### Scenario: Get graph stats (not implemented)

- **WHEN** a GET request is sent to `/api/graph/stats` (not implemented in this phase)
- **THEN** the system SHALL return a 501 Not Implemented status
- **NOTE:** Statistics like node count, relationship count, degree distribution are deferred

### Requirement: Search Nodes by Property (basic)

The system SHALL support basic property-based search on nodes.

#### Scenario: Search nodes by name

- **WHEN** a GET request is sent to `/api/graph/nodes/search?q={query}`
- **THEN** the system SHALL return nodes where any string property contains the query (case-insensitive)
- **AND** the search SHALL use a simple `CONTAINS` match (not full-text search)
- **AND** the results SHALL be limited to 50 nodes by default

#### Scenario: Search with label filter

- **WHEN** a GET request is sent with `q={query}&label=Person`
- **THEN** the system SHALL search only within nodes of type `Person`

### Requirement: Graph Export (future)

The system SHALL support exporting the graph in standard formats (deferred).

#### Scenario: Export as GraphML (not implemented)

- **WHEN** a GET request is sent to `/api/graph/export?format=graphml` (not implemented in this phase)
- **THEN** the system SHALL return a 501 Not Implemented status
- **NOTE:** Export formats (GraphML, Cypher script, JSON) are deferred

### Requirement: Input Validation

The system SHALL validate all query parameters for graph queries.

#### Scenario: Validate depth parameter

- **WHEN** a subgraph query includes a `depth` parameter
- **THEN** the depth SHALL be validated as an integer between 1 and 3
- **AND** invalid depths SHALL result in a 400 error

#### Scenario: Validate limit parameter

- **WHEN** any query includes a `limit` parameter
- **THEN** the limit SHALL be validated as an integer between 1 and 1000
- **AND** invalid limits SHALL result in a 400 error

#### Scenario: Validate UUID parameters

- **WHEN** any query includes node IDs
- **THEN** all IDs SHALL be validated as proper UUID format
- **AND** invalid UUIDs SHALL result in a 400 error

### Requirement: Response Format Consistency

The system SHALL return graph data in a consistent format across all endpoints.

#### Scenario: Consistent node structure

- **WHEN** any endpoint returns nodes
- **THEN** each node SHALL have the structure:
  ```typescript
  {
    id: string;           // UUID
    label: string;        // Node type
    properties: object;   // Arbitrary properties
    createdAt: string;    // ISO 8601 datetime
    updatedAt: string;    // ISO 8601 datetime
  }
  ```

#### Scenario: Consistent relationship structure

- **WHEN** any endpoint returns relationships
- **THEN** each relationship SHALL have the structure:
  ```typescript
  {
    id: string;           // UUID
    type: string;         // Relationship type
    sourceId: string;     // Source node UUID
    targetId: string;     // Target node UUID
    properties: object;   // Arbitrary properties
    createdAt: string;    // ISO 8601 datetime
  }
  ```

## MODIFIED Requirements

None (this is a new capability).

## REMOVED Requirements

None.

# graph-relationship-management

## Purpose
Enables creation, retrieval, and deletion of relationships between graph nodes, forming the edges of the knowledge graph.

## ADDED Requirements

### Requirement: Create Relationship

The system SHALL allow users to create directed relationships between two existing nodes.

#### Scenario: Create relationship with valid nodes

- **WHEN** a POST request is sent to `/api/graph/relationships` with:
  ```json
  {
    "type": "WROTE",
    "sourceId": "uuid-person-123",
    "targetId": "uuid-document-456",
    "properties": {
      "year": 2024,
      "role": "lead author"
    }
  }
  ```
- **THEN** the system SHALL:
  - Verify both `sourceId` and `targetId` exist in the database
  - Create a directed relationship from source to target with type `WROTE`
  - Store the properties on the relationship
  - Generate a UUID for the relationship
  - Add `createdAt` timestamp
  - Return the created relationship:
    ```json
    {
      "ok": true,
      "code": 0,
      "data": {
        "id": "uuid-rel-789",
        "type": "WROTE",
        "sourceId": "uuid-person-123",
        "targetId": "uuid-document-456",
        "properties": { "year": 2024, "role": "lead author" },
        "createdAt": "2025-12-02T10:00:00Z"
      }
    }
    ```

#### Scenario: Create relationship with non-existent node

- **WHEN** a POST request is sent with a `sourceId` or `targetId` that doesn't exist
- **THEN** the system SHALL return a 400 Bad Request error
- **AND** the error code SHALL be `ErrorCode.GRAPH.INVALID_RELATIONSHIP` (30202)
- **AND** the error message SHALL indicate which node ID is invalid

#### Scenario: Create relationship with invalid type

- **WHEN** a POST request is sent with a relationship type not in `["WROTE", "REFERENCES", "BELONGS_TO", "RELATES_TO", "MENTIONS"]`
- **THEN** the system SHALL return a 400 Bad Request error
- **AND** the error SHALL list valid relationship types

#### Scenario: Create duplicate relationship

- **WHEN** a relationship with the same `type`, `sourceId`, and `targetId` already exists
- **THEN** the system SHALL either:
  - Allow duplicate relationships (same type, same nodes) if they have different properties
  - OR return a 409 Conflict error if the business logic disallows duplicates
- **AND** the behavior SHALL be documented in the API

### Requirement: Retrieve Relationships

The system SHALL allow users to query relationships with filtering options.

#### Scenario: Get all relationships for a node

- **WHEN** a GET request is sent to `/api/graph/nodes/{nodeId}/relationships`
- **THEN** the system SHALL return all relationships where the node is either source or target:
  ```json
  {
    "ok": true,
    "code": 0,
    "data": {
      "relationships": [
        {
          "id": "uuid-rel-1",
          "type": "WROTE",
          "sourceId": "uuid-person-123",
          "targetId": "uuid-document-456",
          "properties": {},
          "createdAt": "2025-12-02T10:00:00Z"
        }
      ]
    }
  }
  ```

#### Scenario: Filter relationships by direction

- **WHEN** a GET request is sent with query parameter `direction=outgoing`
- **THEN** the system SHALL return only relationships where the specified node is the source
- **WHEN** query parameter is `direction=incoming`
- **THEN** the system SHALL return only relationships where the specified node is the target
- **WHEN** `direction=both` or omitted
- **THEN** the system SHALL return all relationships (default behavior)

#### Scenario: Filter relationships by type

- **WHEN** a GET request is sent with query parameter `type=WROTE`
- **THEN** the system SHALL return only relationships of type `WROTE`
- **AND** the filter SHALL be case-sensitive

### Requirement: Retrieve Relationship by ID

The system SHALL allow users to retrieve a single relationship by its unique ID.

#### Scenario: Retrieve existing relationship

- **WHEN** a GET request is sent to `/api/graph/relationships/{id}`
- **THEN** the system SHALL return the relationship with all its properties
- **AND** the response SHALL include source and target node IDs

#### Scenario: Retrieve non-existent relationship

- **WHEN** a GET request is sent for a relationship ID that doesn't exist
- **THEN** the system SHALL return a 404 Not Found error
- **AND** the error code SHALL be `ErrorCode.GRAPH.RELATIONSHIP_NOT_FOUND` (30201)

### Requirement: Delete Relationship

The system SHALL allow users to delete a relationship without affecting the connected nodes.

#### Scenario: Delete existing relationship

- **WHEN** a DELETE request is sent to `/api/graph/relationships/{id}`
- **THEN** the system SHALL:
  - Delete the relationship from Neo4j
  - Leave both source and target nodes intact
  - Invalidate relevant caches
  - Return a success response:
    ```json
    {
      "ok": true,
      "code": 0,
      "message": "Relationship deleted successfully"
    }
    ```

#### Scenario: Delete non-existent relationship

- **WHEN** a DELETE request is sent for a relationship ID that doesn't exist
- **THEN** the system SHALL return a 404 Not Found error
- **AND** the error code SHALL be `ErrorCode.GRAPH.RELATIONSHIP_NOT_FOUND` (30201)

### Requirement: Relationship Type Constraints

The system SHALL validate relationship types based on node labels where appropriate.

#### Scenario: Validate semantic correctness (optional, future enhancement)

- **WHEN** creating a `WROTE` relationship
- **THEN** the system MAY validate that:
  - Source node has label `Person`
  - Target node has label `Document`
- **AND** if validation is enabled, invalid combinations SHALL return a 400 error
- **NOTE:** This is optional and can be added incrementally

### Requirement: Relationship Properties

The system SHALL support arbitrary properties on relationships with JSON serialization.

#### Scenario: Store relationship metadata

- **WHEN** creating a relationship with properties like `{ year: 2024, confidence: 0.95, source: "manual" }`
- **THEN** all properties SHALL be stored on the Neo4j relationship
- **AND** properties SHALL be retrievable with the relationship

#### Scenario: Update relationship properties (future)

- **WHEN** a PATCH request is sent to `/api/graph/relationships/{id}` (not implemented in this phase)
- **THEN** the system SHALL return a 501 Not Implemented status
- **NOTE:** Relationship updates are deferred to a future iteration

### Requirement: Bidirectional Relationships

The system SHALL support creating bidirectional relationships where appropriate.

#### Scenario: Create symmetric relationship

- **WHEN** creating a `RELATES_TO` relationship from node A to node B
- **THEN** the system SHALL create a single directed relationship in one direction
- **AND** queries SHALL retrieve the relationship from both nodes
- **NOTE:** Neo4j relationships are always directed; queries can ignore direction if needed

### Requirement: Batch Relationship Creation (future)

The system SHALL support creating multiple relationships in a single API call for performance.

#### Scenario: Create multiple relationships atomically (deferred)

- **WHEN** a POST request is sent to `/api/graph/relationships/batch` with an array of relationships (not implemented in this phase)
- **THEN** the system SHALL return a 501 Not Implemented status
- **NOTE:** Batch operations are deferred to improve performance later

### Requirement: Input Validation

The system SHALL validate all relationship inputs using Zod schemas.

#### Scenario: Validate relationship type enum

- **WHEN** any request includes a `type` field
- **THEN** the type SHALL be validated against `["WROTE", "REFERENCES", "BELONGS_TO", "RELATES_TO", "MENTIONS"]`
- **AND** invalid types SHALL result in a 400 error

#### Scenario: Validate node IDs

- **WHEN** any request includes `sourceId` or `targetId`
- **THEN** both SHALL be validated as valid UUID format
- **AND** both SHALL be checked for existence in the database
- **AND** missing or invalid IDs SHALL result in a 400 error

#### Scenario: Validate properties object

- **WHEN** a request includes a `properties` field
- **THEN** properties SHALL be validated as a plain object
- **AND** property values SHALL be JSON-serializable

### Requirement: Relationship Type Safety

The system SHALL provide TypeScript types for relationships derived from Zod schemas.

#### Scenario: Type inference

- **WHEN** defining the relationship schema with Zod:
  ```typescript
  const RelationshipSchema = z.object({
    id: z.string().uuid(),
    type: z.enum(["WROTE", "REFERENCES", "BELONGS_TO", "RELATES_TO", "MENTIONS"]),
    sourceId: z.string().uuid(),
    targetId: z.string().uuid(),
    properties: z.record(z.unknown()),
    createdAt: z.string().datetime(),
  });
  ```
- **THEN** TypeScript types SHALL be inferred using `z.infer<typeof RelationshipSchema>`
- **AND** these types SHALL be used consistently across all layers

## MODIFIED Requirements

None (this is a new capability).

## REMOVED Requirements

None.

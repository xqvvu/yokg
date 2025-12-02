# graph-node-management

## Purpose
Enables creation, retrieval, updating, and deletion of knowledge graph nodes with type-safe schemas and validation.

## ADDED Requirements

### Requirement: Create Node

The system SHALL allow users to create new graph nodes with a specified label and properties.

#### Scenario: Create node with valid data

- **WHEN** a POST request is sent to `/api/graph/nodes` with:
  ```json
  {
    "label": "Person",
    "properties": {
      "name": "Alice",
      "email": "alice@example.com",
      "bio": "AI Researcher"
    }
  }
  ```
- **THEN** the system SHALL:
  - Generate a UUID for the node
  - Create a node in Neo4j with label `:Person`
  - Store the properties on the node
  - Add `createdAt` and `updatedAt` timestamps
  - Return the created node in the response:
    ```json
    {
      "ok": true,
      "code": 0,
      "data": {
        "id": "uuid-123",
        "label": "Person",
        "properties": { "name": "Alice", "email": "alice@example.com", "bio": "AI Researcher" },
        "createdAt": "2025-12-02T10:00:00Z",
        "updatedAt": "2025-12-02T10:00:00Z"
      }
    }
    ```

#### Scenario: Create node with invalid label

- **WHEN** a POST request is sent with an invalid label (not in `["Person", "Document", "Concept", "Topic"]`)
- **THEN** the system SHALL return a 400 Bad Request error
- **AND** the error SHALL indicate the label is invalid and list valid options

#### Scenario: Create node with duplicate ID

- **WHEN** a node with a specific `id` already exists and another creation attempt is made with the same `id`
- **THEN** the system SHALL return a 409 Conflict error
- **AND** the error code SHALL be `ErrorCode.GRAPH.NODE_ALREADY_EXISTS` (30102)

### Requirement: Retrieve Node by ID

The system SHALL allow users to retrieve a single node by its unique ID.

#### Scenario: Retrieve existing node

- **WHEN** a GET request is sent to `/api/graph/nodes/{id}` where `id` is a valid UUID of an existing node
- **THEN** the system SHALL return the node with all its properties:
  ```json
  {
    "ok": true,
    "code": 0,
    "data": {
      "id": "uuid-123",
      "label": "Person",
      "properties": { "name": "Alice", ... },
      "createdAt": "2025-12-02T10:00:00Z",
      "updatedAt": "2025-12-02T10:00:00Z"
    }
  }
  ```

#### Scenario: Retrieve non-existent node

- **WHEN** a GET request is sent for a node ID that doesn't exist
- **THEN** the system SHALL return a 404 Not Found error
- **AND** the error code SHALL be `ErrorCode.GRAPH.NODE_NOT_FOUND` (30101)

#### Scenario: Retrieve node with caching

- **WHEN** a node is retrieved for the first time
- **THEN** the system SHALL cache the result in Redis with key `graph:node:{id}`
- **AND** the cache SHALL have a TTL of 5 minutes
- **AND** subsequent requests within 5 minutes SHALL be served from cache

### Requirement: List Nodes

The system SHALL allow users to retrieve multiple nodes with optional filtering and pagination.

#### Scenario: List all nodes

- **WHEN** a GET request is sent to `/api/graph/nodes`
- **THEN** the system SHALL return a paginated list of nodes:
  ```json
  {
    "ok": true,
    "code": 0,
    "data": {
      "nodes": [
        { "id": "uuid-1", "label": "Person", ... },
        { "id": "uuid-2", "label": "Document", ... }
      ],
      "pagination": {
        "total": 150,
        "limit": 50,
        "offset": 0
      }
    }
  }
  ```
- **AND** the default limit SHALL be 50 nodes
- **AND** the default offset SHALL be 0

#### Scenario: Filter nodes by label

- **WHEN** a GET request is sent to `/api/graph/nodes?label=Person`
- **THEN** the system SHALL return only nodes with label `Person`
- **AND** the response SHALL include pagination metadata

#### Scenario: Paginate results

- **WHEN** a GET request is sent with `limit=20&offset=40`
- **THEN** the system SHALL return nodes 41-60 (skip first 40, return next 20)
- **AND** the pagination metadata SHALL reflect the current page

### Requirement: Update Node

The system SHALL allow users to update properties of an existing node.

#### Scenario: Update node properties

- **WHEN** a PATCH request is sent to `/api/graph/nodes/{id}` with:
  ```json
  {
    "properties": {
      "bio": "Updated bio",
      "newField": "new value"
    }
  }
  ```
- **THEN** the system SHALL:
  - Merge the new properties with existing ones
  - Update the `updatedAt` timestamp
  - Return the updated node
- **AND** existing properties not mentioned SHALL remain unchanged
- **AND** the node cache SHALL be invalidated

#### Scenario: Update non-existent node

- **WHEN** a PATCH request is sent for a node ID that doesn't exist
- **THEN** the system SHALL return a 404 Not Found error
- **AND** the error code SHALL be `ErrorCode.GRAPH.NODE_NOT_FOUND` (30101)

#### Scenario: Update with invalid data

- **WHEN** a PATCH request is sent with invalid property values (e.g., properties is not an object)
- **THEN** the system SHALL return a 400 Bad Request error
- **AND** the error SHALL describe the validation failure

### Requirement: Delete Node

The system SHALL allow users to delete a node and all its relationships.

#### Scenario: Delete node with relationships

- **WHEN** a DELETE request is sent to `/api/graph/nodes/{id}` for a node that has relationships
- **THEN** the system SHALL:
  - Delete all incoming and outgoing relationships (cascade delete)
  - Delete the node
  - Return a success response
- **AND** the node cache SHALL be invalidated
- **AND** any cached queries involving this node SHALL be invalidated

#### Scenario: Delete non-existent node

- **WHEN** a DELETE request is sent for a node ID that doesn't exist
- **THEN** the system SHALL return a 404 Not Found error
- **AND** the error code SHALL be `ErrorCode.GRAPH.NODE_NOT_FOUND` (30101)

#### Scenario: Successful deletion

- **WHEN** a node is successfully deleted
- **THEN** the system SHALL return a 200 OK response with:
  ```json
  {
    "ok": true,
    "code": 0,
    "message": "Node deleted successfully"
  }
  ```

### Requirement: Input Validation

The system SHALL validate all node inputs using Zod schemas before processing.

#### Scenario: Validate label enum

- **WHEN** any request includes a `label` field
- **THEN** the label SHALL be validated against the enum `["Person", "Document", "Concept", "Topic"]`
- **AND** invalid labels SHALL result in a 400 error with a clear message

#### Scenario: Validate properties object

- **WHEN** any request includes a `properties` field
- **THEN** the properties SHALL be validated as a plain object (not array, not null)
- **AND** property values SHALL be JSON-serializable (string, number, boolean, object, array, null)

#### Scenario: Validate ID format

- **WHEN** a request includes a node ID in the URL path
- **THEN** the ID SHALL be validated as a valid UUID format
- **AND** invalid UUIDs SHALL result in a 400 error

### Requirement: Node Type Safety

The system SHALL provide TypeScript types for nodes derived from Zod schemas.

#### Scenario: Type inference

- **WHEN** defining the node schema with Zod:
  ```typescript
  const NodeSchema = z.object({
    id: z.string().uuid(),
    label: z.enum(["Person", "Document", "Concept", "Topic"]),
    properties: z.record(z.unknown()),
    createdAt: z.string().datetime(),
    updatedAt: z.string().datetime(),
  });
  ```
- **THEN** TypeScript types SHALL be inferred using `z.infer<typeof NodeSchema>`
- **AND** these types SHALL be used consistently across repository, service, and route layers

## MODIFIED Requirements

None (this is a new capability).

## REMOVED Requirements

None.

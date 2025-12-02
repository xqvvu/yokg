# neo4j-integration

## Purpose
Provides Neo4j database infrastructure integration for graph storage and querying, following the existing infrastructure patterns (similar to PostgreSQL and Redis).

## ADDED Requirements

### Requirement: Neo4j Client Initialization

The system SHALL provide a Neo4j driver client that connects to the configured Neo4j instance and manages the connection lifecycle.

#### Scenario: Successful connection

- **WHEN** the backend application starts
- **THEN** the Neo4j client SHALL connect to the database using credentials from environment variables (`NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`)
- **AND** the connection SHALL be established with appropriate timeout settings (e.g., 30 seconds)
- **AND** the driver SHALL be available as a singleton instance via `getNeo4jDriver()`

#### Scenario: Connection failure

- **WHEN** the Neo4j client attempts to connect but the database is unreachable
- **THEN** the connection attempt SHALL throw a descriptive error
- **AND** the error SHALL include the connection URI (with credentials redacted)
- **AND** the application MAY retry connection with exponential backoff

#### Scenario: Graceful shutdown

- **WHEN** the backend application shuts down (e.g., SIGTERM signal)
- **THEN** the Neo4j client SHALL close all active sessions
- **AND** the driver SHALL disconnect cleanly
- **AND** any pending queries SHALL be aborted or completed within a timeout period

### Requirement: Neo4j Session Management

The system SHALL provide utilities for creating and managing Neo4j database sessions with proper resource cleanup.

#### Scenario: Create read session

- **WHEN** a read-only query needs to be executed
- **THEN** the system SHALL provide a method to create a read session (e.g., `getReadSession()`)
- **AND** the session SHALL be configured with `READ` access mode
- **AND** the caller SHALL be responsible for closing the session after use

#### Scenario: Create write session

- **WHEN** a write operation (create, update, delete) needs to be executed
- **THEN** the system SHALL provide a method to create a write session (e.g., `getWriteSession()`)
- **AND** the session SHALL be configured with `WRITE` access mode
- **AND** the session SHALL support transaction management

#### Scenario: Session auto-cleanup

- **WHEN** a session is created using a helper function (e.g., `withSession()`)
- **THEN** the session SHALL automatically close after the callback completes
- **AND** the session SHALL close even if the callback throws an error
- **EXAMPLE:**
  ```typescript
  await withSession(async (session) => {
    await session.run("MATCH (n) RETURN n");
  }); // session automatically closed
  ```

### Requirement: Health Check

The system SHALL provide a health check function to verify Neo4j connectivity and readiness.

#### Scenario: Health check on startup

- **WHEN** the application starts up
- **THEN** a health check SHALL be performed by executing a simple query (e.g., `RETURN 1`)
- **AND** if the query succeeds, the health check SHALL return `true`
- **AND** if the query fails, the health check SHALL return `false` and log the error

#### Scenario: Health check endpoint

- **WHEN** an external monitoring system queries the backend health endpoint
- **THEN** the response SHALL include Neo4j connection status
- **AND** the status SHALL indicate whether Neo4j is `connected`, `disconnected`, or `error`

### Requirement: Database Initialization

The system SHALL initialize required Neo4j constraints and indexes on first run or deployment.

#### Scenario: Create constraints

- **WHEN** the database initialization script runs
- **THEN** the following constraints SHALL be created if they don't exist:
  - Unique constraint on node `id` property: `CREATE CONSTRAINT node_id_unique IF NOT EXISTS FOR (n) REQUIRE n.id IS UNIQUE`
- **AND** constraint creation SHALL be idempotent (safe to run multiple times)

#### Scenario: Create indexes

- **WHEN** the database initialization script runs
- **THEN** the following indexes SHALL be created if they don't exist:
  - Index on node labels
  - Index on relationship types
- **AND** index creation SHALL be logged for observability

### Requirement: Configuration Management

The system SHALL load Neo4j configuration from environment variables with sensible defaults.

#### Scenario: Load configuration

- **WHEN** the Neo4j client initializes
- **THEN** the following environment variables SHALL be read:
  - `NEO4J_URI` (required, e.g., `neo4j://localhost:7687` or `neo4j+s://xxx.neo4j.io`)
  - `NEO4J_USERNAME` (required, default: `neo4j`)
  - `NEO4J_PASSWORD` (required)
  - `NEO4J_MAX_CONNECTION_POOL_SIZE` (optional, default: 50)
  - `NEO4J_CONNECTION_TIMEOUT` (optional, default: 30000 ms)
- **AND** missing required variables SHALL cause the application to fail with a clear error message

#### Scenario: Validate configuration

- **WHEN** configuration is loaded
- **THEN** the URI format SHALL be validated (must start with `neo4j://` or `neo4j+s://`)
- **AND** invalid configuration SHALL throw an error before attempting connection

### Requirement: Error Handling and Logging

The system SHALL handle Neo4j-specific errors and log operations for debugging and monitoring.

#### Scenario: Log connection events

- **WHEN** the Neo4j client connects or disconnects
- **THEN** the event SHALL be logged with level `info`
- **AND** the log SHALL include the database URI (with credentials redacted)

#### Scenario: Log query errors

- **WHEN** a Neo4j query fails
- **THEN** the error SHALL be logged with level `error`
- **AND** the log SHALL include:
  - Query text (sanitized, with parameters redacted)
  - Error code (e.g., `Neo.ClientError.Statement.SyntaxError`)
  - Error message

#### Scenario: Wrap Neo4j errors

- **WHEN** a Neo4j driver throws an error
- **THEN** the infrastructure layer SHALL wrap it in a custom error type (e.g., `Neo4jException`)
- **AND** the wrapped error SHALL preserve the original error code and message
- **AND** the error SHALL be mapped to appropriate HTTP status codes in the API layer

## MODIFIED Requirements

None (this is a new capability).

## REMOVED Requirements

None.

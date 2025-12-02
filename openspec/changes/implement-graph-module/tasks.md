# Implementation Tasks

## Overview
This document breaks down the Graph Module implementation into small, verifiable work items. Tasks are ordered to deliver incremental user-visible progress while managing dependencies.

**Estimated Total Effort:** ~3-4 days for a single developer

---

## Phase 1: Infrastructure & Foundation (Neo4j Integration)

### Task 1.1: Install Neo4j Driver Dependencies
- **Action:** Install `neo4j-driver` package in backend
- **Command:** `pnpm add neo4j-driver -F backend`
- **Validation:** Package appears in `apps/backend/package.json` dependencies
- **Files:** `apps/backend/package.json`

### Task 1.2: Add Neo4j Environment Variables
- **Action:** Define Neo4j configuration variables in environment files
- **Files:**
  - `apps/backend/.env.example`: Add `NEO4J_URI`, `NEO4J_USERNAME`, `NEO4J_PASSWORD`, `NEO4J_MAX_CONNECTION_POOL_SIZE`
  - `apps/backend/src/@types/process-env.d.ts`: Add type definitions for new env vars
- **Validation:** TypeScript recognizes `process.env.NEO4J_URI` without errors
- **Dependencies:** None

### Task 1.3: Create Neo4j Client Infrastructure
- **Action:** Implement Neo4j driver initialization and connection management
- **Files:**
  - `apps/backend/src/infra/neo4j/index.ts`: Export public API
  - `apps/backend/src/infra/neo4j/client.ts`: Driver singleton
  - `apps/backend/src/infra/neo4j/config.ts`: Configuration loader
  - `apps/backend/src/infra/neo4j/health.ts`: Health check function
- **Validation:**
  - `getNeo4jDriver()` returns a valid Neo4j driver instance
  - `checkNeo4jHealth()` successfully executes `RETURN 1` query
  - Connection failure logs descriptive error with redacted credentials
- **Dependencies:** Task 1.2

### Task 1.4: Create Database Initialization Script
- **Action:** Implement script to create Neo4j constraints and indexes
- **Files:**
  - `apps/backend/src/infra/neo4j/init.ts`: Initialization functions
- **Script Content:**
  - Create unique constraint on node `id` property
  - Create indexes on node labels
  - Make operations idempotent
- **Validation:** Run script twice; second run doesn't fail
- **Dependencies:** Task 1.3

### Task 1.5: Integrate Neo4j Lifecycle with App
- **Action:** Connect/disconnect Neo4j during app startup/shutdown
- **Files:**
  - `apps/backend/src/index.ts`: Add Neo4j connect/disconnect calls
- **Validation:**
  - App starts successfully and logs "Neo4j connected"
  - Graceful shutdown closes Neo4j connection
- **Dependencies:** Task 1.3

---

## Phase 2: Data Models & Schemas (Type Safety)

### Task 2.1: Define Node and Relationship Schemas
- **Action:** Create Zod schemas for graph entities
- **Files:**
  - `packages/shared/src/validate/graph.ts`: Node, Relationship, Graph schemas
- **Schemas:**
  ```typescript
  NodeSchema, NodeLabelEnum, CreateNodeSchema, UpdateNodeSchema
  RelationshipSchema, RelationshipTypeEnum, CreateRelationshipSchema
  GraphSchema (nodes + relationships)
  ```
- **Validation:**
  - Schemas export TypeScript types via `z.infer`
  - Invalid data fails validation with clear error messages
- **Dependencies:** None (can be done in parallel with Phase 1)

### Task 2.2: Define Error Codes for Graph Module
- **Action:** Add graph-specific error codes to shared error code module
- **Files:**
  - `packages/shared/src/lib/error-codes.ts`: Add `GRAPH` module (30xxx range)
- **Error Codes:**
  - `NODE_NOT_FOUND` (30101)
  - `NODE_ALREADY_EXISTS` (30102)
  - `RELATIONSHIP_NOT_FOUND` (30201)
  - `INVALID_RELATIONSHIP` (30202)
  - `GRAPH_QUERY_ERROR` (30301)
  - `GRAPH_CONNECTION_ERROR` (30302)
- **Validation:** Error codes are accessible via `ErrorCode.GRAPH.*`
- **Dependencies:** None

### Task 2.3: Add Redis Cache Keys for Graph
- **Action:** Define Redis key generators for graph data caching
- **Files:**
  - `apps/backend/src/infra/redis/keys.ts`: Add graph cache key functions
  - `apps/backend/src/infra/redis/ttl.ts`: Add graph TTL constants
- **Example Keys:**
  - `graph:node:{id}` (TTL: 5 minutes)
  - `graph:subgraph:{id}:{depth}` (TTL: 2 minutes)
  - `graph:neighbors:{id}` (TTL: 3 minutes)
- **Validation:** Key functions return properly formatted Redis keys
- **Dependencies:** None

---

## Phase 3: Repository Layer (Data Access)

### Task 3.1: Create Graph Repository Interface
- **Action:** Define TypeScript interface for graph data access
- **Files:**
  - `apps/backend/src/repositories/graph.repository.interface.ts`
- **Methods:**
  - Node CRUD: `createNode`, `findNodeById`, `findNodes`, `updateNode`, `deleteNode`
  - Relationship CRUD: `createRelationship`, `findRelationships`, `deleteRelationship`
  - Queries: `findSubgraph`, `findNeighbors`, `findGraph`
- **Validation:** Interface compiles without TypeScript errors
- **Dependencies:** Task 2.1

### Task 3.2: Implement Graph Repository - Node Operations
- **Action:** Implement node CRUD methods in repository
- **Files:**
  - `apps/backend/src/repositories/graph.repository.ts`
- **Cypher Queries:**
  - `createNode`: `CREATE (n:Label $properties) RETURN n`
  - `findNodeById`: `MATCH (n {id: $id}) RETURN n`
  - `findNodes`: `MATCH (n:Label) RETURN n SKIP $offset LIMIT $limit`
  - `updateNode`: `MATCH (n {id: $id}) SET n += $properties RETURN n`
  - `deleteNode`: `MATCH (n {id: $id}) DETACH DELETE n`
- **Validation:** Unit tests with Neo4j testcontainer or mock driver
- **Dependencies:** Task 3.1, Task 1.3

### Task 3.3: Implement Graph Repository - Relationship Operations
- **Action:** Implement relationship CRUD methods in repository
- **Files:**
  - `apps/backend/src/repositories/graph.repository.ts` (continued)
- **Cypher Queries:**
  - `createRelationship`: `MATCH (s {id: $sourceId}), (t {id: $targetId}) CREATE (s)-[r:TYPE $props]->(t) RETURN r, s, t`
  - `findRelationships`: `MATCH (n {id: $nodeId})-[r]-(connected) RETURN r, connected`
  - `deleteRelationship`: `MATCH ()-[r {id: $id}]-() DELETE r`
- **Validation:** Integration tests verify relationship creation and deletion
- **Dependencies:** Task 3.2

### Task 3.4: Implement Graph Repository - Query Operations
- **Action:** Implement graph query methods (subgraph, neighbors, full graph)
- **Files:**
  - `apps/backend/src/repositories/graph.repository.ts` (continued)
- **Cypher Queries:**
  - `findSubgraph`: `MATCH path = (start {id: $id})-[*0..$depth]-(connected) RETURN nodes(path), relationships(path)`
  - `findNeighbors`: `MATCH (center {id: $id})-[r]-(neighbor) RETURN center, r, neighbor`
  - `findGraph`: `MATCH (n)-[r]->(m) RETURN n, r, m LIMIT $limit`
- **Validation:** Query tests return expected graph structures
- **Dependencies:** Task 3.3

### Task 3.5: Export Repository Singleton
- **Action:** Add singleton pattern for graph repository
- **Files:**
  - `apps/backend/src/repositories/graph.repository.ts` (add exports)
- **Exports:** `getGraphRepository()`, `destroyGraphRepository()`
- **Validation:** Singleton returns same instance across calls
- **Dependencies:** Task 3.4

---

## Phase 4: Service Layer (Business Logic)

### Task 4.1: Create Graph Service with Basic Node Operations
- **Action:** Implement service layer with node CRUD and caching
- **Files:**
  - `apps/backend/src/modules/graph/graph.service.ts`
- **Methods:** `createNode`, `getNodeById`, `listNodes`, `updateNode`, `deleteNode`
- **Features:**
  - Input validation with Zod schemas
  - Redis caching for `getNodeById`
  - Cache invalidation on update/delete
  - Logging with logtape
  - Error handling and mapping to `BusinessException`
- **Validation:**
  - Unit tests with mocked repository and Redis
  - Cache hit/miss logging appears correctly
- **Dependencies:** Task 3.5, Task 2.2, Task 2.3

### Task 4.2: Add Relationship Operations to Graph Service
- **Action:** Implement relationship creation and deletion in service
- **Files:**
  - `apps/backend/src/modules/graph/graph.service.ts` (continued)
- **Methods:** `createRelationship`, `getRelationships`, `deleteRelationship`
- **Features:**
  - Validate source and target nodes exist
  - Invalidate neighbor/subgraph caches on changes
- **Validation:** Integration tests verify relationship logic
- **Dependencies:** Task 4.1

### Task 4.3: Add Graph Query Operations to Service
- **Action:** Implement subgraph and neighbor queries with caching
- **Files:**
  - `apps/backend/src/modules/graph/graph.service.ts` (continued)
- **Methods:** `getGraph`, `getSubgraph`, `getNeighbors`, `getNodeWithRelationships`, `searchNodes`
- **Features:**
  - Cache subgraph and neighbor queries
  - Apply query limits and pagination
  - Validate depth parameters (max 3)
- **Validation:**
  - Queries return correct graph structures
  - Cache TTLs respect configured values
- **Dependencies:** Task 4.2

### Task 4.4: Export Service Singleton
- **Action:** Add singleton pattern for graph service
- **Files:**
  - `apps/backend/src/modules/graph/graph.service.ts` (add exports)
- **Exports:** `getGraphService()`, `destroyGraphService()`
- **Validation:** Singleton returns same instance across calls
- **Dependencies:** Task 4.3

---

## Phase 5: API Layer (HTTP Endpoints)

### Task 5.1: Create Graph Router with Node Endpoints
- **Action:** Implement HTTP endpoints for node operations
- **Files:**
  - `apps/backend/src/modules/graph/graph.route.ts`
- **Endpoints:**
  - `POST /api/graph/nodes` → `createNodeHandler`
  - `GET /api/graph/nodes/:id` → `getNodeByIdHandler`
  - `GET /api/graph/nodes` → `listNodesHandler`
  - `PATCH /api/graph/nodes/:id` → `updateNodeHandler`
  - `DELETE /api/graph/nodes/:id` → `deleteNodeHandler`
- **Validation:** Use Hono validator middleware with Zod schemas
- **Validation Tests:** API tests with Supertest or Hono testing utilities
- **Dependencies:** Task 4.4

### Task 5.2: Add Relationship Endpoints
- **Action:** Implement HTTP endpoints for relationship operations
- **Files:**
  - `apps/backend/src/modules/graph/graph.route.ts` (continued)
- **Endpoints:**
  - `POST /api/graph/relationships` → `createRelationshipHandler`
  - `GET /api/graph/relationships/:id` → `getRelationshipByIdHandler`
  - `GET /api/graph/nodes/:nodeId/relationships` → `getNodeRelationshipsHandler`
  - `DELETE /api/graph/relationships/:id` → `deleteRelationshipHandler`
- **Validation Tests:** API tests verify relationship creation and retrieval
- **Dependencies:** Task 5.1

### Task 5.3: Add Graph Query Endpoints
- **Action:** Implement HTTP endpoints for graph queries
- **Files:**
  - `apps/backend/src/modules/graph/graph.route.ts` (continued)
- **Endpoints:**
  - `GET /api/graph` → `getGraphHandler`
  - `GET /api/graph/nodes/:id/neighbors` → `getNeighborsHandler`
  - `GET /api/graph/nodes/:id/subgraph` → `getSubgraphHandler`
  - `GET /api/graph/nodes/:id/full` → `getNodeFullHandler`
  - `GET /api/graph/nodes/search` → `searchNodesHandler`
- **Validation Tests:** API tests verify query results match expectations
- **Dependencies:** Task 5.2

### Task 5.4: Register Graph Router in App
- **Action:** Mount graph routes in main app
- **Files:**
  - `apps/backend/src/index.ts`: Import and mount graph router
- **Validation:**
  - `GET /api/graph/nodes` returns 200 OK
  - OpenAPI/Swagger docs include graph endpoints (if applicable)
- **Dependencies:** Task 5.3

---

## Phase 6: Frontend Integration

### Task 6.1: Add Graph API Client Functions
- **Action:** Create type-safe HTTP client for graph API
- **Files:**
  - `apps/web/src/lib/api/graph.ts`: Graph API functions
- **Functions:**
  - `fetchGraph()`, `fetchNode(id)`, `fetchSubgraph(id, depth)`, `createNode(data)`, etc.
- **Validation:** Functions return properly typed data matching backend schemas
- **Dependencies:** Task 5.4

### Task 6.2: Update Graph Visualization to Use Real API
- **Action:** Replace mock data with API calls in graph components
- **Files:**
  - `apps/web/src/components/graph/graph-canvas.tsx`: Use `useQuery` to fetch graph
  - `apps/web/src/lib/mocks/graph-data.ts`: Mark as deprecated or remove
- **Changes:**
  - Replace `import mockGraphData` with `useQuery(['graph'], fetchGraph)`
  - Handle loading and error states
- **Validation:**
  - Graph displays real data from Neo4j
  - Loading spinner appears during fetch
  - Error message displays on API failure
- **Dependencies:** Task 6.1

### Task 6.3: Add Node Creation UI (optional enhancement)
- **Action:** Add a simple UI to create nodes manually
- **Files:**
  - `apps/web/src/components/graph/node-create-dialog.tsx`: Dialog with form
  - `apps/web/src/routes/graph.tsx`: Add "Create Node" button
- **Validation:**
  - User can create a node via form
  - New node appears in graph visualization
  - Optimistic updates or refetch on success
- **Dependencies:** Task 6.2
- **Priority:** Medium (can be deferred to after core implementation)

---

## Phase 7: Documentation & Polish

### Task 7.1: Add API Documentation Comments
- **Action:** Document all public functions and endpoints with JSDoc
- **Files:**
  - All repository, service, and route files
- **Validation:** TypeScript hover tooltips display helpful documentation
- **Dependencies:** Task 5.4

### Task 7.2: Create README for Graph Module
- **Action:** Write developer documentation for graph module
- **Files:**
  - `apps/backend/src/modules/graph/README.md`
- **Content:**
  - Overview of graph module
  - Data model explanation
  - API endpoint examples
  - Neo4j query examples
- **Validation:** Documentation is clear and accurate
- **Dependencies:** Task 5.4

### Task 7.3: Update Project README
- **Action:** Document new graph capabilities in main README
- **Files:**
  - `README.md` (project root)
- **Content:**
  - Add "Graph Module" section
  - Link to design document
  - Example API calls
- **Validation:** New users understand how to use graph features
- **Dependencies:** Task 7.2

### Task 7.4: Run Full Type Check and Linting
- **Action:** Ensure all code passes type checking and linting
- **Commands:**
  - `pnpm check` (Biome linting and formatting)
  - `pnpm typecheck` (TypeScript compilation)
- **Validation:** No errors reported
- **Dependencies:** All code tasks complete

---

## Task Dependencies Summary

```
Phase 1 (Infrastructure)
  1.1 → 1.2 → 1.3 → 1.4 → 1.5

Phase 2 (Schemas) - Parallel to Phase 1
  2.1, 2.2, 2.3 (independent)

Phase 3 (Repository)
  2.1 + 1.3 → 3.1 → 3.2 → 3.3 → 3.4 → 3.5

Phase 4 (Service)
  3.5 + 2.2 + 2.3 → 4.1 → 4.2 → 4.3 → 4.4

Phase 5 (API)
  4.4 → 5.1 → 5.2 → 5.3 → 5.4

Phase 6 (Frontend)
  5.4 → 6.1 → 6.2 → 6.3 (optional)

Phase 7 (Docs)
  5.4 → 7.1 → 7.2 → 7.3
  All code → 7.4
```

---

## Validation Checklist

After completing all tasks, verify:

- [ ] Neo4j connects successfully on app startup
- [ ] Can create nodes of all types (Person, Document, Concept, Topic)
- [ ] Can create relationships between nodes
- [ ] Can query entire graph (GET /api/graph)
- [ ] Can query subgraph (GET /api/graph/nodes/:id/subgraph?depth=2)
- [ ] Can update and delete nodes
- [ ] Frontend displays real graph data from API
- [ ] Caching works (check Redis for keys)
- [ ] No TypeScript errors (`pnpm typecheck`)
- [ ] No linting errors (`pnpm check`)
- [ ] Documentation is complete and accurate

---

## Notes

- **Parallelization:** Phases 1 and 2 can be done in parallel by different developers
- **Incremental Delivery:** Each phase delivers testable functionality
- **Optional Tasks:** Tasks marked "optional" can be deferred to future iterations
- **Estimated Time:**
  - Phase 1: 4-6 hours
  - Phase 2: 2-3 hours
  - Phase 3: 6-8 hours
  - Phase 4: 6-8 hours
  - Phase 5: 4-6 hours
  - Phase 6: 3-4 hours
  - Phase 7: 2-3 hours
  - **Total:** ~25-35 hours (3-4 days for one developer)

# Design Document: Graph Module

## 📚 Part 1: Knowledge Graph & Neo4j Fundamentals (Learning Section)

### What is a Knowledge Graph?

A **knowledge graph** is a way to store information as a network of interconnected entities and their relationships. Instead of storing data in flat tables (like traditional databases), you store:

- **Nodes (Vertices)**: Individual entities (e.g., "Albert Einstein", "Relativity Paper", "Physics")
- **Relationships (Edges)**: Connections between entities (e.g., Einstein "WROTE" Relativity Paper, Relativity Paper "BELONGS_TO" Physics)
- **Properties**: Metadata on nodes and relationships (e.g., Einstein's birth year, paper's publication date)

**Example:**
```
(Person:Albert Einstein {born: 1879})
    -[:WROTE {year: 1915}]->
(Document:Relativity Paper {title: "General Relativity"})
    -[:BELONGS_TO]->
(Topic:Physics)
```

### Why Use a Graph Database?

**Traditional SQL databases** are great for structured data but struggle with:
- Deep relationships (e.g., "find friends of friends of friends")
- Flexible schemas (e.g., some documents have authors, others don't)
- Pattern matching (e.g., "find all papers citing Einstein's work")

**Graph databases** excel at:
- ✅ Fast traversal of relationships (no expensive JOINs)
- ✅ Intuitive modeling of connected data
- ✅ Flexible schema evolution

### Neo4j Basics

**Neo4j** is a native graph database (the most popular one). Key concepts:

#### 1. Nodes (Entities)
```cypher
CREATE (p:Person {id: "uuid-123", name: "Alice", age: 30})
```
- `p`: Variable name (like `const p` in JavaScript)
- `:Person`: Label (like a "type" or "class")
- `{...}`: Properties (key-value pairs)

#### 2. Relationships (Connections)
```cypher
CREATE (p1:Person)-[:KNOWS {since: 2020}]->(p2:Person)
```
- `[:KNOWS]`: Relationship type (always uppercase by convention)
- `->`: Direction (relationships are directed in Neo4j)
- `{since: 2020}`: Relationship can have properties too!

#### 3. Cypher Query Language

**Cypher** is Neo4j's query language (like SQL but for graphs).

**Pattern matching example:**
```cypher
// Find all documents written by Alice
MATCH (p:Person {name: "Alice"})-[:WROTE]->(d:Document)
RETURN d
```

**Traversal example:**
```cypher
// Find friends of Alice's friends (2-hop relationship)
MATCH (p:Person {name: "Alice"})-[:KNOWS]->()-[:KNOWS]->(friend)
RETURN friend
```

**Why it's powerful:** You describe the **pattern** you want to find, not the steps to find it!

---

## 🏗️ Part 2: Data Model Design

### Node Types (Labels)

We'll start with 4 core node types:

| Label | Purpose | Example Properties |
|-------|---------|-------------------|
| `Person` | Authors, researchers, individuals | `id`, `name`, `email`, `bio` |
| `Document` | Papers, articles, books | `id`, `title`, `content`, `publishedAt` |
| `Concept` | Abstract ideas, theories | `id`, `name`, `description` |
| `Topic` | Domains, categories | `id`, `name`, `description` |

**Node Schema (Zod):**
```typescript
// Flexible: all nodes share base fields, types differentiated by label
const BaseNodeSchema = z.object({
  id: z.string().uuid(),  // UUID for consistency
  label: z.enum(["Person", "Document", "Concept", "Topic"]),
  properties: z.record(z.unknown()),  // Flexible properties
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});
```

### Relationship Types

| Type | Source → Target | Meaning | Properties |
|------|----------------|---------|------------|
| `WROTE` | Person → Document | Authorship | `year`, `role` |
| `REFERENCES` | Document → Document | Citation | `context` |
| `BELONGS_TO` | Document/Concept → Topic | Categorization | - |
| `RELATES_TO` | Concept ↔ Concept | General connection | `strength` (0-1) |
| `MENTIONS` | Document → Person/Concept | Content reference | `count` |

**Relationship Schema (Zod):**
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

---

## 🏛️ Part 3: Architecture Design

### Layered Architecture

Following existing backend patterns:

```
┌─────────────────────────────────────────┐
│  API Layer (graph.route.ts)            │  ← HTTP endpoints, validation
├─────────────────────────────────────────┤
│  Service Layer (graph.service.ts)      │  ← Business logic, orchestration
├─────────────────────────────────────────┤
│  Repository Layer (graph.repository.ts) │  ← Neo4j queries, data access
├─────────────────────────────────────────┤
│  Infrastructure (infra/neo4j/)          │  ← Neo4j client, connection
└─────────────────────────────────────────┘
```

### Component Responsibilities

#### 1. Infrastructure Layer (`infra/neo4j/`)

**Files:**
- `index.ts`: Neo4j driver setup, connection management
- `client.ts`: Singleton Neo4j client instance
- `health.ts`: Health check queries

**Responsibilities:**
- Initialize Neo4j driver with credentials
- Manage connection lifecycle (connect, disconnect)
- Provide session management utilities
- Handle connection errors gracefully

**Example API:**
```typescript
export function getNeo4jClient(): Driver { ... }
export async function connectNeo4j(): Promise<void> { ... }
export async function disconnectNeo4j(): Promise<void> { ... }
export async function checkNeo4jHealth(): Promise<boolean> { ... }
```

#### 2. Repository Layer (`repositories/graph.repository.ts`)

**Responsibilities:**
- Execute Cypher queries via Neo4j driver
- Map Neo4j records to TypeScript objects
- Handle query errors and retries
- Provide CRUD operations for nodes and relationships

**Key Methods:**
```typescript
interface IGraphRepository {
  // Node operations
  createNode(label: NodeLabel, properties: Record<string, unknown>): Promise<Node>;
  findNodeById(id: string): Promise<Node | null>;
  findNodes(filter: NodeFilter): Promise<Node[]>;
  updateNode(id: string, properties: Record<string, unknown>): Promise<Node>;
  deleteNode(id: string): Promise<void>;

  // Relationship operations
  createRelationship(type: RelType, sourceId: string, targetId: string, props?: Record): Promise<Relationship>;
  findRelationships(filter: RelationshipFilter): Promise<Relationship[]>;
  deleteRelationship(id: string): Promise<void>;

  // Graph queries
  findSubgraph(nodeId: string, depth: number): Promise<Graph>;
  findNeighbors(nodeId: string): Promise<Node[]>;
}
```

**Query Examples:**

*Create Node:*
```typescript
async createNode(label: NodeLabel, properties: Record<string, unknown>): Promise<Node> {
  const query = `
    CREATE (n:${label} $properties)
    RETURN n
  `;
  const result = await session.run(query, { properties });
  return mapRecordToNode(result.records[0]);
}
```

*Find Subgraph:*
```typescript
async findSubgraph(nodeId: string, depth: number): Promise<Graph> {
  const query = `
    MATCH path = (start {id: $nodeId})-[*0..${depth}]-(connected)
    RETURN nodes(path) as nodes, relationships(path) as rels
  `;
  // ... map results to Graph object
}
```

#### 3. Service Layer (`modules/graph/graph.service.ts`)

**Responsibilities:**
- Business logic and validation
- Cache integration (Redis)
- Error handling and logging
- Orchestrate complex operations

**Key Methods:**
```typescript
class GraphService {
  constructor(
    private graphRepo: IGraphRepository,
    private redis: RedisClient,
  ) {}

  async createNode(input: CreateNodeInput): Promise<Node> {
    // 1. Validate input (Zod schema)
    // 2. Check for duplicates (if needed)
    // 3. Call repository
    // 4. Invalidate cache
    // 5. Log operation
  }

  async getGraph(filter?: GraphFilter): Promise<Graph> {
    // 1. Check cache
    // 2. If miss, query repository
    // 3. Store in cache
    // 4. Return graph
  }

  async getNodeWithRelationships(id: string): Promise<NodeWithRels> {
    // Fetch node + all its relationships in one query
  }
}
```

#### 4. API Layer (`modules/graph/graph.route.ts`)

**Responsibilities:**
- Define HTTP endpoints
- Request validation (Zod + Hono validator)
- Response formatting
- Error handling

**Endpoints:**

```typescript
POST   /api/graph/nodes                    Create node
GET    /api/graph/nodes/:id                Get node by ID
GET    /api/graph/nodes                    List nodes (with filters)
PATCH  /api/graph/nodes/:id                Update node properties
DELETE /api/graph/nodes/:id                Delete node

POST   /api/graph/relationships            Create relationship
DELETE /api/graph/relationships/:id        Delete relationship

GET    /api/graph                          Get entire graph or subgraph
GET    /api/graph/nodes/:id/neighbors      Get neighbors of a node
GET    /api/graph/nodes/:id/subgraph       Get subgraph from a node
```

**Example Route:**
```typescript
graph.post(
  "/nodes",
  validator("json", CreateNodeSchema),
  async function createNodeHandler(c) {
    const input = c.req.valid("json");
    const node = await getGraphService().createNode(input);
    return R.ok(c, node);
  }
);
```

---

## 🔍 Part 4: Query Strategy

### Query Patterns

#### 1. Node CRUD

**Create:**
```cypher
CREATE (n:Person {id: $id, name: $name, ...})
RETURN n
```

**Read:**
```cypher
MATCH (n {id: $id})
RETURN n
```

**Update:**
```cypher
MATCH (n {id: $id})
SET n += $properties, n.updatedAt = datetime()
RETURN n
```

**Delete (with cascade):**
```cypher
MATCH (n {id: $id})
DETACH DELETE n  // DETACH removes all relationships first
```

#### 2. Relationship Queries

**Create Relationship:**
```cypher
MATCH (source {id: $sourceId}), (target {id: $targetId})
CREATE (source)-[r:WROTE $properties]->(target)
RETURN r
```

**Find Relationships:**
```cypher
MATCH (source)-[r]->(target)
WHERE source.id = $nodeId
RETURN r, target
```

#### 3. Subgraph Queries

**Get node with immediate neighbors:**
```cypher
MATCH (center {id: $nodeId})
OPTIONAL MATCH (center)-[r]-(neighbor)
RETURN center, collect(r) as relationships, collect(neighbor) as neighbors
```

**Get N-hop subgraph:**
```cypher
MATCH path = (start {id: $nodeId})-[*0..$depth]-(connected)
RETURN nodes(path), relationships(path)
```

#### 4. Filtered Queries

**Find nodes by label:**
```cypher
MATCH (n:Document)
WHERE n.publishedAt > $date
RETURN n
LIMIT $limit SKIP $offset
```

### Query Optimization Tips

1. **Always use indexes on `id` field:**
   ```cypher
   CREATE CONSTRAINT node_id_unique FOR (n:Node) REQUIRE n.id IS UNIQUE
   ```

2. **Use `LIMIT` for large result sets:**
   ```cypher
   MATCH (n:Document) RETURN n LIMIT 100
   ```

3. **Avoid unbounded variable-length paths:**
   ```cypher
   // Bad: [*]  (can traverse entire graph!)
   // Good: [*1..3]  (max 3 hops)
   ```

4. **Use `EXPLAIN` and `PROFILE` to analyze queries:**
   ```cypher
   EXPLAIN MATCH (n:Person)-[:WROTE]->(d) RETURN d
   ```

---

## 💾 Part 5: Caching Strategy

### What to Cache

1. **Individual node lookups** (cache key: `graph:node:{id}`)
   - TTL: 5 minutes
   - Invalidate on node update/delete

2. **Small subgraph queries** (cache key: `graph:subgraph:{id}:{depth}`)
   - TTL: 2 minutes
   - Invalidate on any graph change (conservative)

3. **Neighbor queries** (cache key: `graph:neighbors:{id}`)
   - TTL: 3 minutes
   - Invalidate on relationship changes

### What NOT to Cache

- Full graph queries (too large, changes frequently)
- Complex filtered queries (cache key explosion)
- Write operations

### Cache Implementation

```typescript
// In GraphService
async getNodeById(id: string): Promise<Node | null> {
  const cacheKey = RedisKeys.graph.node(id);

  // 1. Try cache
  const cached = await this.redis.get(cacheKey);
  if (cached) {
    logger.debug`Cache hit for node ${id}`;
    return JSON.parse(cached);
  }

  // 2. Query database
  const node = await this.graphRepo.findNodeById(id);

  // 3. Store in cache
  if (node) {
    await this.redis.setex(cacheKey, RedisTTL.graph.node, JSON.stringify(node));
  }

  return node;
}
```

---

## ⚠️ Part 6: Error Handling

### Error Code System

Following existing pattern, Graph module uses **30xxx** range:

| Code | Name | HTTP Status | Meaning |
|------|------|-------------|---------|
| 30101 | NODE_NOT_FOUND | 404 | Node with given ID doesn't exist |
| 30102 | NODE_ALREADY_EXISTS | 409 | Node with same unique property exists |
| 30201 | RELATIONSHIP_NOT_FOUND | 404 | Relationship doesn't exist |
| 30202 | INVALID_RELATIONSHIP | 400 | Source/target nodes don't exist |
| 30301 | GRAPH_QUERY_ERROR | 500 | Neo4j query failed |
| 30302 | GRAPH_CONNECTION_ERROR | 503 | Cannot connect to Neo4j |

### Error Handling Flow

```typescript
// In Service
async createNode(input: CreateNodeInput): Promise<Node> {
  try {
    return await this.graphRepo.createNode(input.label, input.properties);
  } catch (error) {
    if (error.code === 'Neo.ClientError.Schema.ConstraintValidationFailed') {
      throw new BusinessException(409, {
        errcode: ErrorCode.GRAPH.NODE_ALREADY_EXISTS,
        message: "Node with this ID already exists",
      });
    }
    logger.error`Failed to create node: ${error}`;
    throw new BusinessException(500, {
      errcode: ErrorCode.GRAPH.QUERY_ERROR,
      message: "Failed to create node",
    });
  }
}
```

---

## 🎯 Part 7: Integration with Frontend

### API Contract

**Request/Response Examples:**

*Create Node:*
```http
POST /api/graph/nodes
Content-Type: application/json

{
  "label": "Person",
  "properties": {
    "name": "Alice",
    "email": "alice@example.com",
    "bio": "Researcher"
  }
}

Response 200:
{
  "ok": true,
  "code": 0,
  "message": "success",
  "data": {
    "id": "uuid-123",
    "label": "Person",
    "properties": { "name": "Alice", ... },
    "createdAt": "2025-12-02T10:00:00Z",
    "updatedAt": "2025-12-02T10:00:00Z"
  }
}
```

*Get Graph:*
```http
GET /api/graph?limit=100

Response 200:
{
  "ok": true,
  "code": 0,
  "message": "success",
  "data": {
    "nodes": [
      { "id": "uuid-1", "label": "Person", "properties": {...} },
      { "id": "uuid-2", "label": "Document", "properties": {...} }
    ],
    "relationships": [
      { "id": "uuid-3", "type": "WROTE", "sourceId": "uuid-1", "targetId": "uuid-2", "properties": {} }
    ]
  }
}
```

### Frontend Changes

**Update graph components to fetch from API:**

```typescript
// Before (mock data):
import { mockGraphData } from "@/lib/mocks/graph-data";

// After (real API):
import { useQuery } from "@tanstack/react-query";
import { kyClient } from "@graph-mind/ky";

function GraphCanvas() {
  const { data, isLoading } = useQuery({
    queryKey: ["graph"],
    queryFn: async () => {
      const response = await kyClient.get("api/graph").json();
      return response.data; // { nodes, relationships }
    },
  });

  // ... render with real data
}
```

---

## 📊 Part 8: Performance Considerations

### Pagination

Large graphs need pagination:

```typescript
// Repository
async findNodes(filter: NodeFilter, pagination: Pagination): Promise<PaginatedNodes> {
  const query = `
    MATCH (n:${filter.label})
    RETURN n
    SKIP $offset
    LIMIT $limit
  `;
  // Also get total count for pagination metadata
}
```

### Indexing

**Required indexes:**
```cypher
// Unique constraint on ID (also creates index)
CREATE CONSTRAINT node_id_unique FOR (n:Node) REQUIRE n.id IS UNIQUE;

// Index on commonly queried properties
CREATE INDEX node_label_idx FOR (n) ON (n.label);
CREATE INDEX relationship_type_idx FOR ()-[r]-() ON (r.type);
```

### Lazy Loading

Don't load full graph at once:
1. Initially load nodes only (no relationships)
2. Load relationships on demand when user expands a node
3. Use depth-limited queries (max 2-3 hops)

---

## 🔄 Part 9: Data Consistency

### Challenge: Sync Between Databases

Some entities might exist in both Postgres and Neo4j:
- **Postgres**: User accounts, sessions, metadata
- **Neo4j**: Knowledge graph relationships

**Strategy (for now):**
- Keep them **separate** - Graph nodes are independent entities
- Future: Use CDC (Change Data Capture) or event-driven sync

### Transaction Handling

Neo4j supports ACID transactions:

```typescript
async createNodeWithRelationships(node: NodeInput, relationships: RelInput[]): Promise<Node> {
  const session = driver.session();
  const tx = session.beginTransaction();

  try {
    // 1. Create node
    const node = await tx.run("CREATE (n:Person $props) RETURN n", {...});

    // 2. Create relationships
    for (const rel of relationships) {
      await tx.run("MATCH (source {id: $sourceId}), (target {id: $targetId}) ...", {...});
    }

    await tx.commit();
    return node;
  } catch (error) {
    await tx.rollback();
    throw error;
  } finally {
    await session.close();
  }
}
```

---

## 🎓 Summary & Next Steps

### What You Learned

1. **Graphs vs Tables**: Graphs excel at connected data and traversals
2. **Neo4j Basics**: Nodes, relationships, Cypher queries
3. **Data Modeling**: How to design nodes and relationships
4. **Architecture**: How graph layer fits into existing backend
5. **Queries**: Common patterns (CRUD, subgraph, traversal)
6. **Performance**: Caching, indexing, pagination strategies

### Implementation Order

1. ✅ Infrastructure: Set up Neo4j client
2. ✅ Repository: Implement basic CRUD
3. ✅ Service: Add business logic and caching
4. ✅ Routes: Expose API endpoints
5. ✅ Frontend: Connect to real API
6. ✅ Testing: Write integration tests

### Learning Resources

- [Neo4j Cypher Manual](https://neo4j.com/docs/cypher-manual/current/)
- [Graph Data Modeling](https://neo4j.com/developer/data-modeling/)
- [Neo4j JavaScript Driver](https://neo4j.com/docs/javascript-manual/current/)

---

**Ready to implement?** The specs in the next section define the exact requirements! 🚀

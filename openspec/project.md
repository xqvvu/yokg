# Project Context

## Purpose
A RAG (Retrieval-Augmented Generation) enhanced Knowledge Graph system that combines structured data (Knowledge Graph) with unstructured data (LLM/RAG) for intelligent information retrieval and reasoning.

### Core Objectives
- **Knowledge Graph Management**: Create, visualize, and query interconnected entities and relationships
- **RAG-Enhanced Discovery**: Leverage LLM capabilities to augment knowledge discovery through semantic search and contextual reasoning
- **Hybrid Search**: Combine vector search (semantic) with graph traversal (structural) for comprehensive information retrieval

## Tech Stack

### Core
- **Language:** TypeScript (strict mode)
- **Runtime:** Node.js ^24
- **Package Manager:** pnpm ^10.24
- **Monorepo Management:** pnpm workspaces + Turborepo

### Backend (`apps/backend`)
- **Framework:** Hono (Node.js adapter)
- **Database (Relational):** PostgreSQL + Drizzle ORM
- **Database (Graph):** Neo4j (for knowledge graph storage)
- **Database (Vector):** Milvus (for RAG embeddings and similarity search)
- **Database (Cache/KV):** Redis (with RedisJSON)
- **AI/RAG:** Vercel AI SDK v5 (`ai`, `@ai-sdk/*`)
- **Auth:** Better Auth
- **Validation:** Zod + drizzle-zod
- **Logging:** Logtape
- **Testing:** Vitest

### Frontend (`apps/web`)
- **Framework:** React 19
- **Build Tool:** Vite 7
- **Routing:** TanStack Router (file-based)
- **Data Fetching:** TanStack Query
- **Forms:** TanStack Form
- **UI Components:** shadcn/ui + Radix UI primitives
- **Styling:** Tailwind CSS v4 + class-variance-authority (cva)
- **Icons:** Iconify (via `@iconify/tailwind4`)
- **Graph Visualization:** D3.js (d3-force for force-directed layouts)
- **Testing:** Vitest, React Testing Library

### Shared Packages (`packages/`)
- `@graph-mind/shared`: Zod schemas, Drizzle tables, types, utilities
- `@graph-mind/ky`: HTTP client factory (Ky wrappers for web/server)
- `@graph-mind/ai-providers`: Custom AI provider implementations

## Project Conventions

### Code Style
- **Linter/Formatter:** Biome (`biome.json`). All code must pass `pnpm check`.
- **Type Safety:** Strict TypeScript configuration. No `any` unless absolutely necessary.
- **Naming Conventions:**
  - **Files:** `kebab-case.ts` (e.g., `users.service.ts`, `llm.route.ts`)
  - **Classes:** `PascalCase` (e.g., `UserService`, `UserRepository`)
  - **Variables/Functions:** `camelCase`
  - **Constants:** `UPPER_SNAKE_CASE`
  - **Zod Schemas:** `PascalCase` + `Schema` suffix (e.g., `SelectUserSchema`, `LLMChatCompletionsSchema`)
  - **Types from Zod:** `PascalCase` with `I` prefix for interfaces (e.g., `IUser`) or descriptive suffix (e.g., `LLMChatCompletionsParams`)
  - **Repository Interfaces:** `I` + `EntityName` + `Repository` (e.g., `IUserRepository`)
  - **Route Handlers:** Named function with `Handler` suffix (e.g., `selectAllUsersHandler`)

### Backend Architecture

#### Directory Structure
```
apps/backend/src/
├── @types/           # Type declarations (hono.d.ts, process-env.d.ts)
├── exceptions/       # Custom exception classes
├── infra/            # Infrastructure (database, redis, logger)
├── lib/              # Utilities and helpers
├── middlewares/      # Hono middlewares
├── modules/          # Domain modules (auth/, users/, llm/)
│   └── [module]/
│       ├── [module].route.ts    # Route definitions
│       └── [module].service.ts  # Business logic
└── repositories/     # Data access layer
```

#### Layered Architecture
- **Route → Service → Repository** pattern
- Routes handle HTTP concerns, validation, response formatting
- Services contain business logic, orchestration
- Repositories handle data access (DB + Cache)

#### Dependency Management (Singleton Pattern)
```typescript
// Service singleton
let userService: UserService | null = null;
export function getUserService(): UserService {
  if (isNil(userService)) {
    userService = new UserService(getUserRepository());
  }
  return userService;
}
export function destroyUserService() { /* cleanup */ }
```

### API Response Format

#### Unified Response Structure
```typescript
// Success Response
{ ok: true, code: 0, message: "success", data?: T }

// Error Response
{ ok: false, errcode: number, errmsg: string }
```

#### Response Helpers (`@/lib/http`)
```typescript
R.ok(c, data)    // Success response
R.fail(c, { errcode, errmsg })  // Error response
```

### Error Code System

#### Format: 5-digit `[Module 2-digit][Category 3-digit]`
- Module 10: AUTH (101xx-107xx)
- Module 20: USER (201xx)
- Reserved: 0 (success), -1 to -4 (generic errors)

#### Usage
```typescript
import { ErrorCode } from "@graph-mind/shared/lib/error-codes";

throw new BusinessException(404, {
  errcode: ErrorCode.USER.NOT_FOUND,  // 20101
  message: "User not found",
});
```

### Frontend Architecture

#### Directory Structure
```
apps/web/src/
├── components/
│   ├── ui/           # shadcn/ui components (auto-generated)
│   └── [feature]/    # Feature-specific components
├── integrations/     # Third-party integrations (tanstack-query, etc.)
├── lib/              # Utilities
└── routes/           # TanStack Router file-based routes
```

#### UI Components (shadcn/ui)
- Components use `cva` for variant definitions
- Export both component and variants (e.g., `Button`, `buttonVariants`)
- Use `data-slot` attribute for styling hooks
- Prefer Radix UI primitives for accessibility

### Shared Package Conventions

#### Zod Schema Definitions (`@graph-mind/shared/validate/`)
```typescript
// From Drizzle table
export const SelectUserSchema = createSelectSchema(users);
export type IUser = z.infer<typeof SelectUserSchema>;

// Manual definition
export const LLMChatCompletionsSchema = z.object({ ... });
export type LLMChatCompletionsParams = z.input<typeof LLMChatCompletionsSchema>;
```

### Testing Strategy
- **Unit Tests:** Vitest for logic/services with mock repositories
- **Integration Tests:** Vitest for API endpoints and database interactions
- **Fixtures:** Use factories/fixtures in `test/fixtures/`
- **Mocks:** Repository mocks in `test/mocks/`

### Git Workflow
- **Commits:** Conventional Commits (e.g., `feat:`, `fix:`, `chore:`)
- **Branches:** Feature branching off `main`

## Domain Context

### Knowledge Graph
- **Nodes:** Entities representing real-world objects (Person, Concept, Document, Topic, etc.)
- **Edges:** Typed relationships between entities (AUTHOR_OF, RELATED_TO, BELONGS_TO, REFERENCES, etc.)
- **Properties:** Metadata on both nodes and edges (timestamps, weights, attributes)

### RAG (Retrieval-Augmented Generation)
- **Hybrid Search:** Combine vector similarity (semantic) with graph traversal (structural)
- **Embedding Generation:** Convert documents/chunks to vector representations
- **Context Assembly:** Aggregate relevant context from multiple sources for LLM prompts
- **Chunking Strategy:** Split documents for optimal retrieval granularity

### Vector Search with Milvus
- **Collections:** Organized by document type or knowledge domain
- **Index Types:** HNSW for low-latency queries, IVF_FLAT for accuracy
- **Hybrid Query:** Combine vector similarity with scalar filters (e.g., by user, timestamp)
- **Integration Pattern:**
  ```typescript
  // Milvus client integration in infra/milvus/
  const results = await milvus.search({
    collection: "document_chunks",
    vector: embedding,
    topK: 10,
    filter: "user_id == 'xxx'",
  });
  ```

### Graph Visualization with D3.js
- **Force-Directed Layout:** `d3-force` for automatic node positioning
- **Interactivity:** Zoom, pan, drag nodes, click to expand relationships
- **Performance:** Canvas rendering for large graphs (1000+ nodes), SVG for smaller
- **Data Flow:**
  ```
  Neo4j → Backend API → Frontend → D3.js Renderer
  ```
- **Component Design:**
  ```typescript
  // React + D3 integration pattern
  components/
  └── graph/
      ├── graph-canvas.tsx      // Main D3 canvas component
      ├── graph-controls.tsx    // Zoom, filter controls
      ├── node-tooltip.tsx      // Node detail popover
      └── use-force-simulation.ts  // D3 force simulation hook
  ```

### AI SDK Integration (Vercel AI SDK v5)
```typescript
import { generateText, streamText, embed } from "ai";
import { createAnthropic } from "@ai-sdk/anthropic";

// Text generation
const { text } = await generateText({ model, prompt });

// Streaming
const stream = streamText({ model, prompt });
for await (const chunk of stream.fullStream) { ... }

// Embeddings
const { embedding } = await embed({ model, value });
```

## Important Constraints

### Architecture Constraints
- **Neo4j Integration:** Integrate into `infra/` structure alongside Postgres
- **Cache Strategy:** Use Redis for expensive graph query results
- **Data Consistency:** Maintain sync between Postgres (relational) and Neo4j (graph) when applicable

### Performance Considerations
- Graph traversals can be expensive—use caching and query optimization
- Batch embedding generation for large document sets
- Implement pagination for large result sets

### Security
- LLM API keys stored in environment variables, never committed
- Validate all user inputs before graph queries (prevent injection)

## External Dependencies

### Infrastructure
- **PostgreSQL:** Primary relational data store (users, sessions, metadata)
- **Neo4j:** Knowledge graph storage (AuraDB or self-hosted)
- **Milvus:** Vector database for embeddings (standalone or cluster mode)
- **Redis:** Caching (with RedisJSON module) and session management

### AI/LLM Providers
- **Vercel AI SDK:** Unified interface for multiple providers
- **Supported Providers:** OpenAI, Anthropic, custom providers via `@graph-mind/ai-providers`

## Future Modules (Planned)

### Graph Module (`modules/graph/`)
- CRUD operations for nodes and edges
- Graph query API (Cypher abstraction)
- Graph visualization data endpoints

### Documents Module (`modules/documents/`)
- Document ingestion pipeline
- Chunking and embedding generation
- Document-to-graph entity extraction

### Search Module (`modules/search/`)
- Hybrid search API (vector + graph)
- Query expansion with LLM
- Result ranking and re-ranking

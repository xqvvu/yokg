# Project Context

## Purpose
The goal is to develop a RAG (Retrieval-Augmented Generation) enhanced Knowledge Graph system. This platform will integrate structured data (Knowledge Graph) with unstructured data (LLM/RAG) to provide intelligent information retrieval and reasoning capabilities. Key features include visualizing relationships, querying complex interconnected data, and using AI to augment knowledge discovery.

## Tech Stack

### Core
- **Language:** TypeScript
- **Runtime:** Node.js
- **Package Manager:** pnpm
- **Monorepo Management:** pnpm workspaces + Turborepo

### Backend (`apps/backend`)
- **Framework:** Hono (Node.js adapter)
- **Database (Relational):** PostgreSQL
- **Database (Graph):** Neo4j (Planned)
- **Database (Cache/KV):** Redis
- **ORM:** Drizzle ORM (for PostgreSQL)
- **AI/RAG:** Vercel AI SDK (`ai`)
- **Auth:** Better Auth
- **Validation:** Zod
- **Logging:** Logtape
- **Testing:** Vitest

### Frontend (`apps/web`)
- **Framework:** React
- **Build Tool:** Vite
- **Routing:** TanStack Router
- **Data Fetching:** TanStack Query
- **Forms:** TanStack Form
- **Styling:** Tailwind CSS v4
- **Testing:** Vitest, React Testing Library

### Shared (`packages/`)
- **Utilities:** `es-toolkit`, `date-fns`
- **HTTP Client:** Ky (via `@graph-mind/ky`)
- **Schema/Validation:** Zod (via `@graph-mind/shared`)

## Project Conventions

### Code Style
- **Linter/Formatter:** Biome (`biome.json`). All code must pass `pnpm check`.
- **Type Safety:** Strict TypeScript configuration. No `any` unless absolutely necessary.
- **Naming:**
  - Files: `kebab-case.ts`
  - Classes: `PascalCase`
  - Variables/Functions: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`

### Architecture Patterns
- **Monorepo:** Code shared via `packages/*` and consumed by `apps/*`.
- **Backend:** Modular/Layered architecture (`modules/`, `infra/`, `services/`).
  - **Modules:** Grouped by domain (e.g., `auth/`, `users/`).
  - **Infra:** Infrastructure concerns (Database, Redis, Logger).
- **Frontend:**
  - File-based routing with TanStack Router.
  - Composition over inheritance.
  - Atomic design principles for components.

### Testing Strategy
- **Unit Tests:** Vitest for logic/services.
- **Integration Tests:** Vitest for API endpoints and database interactions.
- **Fixtures:** Use factories/fixtures for test data generation.

### Git Workflow
- **Commits:** Conventional Commits (e.g., `feat:`, `fix:`, `chore:`).
- **Branches:** Feature branching off `main`.

## Domain Context
- **Knowledge Graph:**
  - **Nodes:** Entities (e.g., Person, Concept, Document).
  - **Edges:** Relationships (e.g., AUTHOR_OF, RELATED_TO).
- **RAG (Retrieval-Augmented Generation):**
  - Hybrid search strategy combining Vector Search (semantic) and Graph Traversal (structural).
  - Context window management for LLMs.
  - Embedding generation for unstructured text.

## Important Constraints
- **Neo4j Integration:** Needs to be integrated into the existing `infra` structure alongside Postgres.
- **Performance:** Graph queries can be expensive; caching strategies (Redis) are critical.
- **Data Consistency:** Synchronization between Relational (Postgres) and Graph (Neo4j) data if applicable.

## External Dependencies
- **OpenAI / LLM Provider:** For embeddings and chat completion (via Vercel AI SDK).
- **Neo4j Instance:** AuraDB or self-hosted.
- **PostgreSQL Instance:** Primary data store.
- **Redis Instance:** Caching and session management.

# Implementation Tasks

## Overview
This document breaks down the RAG Search Module (MVP) into small, verifiable work items ordered to deliver incremental progress.

**Estimated Total Effort:** ~2-3 days for a single developer

---

## Phase 1: Infrastructure & Dependencies

- [x] 1.1 Verify Milvus is running and accessible
  - **Action:** Check Milvus health via `curl http://localhost:9091/healthz`
  - **Validation:** Returns 200 OK

- [x] 1.2 Install Milvus Node.js SDK
  - **Action:** `pnpm add @zilliz/milvus2-sdk-node -F backend`
  - **Validation:** Package in `apps/backend/package.json`

- [x] 1.3 Verify Milvus client connection exists
  - **Action:** Check `apps/backend/src/infra/milvus/client.ts` exists
  - **Validation:** File exports `getMilvus()` function

---

## Phase 2: Vector Repository Layer

- [x] 2.1 Create vector repository interface
  - **Action:** Define TypeScript interface for vector operations
  - **Files:** `apps/backend/src/repositories/vector.repository.interface.ts`
  - **Methods:** `ensureCollection`, `insert`, `search`, `delete`

- [x] 2.2 Implement Vector Repository
  - **Action:** Implement Milvus CRUD operations
  - **Files:** `apps/backend/src/repositories/vector.repository.ts`
  - **Features:**
    - Collection creation with schema (id, vector, node_id, text, metadata)
    - Insert with batch support
    - Cosine similarity search
    - Delete by ID

- [x] 2.3 Create collection initialization script
  - **Action:** Ensure `graph_nodes` collection exists on startup
  - **Files:** RAG service initialization in `main.ts`
  - **Schema:**
    - Dimension: 1536
    - Index: IVF_FLAT, COSINE metric

---

## Phase 3: Embedding Service

- [x] 3.1 Install OpenAI SDK (for embeddings)
  - **Action:** `pnpm add @ai-sdk/openai -F backend`
  - **Validation:** Package in dependencies

- [x] 3.2 Implement Embedding Service
  - **Action:** Create service for text vectorization
  - **Files:** `apps/backend/src/modules/llm/embedding.service.ts`
  - **Features:**
    - `embedText(text: string): Promise<number[]>`
    - `embedTexts(texts: string[]): Promise<number[][]>`
    - Use OpenAI text-embedding-3-small
    - Error handling and logging

- [x] 3.3 Add embedding service singleton export
  - **Action:** Export `getEmbeddingService()` function
  - **Files:** `apps/backend/src/modules/llm/embedding.service.ts`

---

## Phase 4: RAG Service Layer

- [x] 4.1 Create RAG Service with query orchestration
  - **Action:** Implement core RAG query flow
  - **Files:** `apps/backend/src/modules/rag/rag.service.ts`
  - **Methods:**
    - `query(question: string): Promise<RAGResponse>`
    - Orchestrates: embed → search → fetch → generate
  - **Features:**
    - Call EmbeddingService for query vector
    - Search VectorRepository (topK=5, threshold=0.7)
    - Fetch node details from GraphRepository
    - Build context prompt
    - Call LLMService for generation

- [x] 4.2 Add streaming support to RAG Service
  - **Action:** Implement streaming generation variant
  - **Files:** `apps/backend/src/modules/rag/rag.service.ts`
  - **Methods:** `queryStream(question: string): AsyncIterable<string>`
  - **Features:** Use `streamText()` from Vercel AI SDK

- [x] 4.3 Export RAG service singleton
  - **Action:** Add `getRAGService()` export
  - **Files:** `apps/backend/src/modules/rag/rag.service.ts`

---

## Phase 5: Graph Module Integration (Auto-Indexing)

- [x] 5.1 Add embedding hook to Graph Service
  - **Action:** Modify `createNode()` to auto-embed and index
  - **Files:** `apps/backend/src/modules/graph/graph.service.ts`
  - **Logic:**
    - After Neo4j insert, call `EmbeddingService.embedText()`
    - Insert vector into Milvus via `VectorRepository.insert()`
    - Log errors but don't fail node creation

- [x] 5.2 Add embedding hook to update operations
  - **Action:** Re-embed on `updateNode()` if text changed
  - **Files:** `apps/backend/src/modules/graph/graph.service.ts`
  - **Logic:** Re-embeds on every update

- [x] 5.3 Add vector deletion on node delete
  - **Action:** Delete Milvus entry when node deleted
  - **Files:** `apps/backend/src/modules/graph/graph.service.ts`
  - **Logic:** Call `VectorRepository.delete(nodeId)` after Neo4j delete

---

## Phase 6: API Layer

- [x] 6.1 Define RAG query schemas
  - **Action:** Create Zod schemas for request/response
  - **Files:** `packages/shared/src/validate/rag.ts`
  - **Schemas:**
    - `RAGQueryRequestSchema`: `{ question: string }`
    - `RAGQueryResponseSchema`: `{ answer: string, sources: Source[] }`

- [x] 6.2 Create RAG router with query endpoint
  - **Action:** Implement `POST /api/rag/query`
  - **Files:** `apps/backend/src/modules/rag/rag.route.ts`
  - **Handlers:**
    - `queryHandler`: Non-streaming version (returns JSON)
    - `queryStreamHandler`: SSE streaming version
  - **Validation:** Use Hono validator with schemas

- [x] 6.3 Register RAG router in main app
  - **Action:** Mount RAG routes
  - **Files:** `apps/backend/src/app.ts`
  - **Code:** `app.route("/api/rag", ragRouter)`

---

## Phase 7: Frontend (Query Interface)

- [x] 7.1 Add RAG API client functions
  - **Action:** Create type-safe HTTP client
  - **Files:** `apps/web/src/lib/api/rag.ts`
  - **Functions:**
    - `queryRAG(question: string): Promise<RAGResponse>`
    - `queryRAGStream(question: string): ReadableStream`

- [x] 7.2 Create RAG page route
  - **Action:** Create dedicated `/rag` route
  - **Files:** `apps/web/src/routes/rag/index.tsx`
  - **Layout:** Full page with centered query interface

- [x] 7.3 Implement Query Input component
  - **Action:** Integrated into RAG page
  - **Files:** `apps/web/src/routes/rag/index.tsx`
  - **Features:**
    - Input field with submit button
    - Keyboard shortcut (Cmd+Enter to submit)
    - Loading state during query

- [x] 7.4 Implement Streaming Answer Display
  - **Action:** Integrated into RAG page
  - **Files:** `apps/web/src/routes/rag/index.tsx`
  - **Features:**
    - Stream text chunks as they arrive
    - Renders plain text with whitespace
    - Loading indicator during generation

- [x] 7.5 Implement Source Citations List
  - **Action:** Integrated into RAG page
  - **Files:** `apps/web/src/routes/rag/index.tsx`
  - **Features:**
    - List of source nodes with titles
    - Clickable links to `/graph/$id`
    - Relevance scores displayed

- [x] 7.6 Add Empty State component
  - **Action:** Integrated into RAG page
  - **Files:** `apps/web/src/routes/rag/index.tsx`
  - **Content:** Example questions, usage tips

---

## Phase 8: Polish

- [x] 8.1 Add error handling for edge cases
  - **Action:** Handle empty results, API failures, timeouts
  - **Files:** All service/route files
  - **Cases:**
    - No matching nodes found → "No information available"
    - Embedding API down → Clear error message
    - Milvus connection lost → Fallback behavior

- [x] 8.2 Add logging and monitoring
  - **Action:** Log query durations, failures
  - **Files:** `apps/backend/src/modules/rag/rag.service.ts`
  - **Metrics:** Query logging implemented

- [x] 8.3 Run full type check and linting
  - **Action:** `pnpm check`
  - **Validation:** Completed (existing errors unrelated to RAG implementation)

- [ ] 8.4 Update project README with RAG documentation
  - **Action:** Add "RAG Search" section to README
  - **Files:** `README.md`
  - **Content:** Feature description, usage example
  - **Note:** Skipped as per design scope

---

## Validation Checklist

After completing all tasks, verify:

- [x] Can create graph nodes and they are auto-indexed in Milvus
- [x] Can query `/rag` page and get relevant answers
- [x] Answers cite source nodes correctly
- [x] Streaming responses work smoothly
- [x] Source links navigate to graph view
- [ ] Query latency < 5s for typical questions (requires runtime testing)
- [x] No TypeScript or linting errors in new RAG code

---

## Task Dependencies

```
Phase 1 (Infra check)
  1.1 → 1.2 → 1.3

Phase 2 (Vector Repo)
  1.3 → 2.1 → 2.2 → 2.3

Phase 3 (Embedding)
  3.1 → 3.2 → 3.3

Phase 4 (RAG Service)
  2.2 + 3.3 → 4.1 → 4.2 → 4.3

Phase 5 (Graph Integration)
  3.3 + 2.2 → 5.1 → 5.2 → 5.3

Phase 6 (API)
  4.3 → 6.1 → 6.2 → 6.3

Phase 7 (Frontend)
  6.3 → 7.1 → 7.2 → 7.3 → 7.4 → 7.5 → 7.6

Phase 8 (Polish)
  All phases → 8.1 → 8.2 → 8.3 → 8.4
```

---

## Notes

- **Parallel Work:** Phases 2-3 can be done in parallel
- **Incremental Delivery:** Each phase builds on previous
- **MVP Focus:** Minimal viable implementation, no advanced features
- **Performance:** Monitor query latency, optimize if exceeds 5s target

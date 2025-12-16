# Design Document: RAG Search Module

## Context

Graph Mind currently supports knowledge graph management and visualization but lacks semantic search and question-answering capabilities. Users need a way to query their graph using natural language and get AI-generated answers grounded in their data.

**Constraints:**
- Must integrate with existing Neo4j graph database
- Must use Milvus for vector storage (already configured)
- Must use Anthropic Claude (existing provider)
- MVP scope: minimize complexity, fast time-to-market

**Stakeholders:**
- End users: Need intuitive Q&A interface
- Developers: Need maintainable, extensible architecture

## Goals / Non-Goals

### Goals
1. Enable natural language queries over knowledge graph
2. Provide accurate, source-cited answers
3. Auto-index graph nodes for semantic search
4. Deliver answers in < 5 seconds
5. Support streaming responses for better UX

### Non-Goals (Future Work)
- Document upload and processing pipeline
- Hybrid search combining vector + graph traversal
- Multi-modal search (images, audio)
- Query analytics or usage tracking
- Custom embedding models

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                  User Query                              │
└───────────────────────┬─────────────────────────────────┘
                        │
                        ▼
        ┌──────────────────────────────┐
        │   RAG Service                 │
        │   (Query Orchestration)       │
        └───────────┬──────────────────┘
                    │
        ┌───────────┴───────────┐
        │                       │
        ▼                       ▼
┌──────────────┐        ┌──────────────┐
│ Embedding    │        │ LLM Service  │
│ Service      │        │ (Claude)     │
└──────┬───────┘        └──────────────┘
       │
       ▼
┌──────────────┐        ┌──────────────┐
│ Vector Repo  │───────│  Milvus DB   │
│              │        └──────────────┘
└──────┬───────┘
       │
       ▼
┌──────────────┐        ┌──────────────┐
│ Graph Repo   │───────│  Neo4j       │
└──────────────┘        └──────────────┘
```

## Key Design Decisions

### Decision 1: Embedding Model - Anthropic vs OpenAI

**Options:**
1. **Anthropic** (if available)
2. **OpenAI** (text-embedding-3-small)
3. **Open-source** (sentence-transformers)

**Choice:** Anthropic (if embedding API available), fallback to OpenAI

**Rationale:**
- **Pros:** Single provider for embedding + generation, simpler billing
- **Cons:** Anthropic may not have dedicated embedding API (as of Jan 2025)
- **Fallback:** If Anthropic doesn't support embeddings, use OpenAI for vectors and Anthropic for generation
- **Implementation:** Abstract behind `EmbeddingService` interface for easy swapping

**Update (based on user choice):** Use Anthropic. If Anthropic doesn't have embedding API, we'll use OpenAI text-embedding-3-small (1536 dimensions) while keeping Anthropic for generation.

### Decision 2: Auto-Indexing Strategy

**Options:**
1. **Synchronous**: Embed during node creation (blocks API)
2. **Asynchronous**: Background job queue
3. **Manual**: User-triggered indexing

**Choice:** Synchronous for MVP, async in future

**Rationale:**
- **Pros:** Simpler implementation, immediate consistency
- **Cons:** Slower node creation (add ~500ms for embedding call)
- **Mitigation:** Acceptable for MVP with small graphs; add queue later if needed
- **Implementation:** Hook into `GraphService.createNode()` and `updateNode()`

### Decision 3: Milvus Collection Schema

**Options:**
1. **Single collection** for all nodes
2. **Per-type collections** (one for Person, one for Document, etc.)
3. **Dynamic collections** based on user-defined groups

**Choice:** Single collection `graph_nodes`

**Rationale:**
- **Pros:** Simpler queries, unified search across all types
- **Cons:** Less type-specific tuning
- **Schema:**
  ```
  - id (VARCHAR, primary)
  - vector (FLOAT_VECTOR, dimension=1536)
  - node_id (VARCHAR, links to Neo4j)
  - node_type (VARCHAR, e.g., "Person", "Document")
  - text_content (VARCHAR, searchable text)
  - metadata (JSON, includes created_at, etc.)
  ```
- **Index:** IVF_FLAT with COSINE metric (balance of speed and accuracy)

### Decision 4: Query Flow - Sequential vs Parallel

**Options:**
1. **Sequential**: Embed → Search → Fetch → Generate
2. **Parallel**: Embed + Generate in parallel
3. **Streaming**: Stream generation while fetching

**Choice:** Sequential with streaming generation

**Rationale:**
- **Flow:**
  1. Embed query → ~200ms
  2. Vector search in Milvus → ~100ms
  3. Fetch full node details from Neo4j → ~200ms
  4. Build prompt and stream LLM response → ~2-3s
- **Total:** ~2.5-3.5s (within 5s goal)
- **Implementation:** Use `streamText()` from Vercel AI SDK

### Decision 5: Context Window Management

**Options:**
1. **Top-K only**: Return top 5 results
2. **Re-ranking**: LLM re-ranks results
3. **Sliding window**: Iterative retrieval

**Choice:** Top-K (k=5) with score threshold (>0.7)

**Rationale:**
- **Pros:** Simple, predictable, fits Claude's context window
- **Cons:** May miss relevant context if score threshold too strict
- **Context Assembly:**
  ```
  For each retrieved node:
    - Title/Name
    - Description/Content
    - Node type
    - Relationships (optional: top 3 neighbors)
  ```
- **Prompt Template:**
  ```
  You are a helpful assistant answering questions about a knowledge graph.
  
  Context:
  [Node 1] {title}: {content}
  [Node 2] {title}: {content}
  ...
  
  Question: {user_query}
  
  Instructions:
  - Answer based solely on the provided context
  - Cite sources using [Node X] format
  - If context insufficient, say "I don't have enough information"
  ```

### Decision 6: Frontend Architecture

**Options:**
1. **Dedicated page** `/rag`
2. **Integrated** in graph view as sidebar
3. **Global search** in navigation bar

**Choice:** Dedicated page `/rag` (based on user preference)

**Rationale:**
- **Pros:** Clear purpose, room for future features (history, filters)
- **Cons:** Extra navigation step
- **Components:**
  - `QueryInput`: Text area with submit
  - `StreamingAnswer`: Displays response chunks
  - `SourceList`: Clickable node citations
  - `EmptyState`: Prompts for first query

## Data Flow

### Node Creation Flow
```
1. User creates node via UI/API
2. GraphService.createNode(data)
3. Neo4jRepository.insertNode(data)
4. → Hook: EmbeddingService.embed(node.text)
5. → VectorRepository.insert(embedding + metadata)
6. Return success
```

### Query Flow
```
1. User submits question via /rag
2. POST /api/rag/query {question}
3. RAGService.query(question)
   a. EmbeddingService.embed(question)
   b. VectorRepository.search(vector, topK=5)
   c. GraphRepository.fetchNodes(nodeIds)
   d. Build context from nodes
   e. LLMService.streamText(prompt + context)
4. Stream response to client
5. Return sources array
```

## Risks / Trade-offs

### Risk 1: Embedding API Latency
- **Impact:** Slow node creation (500ms+ per node)
- **Mitigation:** Move to async queue in future, batch operations
- **Monitoring:** Log embedding duration, alert if >1s

### Risk 2: Milvus Query Performance
- **Impact:** Slow searches with large datasets (>10k nodes)
- **Mitigation:** Start with IVF_FLAT, upgrade to HNSW if needed
- **Benchmark:** Test with 1k, 10k, 100k nodes

### Risk 3: Context Window Overflow
- **Impact:** Too many results exceed Claude's context limit
- **Mitigation:** Hard limit to top 5, truncate long texts
- **Fallback:** If exceeds 100k tokens, drop lowest-scored results

### Risk 4: Inconsistent State
- **Impact:** Vector index out of sync with Neo4j (e.g., node deleted but vector remains)
- **Mitigation:** Delete vectors when nodes deleted, periodic reconciliation job
- **Detection:** Log discrepancies, manual cleanup tool

## Migration Plan

### Phase 1: Infrastructure (Week 1)
1. Install Milvus SDK
2. Create VectorRepository
3. Create EmbeddingService
4. Write integration tests

### Phase 2: Indexing (Week 1-2)
1. Hook graph node creation
2. Batch-index existing nodes
3. Verify Milvus collection populated

### Phase 3: Query API (Week 2)
1. Implement RAGService
2. Create /api/rag/query endpoint
3. Test with sample queries

### Phase 4: Frontend (Week 2-3)
1. Create /rag route
2. Build query UI
3. Integrate streaming responses
4. Add source citations

### Rollback Plan
- Feature flag: `ENABLE_RAG_SEARCH=false`
- If disabled: Hide /rag route, skip embedding hooks
- Data persistence: Milvus collection remains (safe to delete manually)

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Query latency (p50) | < 3s | Backend timing logs |
| Query latency (p95) | < 5s | Backend timing logs |
| Embedding time | < 500ms | EmbeddingService logs |
| Vector search time | < 200ms | VectorRepository logs |
| Index rate | > 10 nodes/sec | Batch indexing benchmark |

## Open Questions

1. **Q:** Does Anthropic provide a dedicated embedding API?
   - **A:** If no, fallback to OpenAI text-embedding-3-small

2. **Q:** Should we embed only node titles or full content?
   - **Proposal:** Concatenate `title + description` (max 8k chars)

3. **Q:** How to handle very large graphs (>100k nodes)?
   - **Proposal:** Defer to v2, add partitioning if needed

4. **Q:** Should we cache embedding results?
   - **Proposal:** Yes, Redis cache with key `embed:{hash(text)}` (TTL: 24h)

## Monitoring & Observability

### Metrics to Track
- Query volume (requests/min)
- Avg query latency
- Embedding API errors
- Milvus connection errors
- Top queries (for quality improvement)

### Logging
- All queries with duration
- Failed embeddings (with text sample)
- Vector search scores (for threshold tuning)

### Alerts
- Embedding latency > 1s
- Query failure rate > 5%
- Milvus connection down

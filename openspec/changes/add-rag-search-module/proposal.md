# Change: Add RAG Search Module

## Why

Currently, Graph Mind can store and visualize knowledge graphs but lacks intelligent question-answering capabilities. Users cannot:
- Ask natural language questions about their knowledge graph
- Retrieve relevant information through semantic search
- Get AI-generated answers based on their graph data

This change introduces a **RAG (Retrieval-Augmented Generation) Search Module** that combines vector search with LLM generation to enable intelligent Q&A over the knowledge graph.

## What Changes

### Core Capabilities
- **Vector Embedding Service**: Automatic vectorization of graph nodes using Anthropic embeddings
- **Vector Storage**: Integration with Milvus for semantic search
- **RAG Query API**: Endpoint that retrieves relevant context and generates answers via LLM
- **Search UI**: Dedicated `/rag` page for natural language queries
- **Auto-indexing**: Automatically embed and index nodes when created/updated

### Technical Components
1. **Backend** (`apps/backend/src/modules/rag/`):
   - `embedding.service.ts`: Anthropic-based embedding generation
   - `rag.service.ts`: Orchestrates retrieval + generation
   - `rag.route.ts`: API endpoints (`POST /api/rag/query`)

2. **Infrastructure** (`apps/backend/src/infra/milvus/`):
   - Milvus client connection (already exists)
   - Collection management for graph node vectors

3. **Repositories** (`apps/backend/src/repositories/`):
   - `vector.repository.ts`: Milvus CRUD operations

4. **Frontend** (`apps/web/src/routes/rag/`):
   - Query input interface
   - Streaming answer display
   - Source citations (linked to graph nodes)

### Constraints (MVP Scope)
- **Document Types**: Graph nodes only (no file uploads in v1)
- **Retrieval Strategy**: Simple vector similarity (no hybrid search yet)
- **Model**: Anthropic Claude for both embedding and generation
- **Index**: Single collection for all node types

## Impact

### Affected Specs
- **NEW**: `rag-search` capability (ADDED requirements)

### Affected Code
- New module: `apps/backend/src/modules/rag/`
- New repository: `apps/backend/src/repositories/vector.repository.ts`
- New route: `apps/web/src/routes/rag/`
- Modified: Graph module (add embedding hook on node creation)

### Dependencies
- Requires `implement-graph-module` to be complete
- Requires Milvus running and configured

### Breaking Changes
None. This is a new module with new endpoints.

## Success Criteria

1. ✅ Graph nodes are automatically vectorized on creation/update
2. ✅ Vectors stored in Milvus with node metadata
3. ✅ `POST /api/rag/query` endpoint accepts questions and returns streaming answers
4. ✅ Answers cite source nodes from the graph
5. ✅ `/rag` page provides a clean query interface
6. ✅ Response time < 5s for typical queries

## Future Enhancements (Out of Scope for MVP)

- Document upload and processing
- Hybrid search (vector + graph traversal)
- Re-ranking algorithms
- Multi-collection support
- Query history and saved searches
- Advanced visualization of retrieval results

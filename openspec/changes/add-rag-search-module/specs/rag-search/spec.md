## ADDED Requirements

### Requirement: Automatic Node Vectorization
The system SHALL automatically generate vector embeddings for graph nodes when they are created or updated.

#### Scenario: Node creation triggers embedding
- **WHEN** a user creates a new graph node with text content
- **THEN** the system generates a vector embedding and stores it in Milvus

#### Scenario: Node update triggers re-embedding
- **WHEN** a user updates a graph node's text content
- **THEN** the system regenerates the vector embedding and updates Milvus

#### Scenario: Node deletion removes vector
- **WHEN** a user deletes a graph node
- **THEN** the system removes the corresponding vector from Milvus

### Requirement: Natural Language Query
The system SHALL accept natural language questions and return AI-generated answers based on the knowledge graph.

#### Scenario: Valid question returns answer
- **WHEN** a user submits a question via the RAG query endpoint
- **THEN** the system returns a structured response with an answer and source citations

#### Scenario: No matching results
- **WHEN** a user submits a question with no relevant graph nodes
- **THEN** the system returns a message indicating insufficient information

### Requirement: Vector Similarity Search
The system SHALL retrieve relevant graph nodes using vector similarity search.

#### Scenario: Query vectorization
- **WHEN** a user submits a question
- **THEN** the system converts the question to a vector embedding

#### Scenario: Top-K retrieval
- **WHEN** the system searches for relevant nodes
- **THEN** it returns the top 5 most similar nodes based on cosine similarity

#### Scenario: Score threshold filtering
- **WHEN** the system retrieves similar nodes
- **THEN** it filters results to only include nodes with similarity score > 0.7

### Requirement: Context-Aware Generation
The system SHALL generate answers using retrieved graph nodes as context.

#### Scenario: Answer generation with context
- **WHEN** relevant nodes are retrieved
- **THEN** the system builds a context prompt and generates an answer using the LLM

#### Scenario: Source citation
- **WHEN** the system generates an answer
- **THEN** it includes citations referencing the source nodes used

### Requirement: Streaming Responses
The system SHALL support streaming text generation for improved user experience.

#### Scenario: Streaming answer chunks
- **WHEN** a user requests a RAG query with streaming enabled
- **THEN** the system streams answer chunks in real-time as they are generated

#### Scenario: Source list after streaming
- **WHEN** streaming completes
- **THEN** the system returns the list of source nodes

### Requirement: Query Interface
The system SHALL provide a dedicated web interface for RAG queries.

#### Scenario: RAG page access
- **WHEN** a user navigates to `/rag`
- **THEN** the system displays the query interface

#### Scenario: Question submission
- **WHEN** a user enters a question and submits
- **THEN** the system displays a streaming answer with source citations

#### Scenario: Source navigation
- **WHEN** a user clicks on a source citation
- **THEN** the system navigates to the corresponding node in the graph view

### Requirement: Error Handling
The system SHALL gracefully handle errors and provide clear feedback.

#### Scenario: Embedding API failure
- **WHEN** the embedding API is unavailable
- **THEN** the system returns a clear error message

#### Scenario: Milvus connection failure
- **WHEN** Milvus is unavailable
- **THEN** the system returns an error and logs the failure

#### Scenario: LLM timeout
- **WHEN** the LLM takes longer than 30 seconds to respond
- **THEN** the system returns a timeout error

### Requirement: Performance
The system SHALL respond to RAG queries within acceptable time limits.

#### Scenario: Query latency target
- **WHEN** a user submits a typical question
- **THEN** the system returns the first answer chunk within 3 seconds (p50)

#### Scenario: Maximum latency
- **WHEN** a user submits any question
- **THEN** the system completes the response within 5 seconds (p95)

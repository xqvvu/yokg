# Compute Service

A stateless compute service for AI/RAG operations, designed as a Function-as-a-Service (FaaS) layer.

## Overview

This service provides pure, stateless compute functions for AI-powered knowledge processing. It operates independently of application state, focusing solely on transforming inputs to outputs.

## Planned Stack

- **Framework**: [Litestar](https://litestar.dev/) - Fast, modern Python API framework
- **RAG**: [LightRAG](https://github.com/HKUDS/LightRAG) - Lightweight RAG implementation
- **Chunking**: [Chonkie](https://github.com/chonkie-ai/chonkie) - Text chunking for RAG
- **Processing**: [RAG-Anything](https://github.com/NeumTry/RAG-Anything) - Multimodal RAG processing

## Design Principles

- **Stateless**: No persistent state; all data passed as inputs/outputs
- **Pure Functions**: Predictable, testable compute operations
- **FaaS-like**: Similar to serverless functions, easy to scale horizontally
- **Isolated**: Decoupled from main application logic and database

## Development

```bash
# Install dependencies
just install

# Start development server
just dev
```

## Status

This service is in early planning stages. Implementation details will be added as development progresses.

# Change: Implement Multi-Provider Object Storage Interface

## Why
The current storage system has an interface defined but all provider implementations (AWS S3, MinIO, R2, etc.) are stubs. We need a production-ready, DAL-style storage abstraction that provides simple CRUD operations for object storage across multiple providers with fail-fast error handling.

## What Changes
- **BREAKING**: Replace existing stub storage implementations with working ones
- Implement complete IStorage interface with CRUD operations for object storage
- Add multi-provider support with easy switching between AWS S3, MinIO, RustFS, etc.
- Create provider-specific error types with detailed error information
- Add configuration management for storage providers
- Implement proper connection handling and resource management

## Impact
- Affected specs: storage (new capability)
- Affected code:
  - `infra/storage/interface.ts` (update)
  - `infra/storage/providers/*` (implement)
  - `infra/storage/factory.ts` (implement)
  - Configuration files (add storage settings)
  - Error handling system (extend)
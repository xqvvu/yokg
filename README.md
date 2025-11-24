# Graph Mind

[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)

Graph Mind is a RAG (Retrieval-Augmented Generation) enhanced Knowledge Graph system that integrates structured data (Knowledge Graph) with unstructured data (LLM/RAG) to provide intelligent information retrieval and reasoning capabilities.

## Features

- **Knowledge Graph Management**: Visualize and query complex interconnected data relationships
- **RAG Integration**: Hybrid search combining semantic (vector) and structural (graph) retrieval
- **Intelligent Reasoning**: AI-powered knowledge discovery and context-aware responses
- **Modern Architecture**: Built with TypeScript, React, and cutting-edge web technologies

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Development](#development)
- [Available Commands](#available-commands)
- [Docker Deployment](#docker-deployment)
- [Configuration](#configuration)
- [Contributing](#contributing)

## Tech Stack

### Core Technologies
- **Language**: TypeScript
- **Runtime**: Node.js ^24
- **Package Manager**: pnpm workspace
- **Monorepo Management**: Turborepo
- **Code Quality**: Biome (linting, formatting, import organization)
- **Git Hooks**: Lefthook

### Backend (`apps/backend`)
- **Framework**: Hono (Node.js adapter)
- **Authentication**: Better Auth
- **Database (Relational)**: PostgreSQL with Drizzle ORM
- **Database (Graph)**: Neo4j (Planned)
- **Cache/KV Store**: Redis
- **AI/RAG**: Vercel AI SDK (`ai`)
- **Validation**: Zod
- **Logging**: Logtape
- **Testing**: Vitest

### Frontend (`apps/web`)
- **Framework**: React 19
- **Build Tool**: Vite
- **Routing**: TanStack Router
- **Data Fetching**: TanStack Query
- **Forms**: TanStack Form
- **Styling**: Tailwind CSS v4
- **Testing**: Vitest, React Testing Library

### Shared Packages (`packages/`)
- **Utilities**: `es-toolkit`, `date-fns`
- **HTTP Client**: Ky (via `@gd/ky`)
- **Schema/Validation**: Zod (via `@gd/shared`)

## Project Structure

```
graph-mind/
├── apps/
│   ├── web/              # React frontend application (Vite + TanStack)
│   └── backend/          # Hono API server with auth and database
├── packages/
│   ├── shared/           # Shared types, schemas, and validation
│   └── ky/               # HTTP client wrappers (Ky)
├── openspec/             # OpenSpec configuration and agents
├── Justfile              # Just command runner (recommended)
├── Makefile              # GNU Make alternative
└── compose.yml           # Docker Compose for services
```

## Prerequisites

- **Node.js** 24 or higher (compatible with `^24`)
- **pnpm** 10.23.0 or higher
- **Docker** and **Docker Compose** (for PostgreSQL, Redis, and Neo4j services)
- **Just** (recommended) or **Make** for running commands

### Installing Just

```bash
# macOS
brew install just

# Linux
curl --proto '=https' --tlsv1.2 -sSf https://just.systems/install.sh | bash

# Cargo
cargo install just

# For other platforms, see: https://github.com/casey/just
```

## Quick Start

### Option 1: Automated Setup (Recommended)

```bash
# Clone the repository
git clone <repository-url>
cd gd

# Run complete setup (installs deps, starts services, migrates DB)
just setup
# or
make setup
```

### Option 2: Manual Setup

#### 1. Install Dependencies

```bash
pnpm install
```

#### 2. Environment Configuration

```bash
# Copy environment templates
cp apps/backend/.env.template apps/backend/.env
cp apps/web/.env.template apps/web/.env
```

Edit the environment files:

**Backend (`apps/backend/.env`):**
```env
PORT=10001
DATABASE_URL="postgres://postgres:mypassword@localhost:5432/gd"
BETTER_AUTH_SECRET=<run: just backend-auth-secret>
BETTER_AUTH_URL="http://localhost:10001"
CORS_ALLOWED_ORIGINS="http://localhost:10000"
```

**Frontend (`apps/web/.env`):**
```env
VITE_API_BASE_URL="http://localhost:10001"
```

#### 3. Start Services

```bash
# Start PostgreSQL
just compose-up

# Generate auth secret
just backend-auth-secret

# Generate and apply database migrations
just db-generate
just db-migrate

#### 4. Start Development

```bash
just dev
```

Open your browser:
- Frontend: http://localhost:10000
- Backend API: http://localhost:10001

## Development

### Command Reference

Use `just --list` to see all available commands grouped by category.

#### Development Commands

```bash
just dev              # Start all development servers
just dev-backend      # Start backend only
just dev-web          # Start web only
just install          # Install dependencies
just clean            # Clean build artifacts and node_modules
```

#### Build Commands

```bash
just build            # Build all apps
just build-backend    # Build backend only
just build-web        # Build web only
```

#### Code Quality

```bash
just check            # Run biome check and auto-fix
just lint             # Run linter
just check-types      # Type check all packages
just test             # Run tests
```

#### Database Operations

```bash
just db-generate      # Generate database schema and migrations
just db-migrate       # Apply database migrations
```

#### Docker Compose

```bash
just compose-up       # Start PostgreSQL
just compose-down     # Stop services
just compose-logs     # View logs
just compose-clean    # Stop and clean data
```

#### Docker Build and Run

```bash
just docker-build-backend    # Build backend image
just docker-build-web        # Build web image
just docker-build-all        # Build all images

just docker-run-backend      # Run backend container
just docker-run-web          # Run web container

just docker-stop-backend     # Stop backend container
just docker-stop-web         # Stop web container

just docker-logs-backend     # View backend logs
just docker-logs-web         # View web logs

just docker-clean            # Remove all gd containers/images
```

#### Backend Specific

```bash
just backend-auth-secret          # Generate better-auth secret
just backend-drizzle-generate     # Generate drizzle migrations
just backend-drizzle-migrate      # Run drizzle migrations
just backend-start                # Start in production mode
```

#### Web Specific

```bash
just web-start        # Start in production mode
```

#### Workflows

```bash
just setup            # Complete setup: install, start services, migrate
just reset            # Reset everything: clean data and dependencies
```

### Development Workflow

#### When modifying database schema:

1. Edit schema files in `packages/shared/src/` (schemas, tables)
2. Run `just db-generate` to create migrations with Drizzle
3. Run `just db-migrate` to apply migrations
4. Verify changes in the database

#### When adding new API routes:

1. Create a new module in `apps/backend/src/modules/`
2. Define routes with Hono and Zod validation
3. Export the router
4. Mount it in `apps/backend/src/app.ts`

#### When adding shared code:

- **Types/Schemas**: Add to `packages/shared/`
- **HTTP Utilities**: Add to `packages/ky/`
- **Validation**: Update shared schemas in `packages/shared/src/validate/`

#### Git Hooks

Lefthook automatically runs on:
- **pre-commit**: Biome format and lint
- Configure in `lefthook.yml`

## Docker Deployment

### Building Images

The project includes optimized multi-stage Dockerfiles for both apps using Node.js 24.11.0.

```bash
# Build both images
just docker-build-all

# Or build individually
just docker-build-backend
just docker-build-web
```

### Running Containers

```bash
# Run backend (requires .env file)
just docker-run-backend

# Run web
just docker-run-web

# View logs
just docker-logs-backend
just docker-logs-web
```

### Docker Features

- Multi-stage builds for minimal image size
- Alpine Linux base (Node.js 24-alpine)
- Non-root user for security
- Optimized layer caching
- `.dockerignore` for reduced build context
- Separate builds for frontend (Vite) and backend (Hono)

### Production Deployment

For production, use Docker Compose or Kubernetes:

```bash
# Example: Build and push to registry
docker build -t your-registry/gd-backend:latest apps/backend
docker build -t your-registry/gd-web:latest apps/web
docker push your-registry/gd-backend:latest
docker push your-registry/gd-web:latest
```

## Configuration

### Default Ports

- **Frontend**: 10000
- **Backend API**: 10001
- **PostgreSQL**: 5432 (mapped from compose)

### Environment Variables

See `.env.template` files in each app directory for complete configuration options.

**Key Backend Variables:**
- `PORT` - Server port (default: 10001)
- `DATABASE_URL` - PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Authentication secret (generate with CLI)
- `BETTER_AUTH_URL` - Backend base URL
- `CORS_ALLOWED_ORIGINS` - Comma-separated allowed origins
- `Locale` - Default locale (e.g., "en-US")
- `TZ` - Timezone (e.g., "America/Los_Angeles")

**Key Frontend Variables:**
- `VITE_API_BASE_URL` - Backend API URL

### Biome Configuration

Located in `biome.json` at the root:
- **Line width**: 80 characters
- **Indent**: 2 spaces, tabs in JSON
- **Quote style**: Double quotes
- **Import sorting**: Enabled
- **Formatter**: Enabled for most files
- **Linter**: Recommended rules enabled

### Turborepo Configuration

Located in `turbo.json`:
- Build caching enabled
- Dependency-based task orchestration
- Outputs: `dist/**` (backend), `dist/**` (web)
- Persistent dev tasks
- Environment-based caching

## Contributing

### Code Style

- Use TypeScript for all new code with strict type checking
- Follow Biome formatting rules (runs on save and pre-commit)
- Use conventional commits (feat:, fix:, docs:, etc.)
- Keep functions small and focused
- Prefer composition over inheritance

### Architecture Guidelines

- **Backend**: Follow modular/layered architecture with domain-specific modules
- **Frontend**: Use file-based routing with TanStack Router and atomic design principles
- **Shared Code**: Place reusable types, schemas, and utilities in `packages/`
- **Database**: Use Drizzle migrations for all schema changes

### Testing

```bash
# Run all tests
just test

# Run tests with watch mode
cd apps/backend
pnpm test

# Run tests with UI (if configured)
pnpm test:ui
```

### Pull Requests

1. Create a feature branch from `main`
2. Make your changes following the architecture guidelines
3. Ensure `just check` and `just test` pass
4. Update documentation if needed
5. Commit with conventional commit messages
6. Push and open a PR with clear description

### Project Commands

All commands should be run from the project root using `just` (recommended) or `make`.

**Note**: The `Makefile` provides the same functionality as `Justfile` but `just` is recommended for better syntax, performance, and error messages.

## License

MIT License - see LICENSE file for details.

## Architecture Overview

Graph Mind follows a hybrid architecture combining:

- **Knowledge Graph**: Nodes represent entities (Person, Concept, Document), edges represent relationships (AUTHOR_OF, RELATED_TO)
- **RAG System**: Hybrid search strategy combining Vector Search (semantic) and Graph Traversal (structural)
- **Context Management**: Efficient context window management for LLMs with embedding generation

## Roadmap

- [ ] Neo4j integration for graph database functionality
- [ ] Vector database integration for semantic search
- [ ] AI-powered knowledge extraction and linking
- [ ] Interactive graph visualization interface
- [ ] Advanced query interface with natural language
- [ ] Real-time collaboration features

## Support

For issues, questions, or contributions, please open an issue on GitHub.

---

**Quick Reference:**

```bash
# First time setup
just setup

# Daily development
just dev

# Before committing
just check && just test

# Reset everything
just reset
```

For detailed command documentation, run `just --list`.

<div align="center">
  <img src="assets/brand/mascot.png" alt="YOKG Mascot" width="400"/>

  <h1>You Only Query Knowledge Graph for RAG</h1>
</div>

[![Checked with Biome](https://img.shields.io/badge/Checked_with-Biome-60a5fa?style=flat&logo=biome)](https://biomejs.dev)

> [!NOTE]
> This project is in early development. Many features are still in progress.

<br/>

YOKG (You Only Query Knowledge Graph for RAG) is a RAG enhanced Knowledge Graph system that integrates structured data (Knowledge Graph) with unstructured data (LLM/RAG) to provide intelligent information retrieval and reasoning capabilities.

## Tech Stack

- **Frontend**: React 19, TanStack Start, Tailwind CSS v4
- **Backend**: Hono, Better Auth, Drizzle ORM
- **Database**: PostgreSQL, Redis (Neo4j planned)
- **AI/RAG**: Vercel AI SDK
- **Tools**: TypeScript, pnpm workspace, Turborepo, Biome

## Prerequisites

- Node.js 24+
- pnpm 10.23.0+
- Docker & Docker Compose
- Just (recommended) or Make

## Quick Start

```bash
# Install dependencies and start services
just setup

# Start development servers
just dev
```

Visit:
- Frontend: http://localhost:10000
- Backend: http://localhost:10001

## Common Commands

```bash
# Development
just dev              # Start all dev servers
just check            # Lint and format code
just test             # Run tests

# Database
just db-generate      # Generate migrations
just db-migrate       # Apply migrations

# Docker
just compose-up       # Start services
just compose-down     # Stop services
```

Run `just --list` for all available commands.

## License

MIT License - see LICENSE file for details.

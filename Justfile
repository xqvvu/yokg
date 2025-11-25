# Justfile for graph-mind project
# Run `just --list` to see all available commands
# Variables

docker_compose_dir := "apps/backend"
backend_dir := "apps/backend"
web_dir := "apps/web"

# Default recipe (shows help)
default:
    @just --list

##################################################
# Development
##################################################

# Start development servers
[group('development')]
dev:
    NODE_ENV=development pnpm run dev

# Start backend in dev mode
[group('development')]
dev-backend:
    cd {{ backend_dir }} && NODE_ENV=development pnpm run dev

# Start web in dev mode
[group('development')]
dev-web:
    cd {{ web_dir }} && NODE_ENV=development pnpm run dev

# Install dependencies
[group('development')]
install:
    pnpm install

# Clean build artifacts and dependencies
[group('development')]
clean:
    rm -rf node_modules apps/*/node_modules packages/*/node_modules
    rm -rf apps/*/.next apps/*/dist apps/*/.turbo .turbo
    @echo "✓ Cleaned all build artifacts and dependencies"

##################################################
# Build
##################################################

# Build all apps
[group('build')]
build:
    pnpm run build

# Build backend app
[group('build')]
build-backend:
    cd {{ backend_dir }} && pnpm run build

##################################################
# Quality
##################################################

# Run biome check and fix
[group('quality')]
check-biome:
    pnpm run check:biome

##################################################
# Docker Compose
##################################################

# Start docker compose services (postgres)
[group('compose')]
compose-up:
    docker compose -f {{ docker_compose_dir }}/compose.local.yml up -d --wait
    @echo "✓ Services started"

# Stop docker compose services (keeps containers)
[group('compose')]
compose-stop:
    docker compose -f {{ docker_compose_dir }}/compose.local.yml stop
    @echo "✓ Services stopped"

# Stop and remove docker compose services
[group('compose')]
compose-down:
    docker compose -f {{ docker_compose_dir }}/compose.local.yml down
    @echo "✓ Services stopped and removed"

# View docker compose logs
[group('compose')]
compose-logs:
    docker compose -f {{ docker_compose_dir }}/compose.local.yml logs -f

# Stop services and clean data
[group('compose')]
compose-clean: compose-down
    rm -rf {{ docker_compose_dir }}/.docker
    @echo "✓ Services stopped and data cleaned"

##################################################
# Test Infrastructure
##################################################

# Start test database services and wait for health checks
[group('test')]
test-compose-up:
    docker compose --env-file {{ docker_compose_dir }}/.env.test -f {{ docker_compose_dir }}/compose.test.yml up -d --wait
    @echo "✓ Test services started and healthy (postgres: 5433, redis: 6380)"

# Stop test database services
[group('test')]
test-compose-down:
    docker compose -f {{ docker_compose_dir }}/compose.test.yml down
    @echo "✓ Test services stopped"

# Clean test database data
[group('test')]
test-compose-clean: test-compose-down
    rm -rf {{ docker_compose_dir }}/.docker/.test
    @echo "✓ Test data cleaned"

# Run unit tests (fast, no database required)
[group('test')]
test-unit:
    pnpm test --project backend:unit --project shared
    @echo "✓ Unit tests completed"

# Run integration tests (with auto cleanup)
[group('test')]
test-integration:
    #!/usr/bin/env bash
    set -e
    just test-compose-up
    trap "just test-compose-down" EXIT
    cd {{ backend_dir }} && pnpm test:integration
    echo "✓ Integration tests completed"

# Run all tests (unit + integration, with auto cleanup)
[group('test')]
test:
    #!/usr/bin/env bash
    set -e
    echo "Running unit tests..."
    just test-unit
    echo ""
    echo "Running integration tests..."
    just test-integration
    echo "✓ All tests completed"

# Run tests in watch mode (keeps services running)
[group('test')]
test-watch: test-compose-up
    pnpm test

# Run tests with UI (keeps services running)
[group('test')]
test-ui: test-compose-up
    pnpm test --ui

# Run tests with coverage (with auto cleanup)
[group('test')]
test-coverage:
    #!/usr/bin/env bash
    set -e
    just test-compose-up
    trap "just test-compose-down" EXIT
    pnpm test --run --coverage
    echo "✓ Coverage report generated"

##################################################
# Docker Build
##################################################

# Build backend docker image
[group('docker')]
docker-build-backend:
    docker build -t graph-mind-backend:latest {{ backend_dir }}
    @echo "✓ Backend image built: graph-mind-backend:latest"

# Run backend container
[group('docker')]
docker-run-backend:
    docker run -d --name graph-mind-backend -p 3000:3000 --env-file {{ backend_dir }}/.env graph-mind-backend:latest
    @echo "✓ Backend running on http://localhost:3000"

# Stop backend container
[group('docker')]
docker-stop-backend:
    docker stop graph-mind-backend
    docker rm graph-mind-backend
    @echo "✓ Backend stopped"

# View backend container logs
[group('docker')]
docker-logs-backend:
    docker logs -f graph-mind-backend

# Remove all graph-mind docker images and containers
[group('docker')]
docker-clean:
    #!/usr/bin/env bash
    set -euo pipefail
    docker ps -a | grep graph-mind | awk '{print $1}' | xargs -r docker rm -f 2>/dev/null || true
    docker images | grep graph-mind | awk '{print $3}' | xargs -r docker rmi -f 2>/dev/null || true
    echo "✓ All graph-mind containers and images removed"

##################################################
# Database
##################################################

# Generate database schema
[group('database')]
db-generate: backend-drizzle-generate

# Run database migrations
[group('database')]
db-migrate: backend-drizzle-migrate

##################################################
# Backend
##################################################

# Generate better-auth secret
[group('backend')]
backend-auth-secret:
    pnpx @better-auth/cli secret

# Generate drizzle schema and migrations
[group('backend')]
backend-drizzle-generate:
    #!/usr/bin/env bash
    set -euo pipefail
    cd {{ backend_dir }}
    npx @better-auth/cli@latest generate -y --config="src/lib/auth.ts" --output="../../packages/shared/src/tables/auth.ts"
    pnpm biome check --write "../../packages/shared/src/tables/auth.ts"
    npx drizzle-kit generate
    echo "✓ Schema generated"

# Run drizzle migrations
[group('backend')]
backend-drizzle-migrate:
    cd {{ backend_dir }} && npx drizzle-kit migrate
    @echo "✓ Migrations applied"

# Start backend in production mode
[group('backend')]
backend-start:
    cd {{ backend_dir }} && pnpm run start

##################################################
# Scripts
##################################################

# Clean node_modules recursively
[group('scripts')]
script-clean-node-modules:
    node scripts/clean-node-modules.js

# Verify error translations
[group('scripts')]
script-verify-error-translations:
    node scripts/verify-error-translations.js

##################################################
# All-in-One
##################################################

# Complete setup: install, start services, migrate
[group('workflows')]
setup: install compose-up db-migrate
    @echo "✓ Setup complete! Run 'just dev' to start development"

# Reset everything: clean data, dependencies, reinstall
[group('workflows')]
reset: compose-clean clean install
    @echo "✓ Reset complete!"

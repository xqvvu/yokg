.DEFAULT_GOAL := help
.PHONY: help dev dev-backend install clean build build-backend check compose-up compose-stop compose-down compose-logs compose-clean test-compose-up test-compose-down test-compose-clean test-unit test-integration test test-watch test-ui test-coverage docker-build-backend docker-run-backend docker-stop-backend docker-logs-backend docker-clean db-generate db-migrate backend-auth-secret backend-drizzle-generate backend-drizzle-migrate backend-start script-clean-node-modules script-verify-error-translations setup reset

# Variables
DOCKER_COMPOSE_DIR := apps/backend
BACKEND_DIR := apps/backend
WEB_DIR := apps/web

# Use bash for shell
SHELL := /bin/bash
.ONESHELL:

help: ## Show this help message
	@echo "Usage: make [target]"
	@echo ""
	@echo "Available targets:"
	@grep -E '^[a-zA-Z0-9_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-35s\033[0m %s\n", $$1, $$2}'

##################################################
# Development
##################################################

dev: ## Start development servers
	NODE_ENV=development pnpm run dev

dev-backend: ## Start backend in dev mode
	cd $(BACKEND_DIR) && NODE_ENV=development pnpm run dev

dev-web:
	cd $(WEB_DIR) && NODE_ENV=development pnpm run dev

install: ## Install dependencies
	pnpm install

clean: ## Clean build artifacts and dependencies
	rm -rf node_modules apps/*/node_modules packages/*/node_modules
	rm -rf apps/*/.next apps/*/dist apps/*/.turbo .turbo
	@echo "✓ Cleaned all build artifacts and dependencies"

##################################################
# Build
##################################################

build: ## Build all apps
	pnpm run build

build-backend: ## Build backend app
	cd $(BACKEND_DIR) && pnpm run build

##################################################
# Quality
##################################################

check: ## Run biome check and fix
	pnpm run check

##################################################
# Docker Compose
##################################################

compose-up: ## Start docker compose services (postgres)
	docker compose -f $(DOCKER_COMPOSE_DIR)/compose.local.yml up -d --wait
	@echo "✓ Services started"

compose-stop: ## Stop docker compose services (keeps containers)
	docker compose -f $(DOCKER_COMPOSE_DIR)/compose.local.yml stop
	@echo "✓ Services stopped"

compose-down: ## Stop and remove docker compose services
	docker compose -f $(DOCKER_COMPOSE_DIR)/compose.local.yml down
	@echo "✓ Services stopped and removed"

compose-logs: ## View docker compose logs
	docker compose -f $(DOCKER_COMPOSE_DIR)/compose.local.yml logs -f

compose-clean: compose-down ## Stop services and clean data
	rm -rf $(DOCKER_COMPOSE_DIR)/.docker
	@echo "✓ Services stopped and data cleaned"

##################################################
# Test Infrastructure
##################################################

test-compose-up: ## Start test database services and wait for health checks
	docker compose --env-file $(DOCKER_COMPOSE_DIR)/.env.test -f $(DOCKER_COMPOSE_DIR)/compose.test.yml up -d --wait
	@echo "✓ Test services started and healthy (postgres: 5433, redis: 6380)"

test-compose-down: ## Stop test database services
	docker compose -f $(DOCKER_COMPOSE_DIR)/compose.test.yml down
	@echo "✓ Test services stopped"

test-compose-clean: test-compose-down ## Clean test database data
	rm -rf $(DOCKER_COMPOSE_DIR)/.docker/.test
	@echo "✓ Test data cleaned"

test-unit: ## Run unit tests (fast, no database required)
	pnpm test --project backend:unit --project shared
	@echo "✓ Unit tests completed"

test-integration: ## Run integration tests (with auto cleanup)
	set -e
	$(MAKE) test-compose-up
	trap "$(MAKE) test-compose-down" EXIT
	cd $(BACKEND_DIR) && pnpm test:integration
	echo "✓ Integration tests completed"

test: ## Run all tests (unit + integration, with auto cleanup)
	set -e
	echo "Running unit tests..."
	$(MAKE) test-unit
	echo ""
	echo "Running integration tests..."
	$(MAKE) test-integration
	echo "✓ All tests completed"

test-watch: test-compose-up ## Run tests in watch mode (keeps services running)
	pnpm test

test-ui: test-compose-up ## Run tests with UI (keeps services running)
	pnpm test --ui

test-coverage: ## Run tests with coverage (with auto cleanup)
	set -e
	$(MAKE) test-compose-up
	trap "$(MAKE) test-compose-down" EXIT
	pnpm test --run --coverage
	echo "✓ Coverage report generated"

##################################################
# Docker Build
##################################################

docker-build-backend: ## Build backend docker image
	docker build -t yokg-backend:latest $(BACKEND_DIR)
	@echo "✓ Backend image built: yokg-backend:latest"

docker-run-backend: ## Run backend container
	docker run -d --name yokg-backend -p 3000:3000 --env-file $(BACKEND_DIR)/.env yokg-backend:latest
	@echo "✓ Backend running on http://localhost:3000"

docker-stop-backend: ## Stop backend container
	docker stop yokg-backend
	docker rm yokg-backend
	@echo "✓ Backend stopped"

docker-logs-backend: ## View backend container logs
	docker logs -f yokg-backend

docker-clean: ## Remove all yokg docker images and containers
	set -euo pipefail
	docker ps -a | grep yokg | awk '{print $$1}' | xargs -r docker rm -f 2>/dev/null || true
	docker images | grep yokg | awk '{print $$3}' | xargs -r docker rmi -f 2>/dev/null || true
	echo "✓ All yokg containers and images removed"

##################################################
# Database
##################################################

db-generate: backend-drizzle-generate ## Generate database schema

db-migrate: backend-drizzle-migrate ## Run database migrations

##################################################
# Backend
##################################################

backend-auth-secret: ## Generate better-auth secret
	pnpx @better-auth/cli secret

backend-drizzle-generate: ## Generate drizzle schema and migrations
	set -euo pipefail
	cd $(BACKEND_DIR)
	npx @better-auth/cli@latest generate -y --config="src/lib/auth.ts" --output="../../packages/shared/src/tables/auth.ts"
	pnpm biome check --write "../../packages/shared/src/tables/auth.ts"
	npx drizzle-kit generate
	echo "✓ Schema generated"

backend-drizzle-migrate: ## Run drizzle migrations
	cd $(BACKEND_DIR) && npx drizzle-kit migrate
	@echo "✓ Migrations applied"

backend-start: ## Start backend in production mode
	cd $(BACKEND_DIR) && pnpm run start

##################################################
# Scripts
##################################################

script-clean-node-modules: ## Clean node_modules recursively
	node scripts/clean-node-modules.js

script-verify-error-translations: ## Verify error translations
	node scripts/verify-error-translations.js

##################################################
# All-in-One
##################################################

setup: install compose-up db-migrate ## Complete setup: install, start services, migrate
	@echo "✓ Setup complete! Run 'make dev' to start development"

reset: compose-clean clean install ## Reset everything: clean data, dependencies, reinstall
	@echo "✓ Reset complete!"

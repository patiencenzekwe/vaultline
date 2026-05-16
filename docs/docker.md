# Vaultline Docker Architecture

## Overview

Vaultline uses Docker for containerisation across all
environments. Every service runs in an isolated container
with the minimum permissions required to operate.

## Multi-Stage Build

The backend Dockerfile uses two stages:

Stage 1 — Builder
Installs production npm dependencies using npm ci for
reproducible installs. This stage contains npm, build
tools, and cache — none of which belong in production.

Stage 2 — Production
Starts from a fresh Node 24 Alpine image. Copies only
the node_modules from the builder stage. Copies
application source code. Removes any .env file. Switches
to a non-root user. The final image contains only what
is needed to run the application.

## Security Controls

Non-root execution: All containers run as the vaultline
user with UID 1001. Root access is never granted inside
any container.

Secret exclusion: The .dockerignore file prevents .env
from entering the build context. The Dockerfile
additionally removes any .env with rm -f as a second
layer of protection.

Minimal attack surface: Alpine Linux base images contain
only the packages required to run Node.js — no shell
utilities, package managers, or debugging tools in
production images.

Health checks: Every container includes a HEALTHCHECK
instruction. Kubernetes uses this to determine pod health
and automatically restart unhealthy containers.

## Local Development

docker-compose.dev.yml provides the local development
environment with:

PostgreSQL 18 Alpine database with automatic schema
initialisation from schema.sql on first startup.

Port mapping exposes PostgreSQL on localhost:5432 for
direct database inspection during development.

Named volumes persist database data between container
restarts — data is not lost when containers stop.

## Image Naming

Local development: vaultline-backend:latest
Staging: ECR_URL/vaultline-backend:COMMIT_SHA
Production: ECR_URL/vaultline-backend:COMMIT_SHA

Images are tagged with the Git commit SHA in all
non-local environments — providing complete traceability
between deployed images and source code.

## Commands

Build the backend image:
docker build -t vaultline-backend:latest backend/

Start local development environment:
docker compose -f docker-compose.dev.yml up -d

Stop local development environment:
docker compose -f docker-compose.dev.yml down

View container logs:
docker logs vaultline-backend

Inspect running containers:
docker compose -f docker-compose.dev.yml ps
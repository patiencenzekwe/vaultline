# Vaultline Docker Architecture

## Overview

Vaultline uses Docker for containerisation across all
environments. Every service runs in an isolated container
with the minimum permissions required to operate.

## Multi-Stage Build

The backend Dockerfile uses two stages.

Stage 1 is the builder stage. It installs production npm
dependencies using `npm ci` for reproducible installs. This
stage contains npm, build tools, and cache. None of these
belong in production.

Stage 2 is the production stage. It starts from a fresh
Node 24 Alpine image, copies only the `node_modules` from
the builder stage, copies application source code, removes
any `.env` file, and switches to a non-root user. The final
image contains only what is needed to run the application.

## Security Controls

**Non-root execution.** All containers run as the vaultline
user with UID 1001. Root access is never granted inside
any container.

**Secret exclusion.** The `.dockerignore` file prevents `.env`
from entering the build context. The Dockerfile also
removes any `.env` with `rm -f` as a second layer of
protection.

**Minimal attack surface.** Alpine Linux base images contain
only the packages required to run Node.js. No shell
utilities, package managers, or debugging tools are
included in production images.

**Health checks.** Every container includes a `HEALTHCHECK`
instruction. Kubernetes uses this to determine pod health
and automatically restart unhealthy containers.

## Local Development

`docker-compose.dev.yml` provides the local development
environment with the following services.

PostgreSQL Alpine database with port mapping exposing
PostgreSQL on `localhost:5432` for direct database
inspection during development.

Named volumes persist database data between container
restarts. Data is not lost when containers stop.

After starting the containers, run the schema migration
manually:

```bash
PGPASSWORD=vaultline_password_dev psql \
  --host=localhost --port=5432 \
  --username=vaultline_user --dbname=vaultline \
  -f backend/src/config/schema.sql
```

## Image Naming

```
Local:      vaultline-backend:latest
Production: ECR_URL/vaultline-backend:COMMIT_SHA
            ECR_URL/vaultline-backend:latest
```

Images are tagged with both the Git commit SHA and `:latest`
in production. The commit SHA tag provides complete
traceability between deployed images and source code.
The `:latest` tag is used by ArgoCD for deployment.

## Commands

Build the backend image locally:

```bash
docker build -t vaultline-backend:latest backend/
```

Start local development environment:

```bash
docker compose -f docker-compose.dev.yml up -d
```

Stop local development environment:

```bash
docker compose -f docker-compose.dev.yml down
```

View container logs:

```bash
docker logs vaultline-backend
```

Inspect running containers:

```bash
docker compose -f docker-compose.dev.yml ps
```

Build for EKS (`linux/amd64`):

```bash
docker buildx build \
  --platform linux/amd64 \
  --tag ECR_URL:latest \
  --push \
  backend/
```

EKS worker nodes run on EC2 t3.medium which uses the x86_64
architecture. Images built on Apple Silicon (`arm64`) must
target `linux/amd64` explicitly or the pod will fail with
`ImagePullBackOff` on EKS nodes.

## Build Cache

The CI/CD pipeline uses GitHub Actions cache for Docker
layer caching. Subsequent builds after the first complete
significantly faster because unchanged layers are restored
from cache rather than rebuilt. A 50% cache hit rate is
typical on code-only changes that do not affect dependencies.

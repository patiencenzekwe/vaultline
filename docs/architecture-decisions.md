# Vaultline Architecture Decisions

## Overview
Vaultline is a cloud-native banking platform built on AWS EKS
implementing security controls and operational practices
consistent with enterprise financial services infrastructure.

## Technology Decisions

### Container Orchestration
AWS EKS was selected over ECS because EKS provides full
Kubernetes compatibility, allowing workloads to remain
portable across cloud providers. ECS creates AWS vendor
lock-in which is unacceptable for enterprise financial
infrastructure. Kubernetes is the industry standard for
banking platforms requiring multi-region deployments and
complex service networking.

### Database
PostgreSQL on RDS Multi-AZ was selected over DynamoDB
because banking transactions require ACID compliance.
Partial updates to account balances cannot be tolerated
under any circumstances. DynamoDB eventual consistency
is inappropriate for payment processing workloads.
Multi-AZ configuration provides automatic failover with
near-zero RPO and recovery time under two minutes.

### Infrastructure as Code
Terraform was selected over CloudFormation because Terraform
is cloud-agnostic with broader industry adoption and a
larger module ecosystem. Terraform state management, module
reusability, and the plan and apply workflow provides better
operational control over complex Kubernetes infrastructure
than CloudFormation.

### Continuous Delivery
ArgoCD was selected over Jenkins for deployments because
ArgoCD implements GitOps. The desired state of the
Kubernetes cluster is stored in Git and continuously
reconciled. This eliminates configuration drift, provides
a complete audit trail of every deployment, and enables
automatic rollback on failed deployments.

### Service Mesh
Istio was selected to enforce mutual TLS between all
microservices, ensuring zero unencrypted internal
communication. Istio enforces this at the infrastructure
layer without requiring application code changes. Traffic
management capabilities enable canary deployments and
circuit breaking for system resilience.

### Secrets Management
HashiCorp Vault was selected over AWS Secrets Manager
because Vault provides dynamic secret generation, automatic
rotation, and detailed audit logging. It is cloud-agnostic
and the industry standard for secrets management in
financial services environments. Dynamic credentials
eliminate long-lived static secrets entirely.

### Container Runtime
Docker with multi-stage builds was selected for containerisation.
The multi-stage pattern uses a builder stage to install
dependencies and a separate production stage that copies only
the compiled output. This eliminates build tools, npm cache,
and unnecessary files from the final image — reducing the
attack surface and image size significantly.

All containers run as non-root users. The vaultline user
runs with UID 1001 and has no privileges beyond executing
the application. This limits the blast radius of any
container compromise.

### Node.js Version
Node.js 24 LTS was selected as the container runtime.
LTS versions receive security patches for 30 months.
Node 26 was not selected because it does not become LTS
until October 2026 — production workloads require
long-term security support guarantees.

### API Security
express-rate-limit was implemented at 100 requests per
15-minute window per IP address. This prevents credential
stuffing and brute force attacks on authentication endpoints
without impacting legitimate users.

Helmet.js was added to set 11 HTTP security headers
automatically on every response — protecting against
clickjacking, cross-site scripting, and information
disclosure without requiring manual header configuration.

### Password Policy
Passwords require a minimum of 8 characters, at least one
uppercase letter, one number, and one special character.
bcrypt with 12 salt rounds was selected for password
hashing. 12 rounds provides the industry-standard balance
between security and performance — making brute force
attacks computationally expensive while keeping login
response times under 300 milliseconds.

### Transfer Limits
Single transfers are capped at £10,000. This mirrors
standard UK retail banking transaction limits and provides
a fraud prevention layer at the application level —
independent of any infrastructure controls.

### Database Transaction Integrity
All fund transfer operations use PostgreSQL transactions
with BEGIN, COMMIT, and ROLLBACK. Account rows are locked
with FOR UPDATE during transfers to prevent race conditions
when two transfers attempt to use the same account
simultaneously. This ensures ACID compliance — either all
five operations in a transfer succeed together or none
of them happen.

### Local Development Environment
Docker Compose with PostgreSQL 18 Alpine was selected for
local development. The schema.sql file mounts into
docker-entrypoint-initdb.d and executes automatically on
first startup — eliminating manual database setup entirely.
This ensures every developer gets an identical local
environment regardless of their machine configuration.
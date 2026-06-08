# Vaultline

Production-grade banking platform on AWS EKS implementing
enterprise DevOps and Platform Engineering practices.

**Live platform:** https://vaultline.uk
**Live API:** https://api.vaultline.uk/api/health

## Overview

Vaultline is a cloud-native banking platform providing
account management, fund transfers, savings goals, and
complete transaction history. The platform is built on a
secure, observable Kubernetes architecture with full GitOps
delivery and an automated DevSecOps pipeline.

Users can register accounts, view balances across current
and savings accounts, transfer funds using UK sort code and
account number, save payees for repeat transfers, manage
savings goals with progress tracking, and export transaction
statements as CSV.

## Application Architecture

```
React 19 + TypeScript      ->  vaultline.uk (CloudFront + S3)
Node.js 24 + Express       ->  api.vaultline.uk (EKS + NGINX Ingress)
PostgreSQL 17.4 RDS        ->  Multi-AZ eu-west-2
HashiCorp Vault 1.20.4     ->  Dynamic credential generation
Istio 1.30.0               ->  Mutual TLS service mesh
ArgoCD                     ->  GitOps continuous delivery
GitHub Actions             ->  CI/CD pipeline with OIDC federation
Terraform                  ->  Infrastructure as code
```

## Infrastructure Status

```
Frontend:  Live -- vaultline.uk -- React 19 -- CloudFront + S3
API:       Live -- api.vaultline.uk -- Node.js 24 on EKS
VPC:       Live -- eu-west-2 London -- 10.0.0.0/16
ECR:       Live -- vaultline-backend image repository
EKS:       Live -- vaultline-cluster -- Kubernetes 1.33 -- 2 nodes Ready
ArgoCD:    Live -- GitOps sync enabled -- Healthy and Synced
Ingress:   Live -- F5 NGINX Ingress Controller 5.4.2 -- NLB
TLS:       Live -- Let's Encrypt production -- api.vaultline.uk
DNS:       Live -- ExternalDNS managing Route53 -- vaultline.uk
Vault:     Live -- Vault 1.20.4 -- dynamic database credentials
Istio:     Live -- Istio 1.30.0 -- strict mTLS enforced -- Kiali
CI/CD:     Live -- GitHub Actions -- OIDC federation -- no static credentials
RDS:       Live -- PostgreSQL 17.4 -- Multi-AZ -- schema migrated
```

## Platform Features

**Banking**
- Current and savings account management
- Fund transfers using UK sort code and account number
- Saved payees for repeat transfers
- Savings goals with real-time progress tracking
- Complete transaction history with month grouping
- CSV statement export
- Spending analytics by category

**Security**
- JWT authentication with 24 hour expiry
- bcrypt password hashing with 12 salt rounds
- Profile management and password change
- Login activity and session management
- Account limits and security settings

## API Endpoints

```
Auth:          POST /api/auth/register
               POST /api/auth/login
               GET  /api/auth/profile
               PUT  /api/auth/profile
               PUT  /api/auth/change-password
               GET  /api/auth/sessions

Accounts:      GET  /api/accounts
               GET  /api/accounts/spending
               GET  /api/accounts/:id/limits

Transactions:  GET  /api/transactions
               GET  /api/transactions/export

Transfers:     POST /api/transfers
               GET  /api/transfers

Savings:       GET    /api/savings
               POST   /api/savings
               PUT    /api/savings/:id
               DELETE /api/savings/:id

Beneficiaries: GET    /api/beneficiaries
               POST   /api/beneficiaries
               DELETE /api/beneficiaries/:id
```

## CI/CD Pipeline

Every commit to main triggers an automated pipeline.
No manual steps are required for deployment.

```
Code Push -> Terraform Validate -> Checkov Scan
          -> Jest Tests -> Docker Build -> Trivy Scan
          -> Push to ECR -> ArgoCD Sync -> Deployment Complete
```

Authentication to AWS uses OIDC federation. No static
AWS credentials are stored anywhere in the pipeline.

Trivy is installed directly from the official GitHub release
rather than via the aquasecurity/trivy-action, which was
compromised in March 2026 with 75 of 76 version tags
force-pushed to deliver credential-stealing malware.

## Security Architecture

**Zero-trust networking.** Istio enforces mutual TLS between
all services at the infrastructure layer. No application
code changes required. Every pod-to-pod connection is
encrypted and authenticated.

**Dynamic secrets.** HashiCorp Vault generates unique
PostgreSQL credentials per request with a one hour TTL.
No static database passwords exist anywhere in the system.
Every credential access is written to the audit log.

**Supply chain security.** Checkov scans Terraform for
misconfigurations. Trivy scans every Docker image before
it reaches the container registry. GitHub Actions uses
OIDC federation eliminating long-lived AWS credentials.

**ACID transfers.** All fund transfer operations use
PostgreSQL transactions with row-level locking. Account
rows are locked with `FOR UPDATE` during transfers to prevent
race conditions. Either all operations succeed or none happen.

## AWS Services

```
Compute:    EKS, EC2
Database:   RDS PostgreSQL
Networking: CloudFront, ALB, Route53, NAT Gateway, VPC
Security:   IAM, ACM, CloudWatch
Storage:    S3, ECR
```

## Local Development

```bash
git clone git@github.com:patiencenzekwe/vaultline.git
cd vaultline
cp backend/.env.example backend/.env
docker compose -f docker-compose.dev.yml up -d
cd backend && npm install && npm run dev
```

API available at `http://localhost:3001/api/health`

Frontend available at `http://localhost:5173`

```bash
cd frontend && npm install && npm run dev
```

## Running Tests

```bash
cd backend && npm test
```

53 tests across seven suites. 78% line coverage.
Coverage gate enforced at 70%.

## Seeding Platform Data

```bash
node scripts/seed.js
```

Seeds James Harrison and Sarah Mitchell with realistic
transaction history against the live API at
`https://api.vaultline.uk`.

## Deploying Frontend

```bash
./scripts/deploy-frontend.sh
```

Builds the React application, syncs to S3, and invalidates
the CloudFront cache. Live at `https://vaultline.uk` within
seconds of running.

## Documentation

- [Architecture Decisions](docs/architecture-decisions.md)
  Technology choices and the reasoning behind each decision

- [Infrastructure](docs/infrastructure.md)
  AWS resources, Terraform structure, and provisioning commands

- [API Reference](docs/api.md)
  Complete endpoint documentation with request and response formats

- [Testing Strategy](docs/testing.md)
  Test suite structure, coverage requirements, and design principles

- [Docker Architecture](docs/docker.md)
  Container strategy, security controls, and build process

## Screenshots

**ArgoCD -- GitOps deployment synced and healthy**
![ArgoCD](docs/screenshots/argocd-synced.png)

**Kiali -- Service mesh with mutual TLS enforced**
![Kiali](docs/screenshots/kiali-overview.png)

---

**Patience Nzekwe** -- DevOps and Platform Engineer
[GitHub](https://github.com/patiencenzekwe) · [LinkedIn](https://linkedin.com/in/patiencenzekwe)

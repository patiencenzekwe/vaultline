# Vaultline

Production-grade banking platform on AWS EKS implementing
enterprise DevOps and Platform Engineering practices.

## Overview

Vaultline is a cloud-native banking platform providing
account management, transaction processing, and fund
transfer capabilities. The platform is built on a secure,
observable, and highly available Kubernetes architecture
with full GitOps delivery and an automated DevSecOps
pipeline.

## Application Architecture

The platform follows a microservices architecture with
five core components. The React TypeScript frontend
delivers the banking dashboard to users. The API Gateway
built on Node.js Express handles request routing and
authentication. Three backend services handle account
management, transaction processing, and customer
notifications independently, allowing each to scale
and deploy separately.

## Infrastructure

The platform runs on AWS EKS with Istio service mesh
enforcing mutual TLS between all services. PostgreSQL
on RDS Multi-AZ handles transactional data with automatic
failover. ElastiCache Redis manages session state.
HashiCorp Vault handles all secret management with
dynamic credential generation and automatic rotation.
Amazon ECR stores all container images.

## Delivery Pipeline

Infrastructure is provisioned via Terraform across three
environments. ArgoCD implements GitOps continuous delivery,
reconciling the cluster state against the Git repository
on every commit. GitHub Actions runs the CI/CD pipeline
using OIDC federation to AWS, eliminating static
credentials entirely. Helm charts package all Kubernetes
workloads.

## Security Controls

The platform implements defence-in-depth security across
multiple layers. Istio enforces zero-trust networking with
mutual TLS between all services. All data stores use
encryption at rest. Checkov scans Terraform for
misconfigurations before any infrastructure change is
applied. Trivy scans every Docker image for vulnerabilities
before it reaches the container registry. Falco monitors
runtime behaviour for anomalous activity. CloudTrail and
Vault audit logs provide a complete tamper-evident record
of all operations.

## Observability

Prometheus collects metrics from all cluster workloads.
Grafana provides dashboards covering transaction success
rates, API latency, infrastructure cost, and security
events. The ELK Stack aggregates logs from all services
into a centralised searchable store. OpenTelemetry
provides distributed tracing across the microservices.

## Multi-Environment Strategy

The platform uses three environments managed by Terraform.
Development runs locally on Docker Compose with no AWS
costs. Staging uses a reduced AWS configuration for
integration testing. Production uses the full AWS
configuration with Multi-AZ redundancy.

## CI/CD Pipeline

Every commit to the main branch triggers the following
automated pipeline. No manual steps are required for
deployment.
Code Push → Terraform Validate → Checkov Scan
→ Unit Tests → Docker Image Build
→ Trivy Scan → Push to ECR
→ ArgoCD Sync → Health Verification
→ Deployment Complete

Authentication to AWS uses OIDC federation. No static
AWS credentials are stored in the pipeline at any point.

## AWS Services

The platform uses the following AWS services across
compute, database, networking, security, and monitoring:
EKS, EC2, RDS, ElastiCache, ECR, ALB, Route53,
NAT Gateway, VPC, IAM, GuardDuty, WAF, CloudTrail,
Security Hub, KMS, Secrets Manager, S3 and CloudWatch.

## Local Development

```bash
git clone git@github.com:patiencenzekwe/vaultline.git
cd vaultline
cp .env.example .env
docker compose up
```

## Documentation

- [Architecture Decisions](docs/architecture-decisions.md)
  Technology choices and the reasoning behind each decision

- [API Reference](docs/api.md)
  Complete endpoint documentation with request and response formats

- [Docker Architecture](docs/docker.md)
  Container strategy, security controls, and build process


## Status

Active Development

---

Patience Nzekwe
DevOps Engineer
GitHub: github.com/patiencenzekwe
LinkedIn: linkedin.com/in/patiencenzekwe
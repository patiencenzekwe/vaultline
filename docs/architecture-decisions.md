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
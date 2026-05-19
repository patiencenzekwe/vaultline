# Vaultline Infrastructure

## Overview

All Vaultline infrastructure is provisioned using Terraform.
No resources are created manually through the AWS console.
Every resource is tagged, versioned, and reproducible from
the code in this repository.

## AWS Region

eu-west-2 — London

## Terraform Structure

```
infrastructure/terraform/
├── providers.tf   — AWS provider and version constraints
├── variables.tf   — input variables with validation
├── main.tf        — root module calling all submodules
├── outputs.tf     — values exposed after apply
└── modules/
    ├── vpc/       — networking infrastructure
    ├── ecr/       — container image registry
    ├── eks/       — Kubernetes cluster and node group
    └── rds/       — PostgreSQL database
```

## Resources Provisioned

### VPC

CIDR block 10.0.0.0/16 across two availability zones.
Provides network isolation for all Vaultline infrastructure.

Public subnets 10.0.0.0/24 and 10.0.1.0/24 in eu-west-2a
and eu-west-2b. Load balancers and NAT Gateways live here.
Tagged with kubernetes.io/role/elb so Kubernetes can
automatically provision internet-facing load balancers.

Private subnets 10.0.10.0/24 and 10.0.11.0/24 in eu-west-2a
and eu-west-2b. EKS worker nodes and RDS live here. Never
directly accessible from the internet.

NAT Gateways in each public subnet allow private subnet
resources to reach the internet for updates without being
exposed to inbound traffic. One per availability zone
for high availability.

### ECR

Private container registry storing Vaultline Docker images.
Automatic vulnerability scanning on every image push.
Lifecycle policy retains the last 10 images and expires
older ones automatically to control storage costs.

```
Repository: vaultline-backend
Region:     eu-west-2
```

### EKS

Kubernetes 1.33 cluster across two availability zones. The
control plane is managed by AWS. Worker nodes run on two
t3.medium EC2 instances in private subnets, one per
availability zone.

```
Cluster name:   vaultline-cluster
Version:        1.33
Node type:      t3.medium
Node count:     2 desired, 1 minimum, 3 maximum
Subnets:        private only — nodes never in public subnets
```

Three IAM roles are attached to worker nodes: AmazonEKSWorkerNodePolicy,
AmazonEKS_CNI_Policy, and AmazonEC2ContainerRegistryReadOnly.
The cluster role carries AmazonEKSClusterPolicy. All five
cluster log types are enabled: api, audit, authenticator,
controllerManager, and scheduler.

The node security group ID is passed directly to the RDS
security group, ensuring database access is restricted to
EKS worker nodes only.

### Kubernetes

Namespace vaultline isolates all Vaultline workloads from
system namespaces. The backend is deployed via Helm chart
and managed as a Helm release.

The Deployment runs one replica with liveness and readiness
probes on /api/health. The health endpoint is exempt from
rate limiting to prevent Kubernetes probes triggering 429
responses and causing false restarts.

A ClusterIP Service exposes the backend internally on port
3001. External traffic will be routed through NGINX Ingress
in a later lesson.

### RDS

PostgreSQL 17.4 on db.t3.micro with Multi-AZ deployment.
Provisioned after EKS cluster is available. The security
group restricts database access to EKS worker nodes only.
Storage encrypted at rest. Automated backups retained
for 7 days. Deletion protection enabled.

## Default Tags

Every AWS resource created by Terraform carries these tags:

```
Project:     vaultline
Environment: production
ManagedBy:   terraform
Owner:       patience-nzekwe
```

This enables cost tracking, resource filtering, and
audit trails across all Vaultline infrastructure.

## Terraform Commands

Initialise working directory:

```bash
terraform init
```

Preview changes before applying:

```bash
terraform plan
```

Apply infrastructure changes:

```bash
terraform apply
```

Destroy all resources:

```bash
terraform destroy
```
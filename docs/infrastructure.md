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

Repository: vaultline-backend
Region: eu-west-2

### RDS

PostgreSQL 17.4 on db.t3.micro with Multi-AZ deployment.
Provisioned after EKS cluster is available. The security
group restricts database access to EKS worker nodes only.
Storage encrypted at rest. Automated backups retained
for 7 days. Deletion protection enabled.

## Default Tags

Every AWS resource created by Terraform carries these tags:

Project:     vaultline
Environment: production
ManagedBy:   terraform
Owner:       patience-nzekwe

This enables cost tracking, resource filtering, and
audit trails across all Vaultline infrastructure.

## Terraform Commands

Initialise working directory:
terraform init

Preview changes before applying:
terraform plan

Apply infrastructure changes:
terraform apply

Destroy all resources:
terraform destroy
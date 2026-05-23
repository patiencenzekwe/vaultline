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
3001. External traffic is routed through NGINX Ingress
at api.vaultline.uk.

### NGINX Ingress

F5 NGINX Ingress Controller 5.4.2 is installed in the
nginx-ingress namespace and manages external traffic into
the cluster. A Network Load Balancer is provisioned
automatically by AWS when the controller starts. All HTTP
traffic is redirected to HTTPS.

### Cert-Manager

Cert-Manager v1.19.4 is installed in the cert-manager
namespace and provisions TLS certificates automatically
from Let's Encrypt. The DNS-01 challenge solver is used
with Route53, requiring no HTTP ingress access for
certificate validation. Certificates renew automatically
before expiry. IRSA is used for Route53 access.

### ExternalDNS

ExternalDNS v0.21.0 is installed in the external-dns
namespace and automatically manages Route53 DNS records
based on Kubernetes Ingress resources. When the load
balancer address changes, ExternalDNS updates the DNS
record automatically. IRSA is used for Route53 access.

The ExternalDNS and Cert-Manager IAM roles are managed by
Terraform and reference the EKS OIDC provider ARN
dynamically. Trust policies are recreated automatically
on every terraform apply, eliminating manual updates when
the cluster is rebuilt.

### Vault

HashiCorp Vault 1.20.4 is installed in the vault namespace using the
official Helm chart. Vault runs in standalone mode with persistent
storage on EBS volumes provisioned by the AWS EBS CSI driver.

The database secrets engine connects to RDS PostgreSQL and generates
dynamic credentials on demand. Each credential set has a one hour TTL
and is automatically revoked on expiry. No static database passwords
exist in the application.

Kubernetes auth allows vaultline-backend pods to authenticate using
their service account token. The vaultline-app policy grants read
access to database credentials only. Audit logging writes all
operations to a persistent EBS volume.

Vault must be manually unsealed after each restart using three of the
five unseal keys generated during initialisation.

### ArgoCD

ArgoCD is installed in the argocd namespace and manages
all Vaultline application deployments via GitOps. The
Application manifest at kubernetes/argocd-app.yaml defines
the source repository, target cluster, and sync policy.

Automated sync is enabled with prune and selfHeal. Prune
ensures resources deleted from Git are removed from the
cluster. SelfHeal ensures manual cluster changes are
reverted to match Git. The cluster state always reflects
the repository state.

ArgoCD polls the main branch every three minutes. Any
commit to kubernetes/vaultline-backend triggers an
automatic reconciliation.

### Istio

Istio 1.30.0 is installed in the istio-system namespace using the
minimal profile. Sidecar injection is enabled on the vaultline
namespace. The Envoy proxy is injected automatically into every pod.

Strict mutual TLS is enforced via PeerAuthentication. All pod-to-pod
traffic in the vaultline namespace is encrypted and authenticated at
the infrastructure layer without application code changes.

A DestinationRule configures circuit breaking for vaultline-backend
with outlier detection. Kiali v2.26.0 is installed for service mesh
observability and traffic graph visualisation.

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
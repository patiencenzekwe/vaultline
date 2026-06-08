# Vaultline Infrastructure

## Overview

All Vaultline infrastructure is provisioned using Terraform.
No resources are created manually through the AWS console.
Every resource is tagged, versioned, and reproducible from
the code in this repository.

## AWS Region

eu-west-2 -- London

## Terraform Structure

```
infrastructure/terraform/
├── providers.tf   -- AWS provider, us-east-1 alias for ACM, tls provider
├── variables.tf   -- input variables with validation
├── main.tf        -- root module, IAM roles, GitHub OIDC,
│                     S3, CloudFront, ACM, Route53
├── outputs.tf     -- vpc_id, ecr_url, eks_name, db_endpoint,
│                     cloudfront_domain, frontend_bucket
└── modules/
    ├── vpc/       -- networking infrastructure
    ├── ecr/       -- container image registry
    ├── eks/       -- Kubernetes cluster, node group, CloudWatch logs
    └── rds/       -- PostgreSQL database
```

## Resources Provisioned

### VPC

CIDR block 10.0.0.0/16 across two availability zones.
Provides network isolation for all Vaultline infrastructure.

Public subnets 10.0.0.0/24 and 10.0.1.0/24 in eu-west-2a
and eu-west-2b. Load balancers and NAT Gateways live here.
Tagged with `kubernetes.io/role/elb` so Kubernetes can
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
Subnets:        private only -- nodes never in public subnets
```

Three IAM roles are attached to worker nodes: `AmazonEKSWorkerNodePolicy`,
`AmazonEKS_CNI_Policy`, and `AmazonEC2ContainerRegistryReadOnly`.
The cluster role carries `AmazonEKSClusterPolicy`. All five
cluster log types are enabled: api, audit, authenticator,
controllerManager, and scheduler.

The node security group ID is passed directly to the RDS
security group, ensuring database access is restricted to
EKS worker nodes only.

A CloudWatch log group `/aws/eks/vaultline-cluster/cluster` is managed
by Terraform with a 7-day retention policy. EKS creates this log group
automatically when the cluster starts. On each rebuild, run the import
command before the second apply:

```bash
terraform apply -auto-approve
terraform import module.eks.aws_cloudwatch_log_group.eks_cluster \
  /aws/eks/vaultline-cluster/cluster
terraform apply -auto-approve
```

### Kubernetes

Namespace vaultline isolates all Vaultline workloads from
system namespaces. The backend is deployed via Helm chart
and managed as a Helm release.

The Deployment runs one replica with liveness and readiness
probes on `/api/health`. The health endpoint is exempt from
rate limiting to prevent Kubernetes probes triggering 429
responses and causing false restarts.

A ClusterIP Service exposes the backend internally on port
3001. External traffic is routed through NGINX Ingress
at `api.vaultline.uk`.

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
on every `terraform apply`, eliminating manual updates when
the cluster is rebuilt.

### Vault

HashiCorp Vault 1.20.4 is installed in the vault namespace using the
official Helm chart version 0.31.0. Vault runs in standalone mode with
persistent storage on EBS volumes provisioned by the AWS EBS CSI driver.

The database secrets engine connects to RDS PostgreSQL and generates
dynamic credentials on demand. Each credential set has a one hour TTL
and is automatically revoked on expiry. No static database passwords
exist in the application.

Kubernetes auth allows vaultline-backend pods to authenticate using
their service account token. The vaultline-app policy grants read
access to database credentials only. Audit logging writes all
operations to a persistent EBS volume at `/vault/audit/vault-audit.log`.

Vault must be manually unsealed after each restart using three of the
five unseal keys generated during initialisation. Unseal keys are
stored at `~/Documents/vault-init.json` outside the repository and
must never be committed to Git.

### ArgoCD

ArgoCD is installed in the argocd namespace and manages
all Vaultline application deployments via GitOps. The
Application manifest at `kubernetes/argocd-app.yaml` defines
the source repository, target cluster, and sync policy.

Automated sync is enabled with prune and selfHeal. Prune
ensures resources deleted from Git are removed from the
cluster. SelfHeal ensures manual cluster changes are
reverted to match Git. The cluster state always reflects
the repository state.

ArgoCD polls the main branch every three minutes. Any
commit to `kubernetes/vaultline-backend` triggers an
automatic reconciliation.

### Istio

Istio 1.30.0 is installed in the istio-system namespace using the
minimal profile. Sidecar injection is enabled on the vaultline
namespace. The Envoy proxy is injected automatically into every pod.

Strict mutual TLS is enforced via PeerAuthentication. All pod-to-pod
traffic in the vaultline namespace is encrypted and authenticated at
the infrastructure layer without application code changes.

Port 3001 is set to PERMISSIVE mode in PeerAuthentication to allow
the NGINX Ingress pods (which have no Istio sidecar) to reach the
backend. All other ports enforce STRICT mTLS.

A DestinationRule configures circuit breaking for vaultline-backend
with outlier detection. Kiali v2.26.0 is installed for service mesh
observability and traffic graph visualisation.

### RDS

PostgreSQL 17.4 on `db.t3.micro` with Multi-AZ deployment.
Provisioned after EKS cluster is available. The security
group restricts database access to EKS worker nodes only.
Storage encrypted at rest. Automated backups retained
for 7 days. Deletion protection enabled.

The production schema is initialised by running `schema.sql` from inside
the cluster using a temporary PostgreSQL pod. RDS is in a private
subnet and is not accessible from outside the VPC.

Database credentials are stored in the `vaultline-db-secret` Kubernetes
Secret and injected as environment variables into the vaultline-backend
pod. The JWT secret is stored separately in the `vaultline-jwt-secret`
Kubernetes Secret. SSL is enforced on all RDS connections when `NODE_ENV`
is set to production.

Run the schema migration on every rebuild:

```bash
kubectl run psql-migration --image=postgres:17 --restart=Never \
  -n vaultline --env="PGPASSWORD=$DB_PASSWORD" -- sleep 300
kubectl wait pod/psql-migration -n vaultline --for=condition=Ready --timeout=60s
kubectl cp backend/src/config/schema.sql vaultline/psql-migration:/tmp/schema.sql
kubectl exec -n vaultline psql-migration -- psql \
  "host=$RDS_HOST port=5432 dbname=vaultline user=vaultline_admin sslmode=require" \
  -f /tmp/schema.sql
kubectl delete pod psql-migration -n vaultline
```

### S3 and CloudFront

The React 19 frontend is hosted on S3 with CloudFront CDN.
The S3 bucket is private with versioning enabled. CloudFront
accesses the bucket via Origin Access Control. All HTTP
traffic is redirected to HTTPS. React Router is supported
by returning `index.html` for all 404 and 403 responses.

```
Bucket:       vaultline-frontend-238016802725
Distribution: d29q26s6ag0gt0.cloudfront.net
Domain:       vaultline.uk and www.vaultline.uk
```

The ACM certificate for `vaultline.uk` is provisioned in `us-east-1`
as required by CloudFront. A separate Terraform provider alias handles
this. Route53 A records for the apex and www domains point to CloudFront
via alias records.

Deploy the frontend after every code change:

```bash
./scripts/deploy-frontend.sh
```

This builds the React application, syncs the `dist/` folder to S3,
and creates a CloudFront cache invalidation so users see the latest
version immediately.

### Data Seeding

The `scripts/seed.js` script seeds the production database with
realistic user data via the live API. Running the script creates
James Harrison and Sarah Mitchell with five transfers between their
accounts. The script runs against `https://api.vaultline.uk` and
requires the full stack to be running before execution.

Run after every cluster rebuild:

```bash
node scripts/seed.js
```

### CI/CD Pipeline

GitHub Actions runs the automated pipeline on every push and pull
request to the main branch. The pipeline has four stages: Terraform
validate, Checkov security scan, Jest tests with a PostgreSQL service
container, and Docker image build and push to ECR.

Authentication to AWS uses OIDC federation via the GitHub Actions
identity provider registered in IAM. The `VaultlineGitHubActionsRole`
is assumed using a short-lived token. No static AWS credentials are
stored in the repository at any point.

Trivy v0.70.0 is installed directly from the GitHub release binary
rather than via the `aquasecurity/trivy-action`, which was compromised
in March 2026.

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

Import CloudWatch log group after cluster rebuild:

```bash
terraform import module.eks.aws_cloudwatch_log_group.eks_cluster \
  /aws/eks/vaultline-cluster/cluster
```

Destroy all resources (delete NLB service first):

```bash
kubectl delete service nginx-ingress-controller -n nginx-ingress
# Wait 2 minutes for NLB to terminate
terraform destroy
```

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "ecr_repository_url" {
  description = "ECR repository URL for pushing Docker images"
  value       = module.ecr.repository_url
}

# output "db_endpoint" {
#   description = "RDS PostgreSQL endpoint"
#   value       = module.rds.db_endpoint
#   sensitive   = true
# }

module "vpc" {
  source = "./modules/vpc"

  project_name       = var.project_name
  vpc_cidr           = var.vpc_cidr
  availability_zones = var.availability_zones
}

module "ecr" {
  source = "./modules/ecr"

  project_name = var.project_name
}

resource "random_password" "db_password" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}<>:?"
}

# module "rds" {
#   source = "./modules/rds"

#   project_name          = var.project_name
#   vpc_id                = module.vpc.vpc_id
#   private_subnet_ids    = module.vpc.private_subnet_ids
#   eks_security_group_id = "placeholder"
#   rds_instance_class    = var.rds_instance_class
#   rds_allocated_storage = var.rds_allocated_storage
#   db_name               = var.db_name
#   db_username           = var.db_username
#   db_password           = random_password.db_password.result
# }

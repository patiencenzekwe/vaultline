#!/bin/bash
set -e

echo "Building frontend..."
cd frontend
npm run build
cd ..

echo "Uploading to S3..."
BUCKET=$(cd infrastructure/terraform && terraform output -raw frontend_bucket)
aws s3 sync frontend/dist/ s3://$BUCKET/ \
  --delete \
  --region eu-west-2 \
  --profile personal

echo "Invalidating CloudFront cache..."
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
  --profile personal \
  --query "DistributionList.Items[?Aliases.Items[?contains(@, 'vaultline.uk')]].Id" \
  --output text)

aws cloudfront create-invalidation \
  --distribution-id $DISTRIBUTION_ID \
  --paths "/*" \
  --profile personal

echo "Frontend deployed to https://vaultline.uk"
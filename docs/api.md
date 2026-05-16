# Vaultline API Documentation

## Base URL

Local development: http://localhost:3001
Production: https://api.vaultline.co.uk (when deployed)

## Authentication

All protected endpoints require a JWT token in the
Authorization header:

Authorization: Bearer YOUR_TOKEN

Tokens are issued on login and expire after 24 hours.
Tokens contain the user ID and email — never the password.

## Rate Limiting

100 requests per 15 minutes per IP address across all
endpoints. Exceeding this limit returns HTTP 429.

## Endpoints

### Authentication

POST /api/auth/register
Register a new user account. Creates a current account
with £1,000 demo balance automatically.

Request body:
- email: string, valid email format, required
- password: string, min 8 chars, uppercase, number, special character required
- full_name: string, min 2 chars, required
- phone: string, optional

Response 201: token, user object
Response 409: email already exists
Response 400: validation error

POST /api/auth/login
Authenticate an existing user.

Request body:
- email: string, required
- password: string, required

Response 200: token, user object
Response 401: invalid credentials

GET /api/auth/profile
Get the authenticated user's profile.
Requires: Authorization header

Response 200: user object
Response 401: no token or invalid token

### Accounts

GET /api/accounts
List all accounts belonging to the authenticated user.
Requires: Authorization header

Response 200: accounts array

GET /api/accounts/:id
Get a single account by ID.
Requires: Authorization header

Response 200: account object
Response 404: account not found or not owned by user

### Transactions

GET /api/transactions?account_id=UUID
Get transaction history for an account.
Requires: Authorization header

Query parameters:
- account_id: UUID, required
- limit: number, default 20
- offset: number, default 0

Response 200: transactions array with pagination
Response 403: account not owned by user

### Transfers

POST /api/transfers
Transfer funds between accounts.
Requires: Authorization header

Request body:
- from_account_id: UUID, required
- to_account_id: UUID, required
- amount: number, positive, max 10000, required
- description: string, optional

Response 201: transfer object with reference
Response 400: insufficient funds or same account
Response 404: account not found

GET /api/transfers
List all transfers involving the authenticated user's
accounts — both sent and received.
Requires: Authorization header

Response 200: transfers array

### Health

GET /api/health
Health check endpoint. Used by Kubernetes liveness and
readiness probes. No authentication required.

Response 200: status, service name, timestamp, environment

## HTTP Status Codes

200: Success
201: Created successfully
400: Bad request — validation error or business rule
401: Unauthorised — missing or invalid token
403: Forbidden — authenticated but not permitted
404: Resource not found
409: Conflict — resource already exists
429: Too many requests — rate limit exceeded
500: Internal server error

## Security Headers

Every response includes the following security headers
set automatically by Helmet.js:

X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Strict-Transport-Security: max-age=15552000
Content-Security-Policy: default-src self
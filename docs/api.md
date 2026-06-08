# Vaultline API Documentation

## Base URL

```
Local development: http://localhost:3001
Production:        https://api.vaultline.uk
```

## Authentication

All protected endpoints require a JWT token in the
Authorization header:

```
Authorization: Bearer YOUR_TOKEN
```

Tokens are issued on login and expire after 24 hours.
Tokens contain the user ID and email. The password is
never included in a token.

## Rate Limiting

100 requests per 15 minutes per IP address across all
endpoints. Exceeding this limit returns HTTP 429.

## Endpoints

### Authentication

**POST /api/auth/register**
Register a new user account. Creates a current account
with £1,000 opening balance automatically.

Request body:

```
email:     string, valid email format, required
password:  string, min 8 chars, uppercase, number,
           special character required
full_name: string, min 2 chars, required
phone:     string, optional
```

```
Response 201: token, user object
Response 409: email already exists
Response 400: validation error
```

**POST /api/auth/login**
Authenticate an existing user.

Request body:

```
email:    string, required
password: string, required
```

```
Response 200: token, user object
Response 401: invalid credentials
```

**GET /api/auth/profile**
Get the authenticated user profile.
Requires: Authorization header

```
Response 200: user object
Response 401: no token or invalid token
```

**PUT /api/auth/profile**
Update the authenticated user's full name and phone number.
Email address cannot be changed.
Requires: Authorization header

Request body:

```
full_name: string, min 2 chars, required
phone:     string, optional
```

```
Response 200: updated user object
Response 400: validation error
Response 401: no token or invalid token
```

**PUT /api/auth/change-password**
Change the authenticated user's password.
Requires: Authorization header

Request body:

```
current_password: string, required
new_password:     string, min 8 chars, uppercase,
                  number, special character required
```

```
Response 200: success message
Response 401: current password incorrect
Response 400: validation error
```

**GET /api/auth/sessions**
Get login activity for the current session.
Requires: Authorization header

```
Response 200: sessions array with device, location,
              IP, login time, expiry, and current flag
Response 401: no token or invalid token
```

### Accounts

**GET /api/accounts**
List all accounts belonging to the authenticated user.
Requires: Authorization header

```
Response 200: accounts array
```

**GET /api/accounts/:id**
Get a single account by ID.
Requires: Authorization header

```
Response 200: account object
Response 404: account not found or not owned by user
```

**GET /api/accounts/spending?account_id=UUID**
Get spending analytics for an account including current
month total, transaction count, spending breakdown by
description, and monthly totals for the last 6 months.
Requires: Authorization header

```
Response 200: current_month object and monthly_totals array
Response 403: account not owned by user
```

**GET /api/accounts/:id/limits**
Get spending limits for an account.
Requires: Authorization header

```
Response 200: limits object with single_transfer_limit,
              daily_transfer_limit, atm_daily_limit,
              contactless_limit, currency
Response 404: account not found
```

### Transactions

**GET /api/transactions?account_id=UUID**
Get transaction history for an account.
Requires: Authorization header

Query parameters:

```
account_id: UUID, required
limit:      number, default 20
offset:     number, default 0
```

```
Response 200: transactions array with pagination
Response 403: account not owned by user
```

**GET /api/transactions/export?account_id=UUID**
Export all transactions for an account as a CSV file.
Requires: Authorization header

```
Response 200: CSV file download
Content-Type: text/csv
Content-Disposition: attachment; filename="vaultline-statement-*.csv"
Response 403: account not owned by user
```

### Transfers

**POST /api/transfers**
Transfer funds between accounts using UK sort code and
account number or internal account ID.
Requires: Authorization header

Request body:

```
from_account_id:   UUID, required
to_account_number: string, UK account number
to_sort_code:      string, format XX-XX-XX
to_account_id:     UUID, alternative to account number
amount:            number, positive, max 10000, required
description:       string, optional
```

Either `to_account_number` or `to_account_id` is required.
When `to_account_number` is provided, the backend resolves
the destination account internally.

```
Response 201: transfer object, reference, to_account_id,
              to_account_number
Response 400: insufficient funds, same account, missing fields
Response 404: account not found
```

**GET /api/transfers**
List all transfers involving the authenticated user
accounts, both sent and received.
Requires: Authorization header

```
Response 200: transfers array with from and to account numbers
```

### Savings Goals

**GET /api/savings**
List all savings goals for the authenticated user.
Requires: Authorization header

```
Response 200: goals array
```

**POST /api/savings**
Create a new savings goal.
Requires: Authorization header

Request body:

```
name:          string, min 2 chars, required
target_amount: number, positive, required
color:         string, hex colour code, optional, default #8B5CF6
```

```
Response 201: goal object
Response 400: validation error
```

**PUT /api/savings/:id**
Update a savings goal. Supports partial updates.
Used to add funds by increasing `saved_amount`.
Requires: Authorization header

Request body:

```
name:          string, optional
target_amount: number, optional
saved_amount:  number, optional
color:         string, optional
```

```
Response 200: updated goal object
Response 404: goal not found
```

**DELETE /api/savings/:id**
Delete a savings goal.
Requires: Authorization header

```
Response 200: success message
Response 404: goal not found
```

### Beneficiaries

**GET /api/beneficiaries**
List all saved payees for the authenticated user,
ordered alphabetically by name.
Requires: Authorization header

```
Response 200: beneficiaries array
```

**POST /api/beneficiaries**
Save a new payee. Prevents duplicate account numbers
per user.
Requires: Authorization header

Request body:

```
name:           string, min 2 chars, required
account_number: string, required
account_id:     UUID, optional — links to internal account
```

```
Response 201: beneficiary object
Response 409: account number already saved
Response 400: validation error
```

**DELETE /api/beneficiaries/:id**
Remove a saved payee.
Requires: Authorization header

```
Response 200: success message
Response 404: beneficiary not found
```

### Health

**GET /api/health**
Health check endpoint used by Kubernetes liveness and
readiness probes. No authentication required.

```
Response 200: status, service name, timestamp, environment
```

## HTTP Status Codes

```
200: Success
201: Created successfully
400: Bad request -- validation failure or business rule violation
401: Unauthorised -- missing or invalid token
403: Forbidden -- authenticated but not permitted to access this resource
404: Resource not found
409: Conflict -- resource already exists
429: Too many requests -- rate limit exceeded
500: Internal server error
```

## Security Headers

Every response includes the following security headers
set automatically by Helmet.js:

```
X-Content-Type-Options:    nosniff
X-Frame-Options:           SAMEORIGIN
X-XSS-Protection:          1; mode=block
Strict-Transport-Security: max-age=15552000
Content-Security-Policy:   default-src self
```

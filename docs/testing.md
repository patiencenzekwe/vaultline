# Vaultline Testing Strategy

## Overview

Vaultline uses automated testing to verify every API
endpoint behaves correctly under both normal and error
conditions. Tests run automatically on every commit via
the GitHub Actions CI/CD pipeline. No deployment proceeds
unless all tests pass and coverage meets the threshold.

## Test Stack

Jest is the test framework. It runs all test suites,
measures coverage, and enforces the coverage threshold.
Supertest allows HTTP requests to be made directly against
the Express application without starting a real server,
making tests fast and isolated.

## Test Suites

### Authentication -- `tests/auth.test.js`

Covers user registration, login, and profile retrieval.
Tests valid credentials, duplicate emails, weak passwords,
missing fields, wrong passwords, and invalid tokens.

### Accounts -- `tests/accounts.test.js`

Tests account listing and data access controls. Verifies
that authenticated users can access their own accounts
and that unauthenticated requests are rejected. Confirms
no sensitive data is exposed in responses.

### Transfers -- `tests/transfers.test.js`

Tests fund transfers between accounts. Covers successful
transfers, the £10,000 single transfer limit, insufficient
funds, unauthenticated requests, and same-account transfers.

### Health -- `tests/health.test.js`

Tests the health check endpoint used by Kubernetes liveness
and readiness probes. Verifies the response structure
matches what Kubernetes expects.

### Profile -- `tests/profile.test.js`

Tests profile update, password change, login sessions,
CSV transaction export, spending analytics, and account
limits. Covers validation errors and authentication
requirements for each endpoint.

### Savings -- `tests/savings.test.js`

Tests the full savings goals lifecycle: create, list,
update (add funds), and delete. Covers validation errors
including short names and zero target amounts, and verifies
authentication is required on all endpoints.

### Beneficiaries -- `tests/beneficiaries.test.js`

Tests saved payees: create, list, and delete. Covers
duplicate account number prevention, missing field
validation, and authentication requirements.

## Coverage

The coverage threshold is set at 70% line coverage.
The pipeline fails if coverage drops below this threshold
on any commit. This prevents untested code from reaching
production. Current coverage is 78% across all files.

## Test Design Principles

Each test suite is completely independent. It creates its
own test data in `beforeAll` and removes it in `afterAll`.
No test suite depends on data created by another. This
ensures tests pass regardless of execution order and
prevents test pollution between suites.

Tests run sequentially using `--runInBand` to avoid database
connection conflicts between parallel test suites.

The `--forceExit` flag ensures Jest terminates cleanly after
all tests complete. Without this flag, open database
connections prevent the process from exiting.

The `require.main === module` guard in `server.js` prevents
the Express server from binding to port 3001 when the
application is imported by Jest. Without this guard,
multiple test files would attempt to bind the same port
simultaneously and fail.

## Running Tests

```bash
cd backend
npm test
```

## Running Tests Locally Against Docker

Start the local database before running tests:

```bash
docker compose -f docker-compose.dev.yml up -d
```

Run the schema migration if the database is fresh:

```bash
PGPASSWORD=vaultline_password_dev psql \
  --host=localhost --port=5432 \
  --username=vaultline_user --dbname=vaultline \
  -f backend/src/config/schema.sql
```

Then run tests:

```bash
cd backend && npm test
```

## Test Data

All test data uses obviously fake `vaultline.com` email
addresses. Test users are created before each suite and
deleted after. They never appear in the production database.

```
test@vaultline.com           -- auth suite
accounts.test@vaultline.com  -- accounts suite
transfer.one@vaultline.com   -- transfers suite
transfer.two@vaultline.com   -- transfers suite
profile@vaultline.com        -- profile suite
savings@vaultline.com        -- savings suite
beneficiary@vaultline.com    -- beneficiaries suite
```

## CI/CD Integration

The GitHub Actions pipeline runs tests on every push to
main and on every pull request. A PostgreSQL 17 service
container is started alongside the test runner. The schema
is applied automatically before tests run. The pipeline
fails and blocks deployment if any test fails or coverage
drops below 70%.

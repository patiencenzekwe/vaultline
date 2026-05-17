# Vaultline Testing Strategy

## Overview

Vaultline uses automated testing to verify every API
endpoint behaves correctly under both normal and error
conditions. Tests run automatically on every commit via
the GitHub Actions CI/CD pipeline. No deployment proceeds
unless all tests pass.

## Test Stack

Jest is the test framework. It runs all test suites,
measures coverage, and enforces the coverage threshold.
Supertest allows HTTP requests to be made directly against
the Express application without starting a real server,
making tests fast and isolated.

## Test Suites

### Authentication

tests/auth.test.js covers user registration, login, and
profile retrieval. It tests valid credentials, duplicate
emails, weak passwords, missing fields, wrong passwords,
and invalid tokens.

### Accounts

tests/accounts.test.js tests account listing and data
access controls. It verifies that authenticated users can
access their own accounts and that unauthenticated requests
are rejected. It also confirms no sensitive data is exposed
in responses.

### Transfers

tests/transfers.test.js tests fund transfers between
accounts. It covers successful transfers, the £10,000
single transfer limit, insufficient funds, unauthenticated
requests, and same-account transfers.

### Health

tests/health.test.js tests the health check endpoint used
by Kubernetes liveness and readiness probes. It verifies
the response structure matches what Kubernetes expects.

## Coverage

The coverage threshold is set at 70% line coverage.
The pipeline fails if coverage drops below this threshold
on any commit. This prevents untested code from reaching
production.

## Test Design Principles

Each test suite is completely independent. It creates its
own test data in beforeAll and removes it in afterAll.
No test suite depends on data created by another. This
ensures tests pass regardless of execution order and
prevents test pollution between suites.

Tests run sequentially using --runInBand to avoid database
connection conflicts between parallel test suites.

## Running Tests

```bash
npm test
```

## Test Data

All test data uses obviously fake vaultline.com email
addresses. Test users are created before each suite and
deleted after. They never appear in the production database.

```
test@vaultline.com
accounts.test@vaultline.com
transfer.one@vaultline.com
transfer.two@vaultline.com
```
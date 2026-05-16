# Vaultline Testing Strategy

## Overview

Vaultline uses automated testing to verify every API
endpoint behaves correctly under both normal and error
conditions. Tests run automatically on every commit via
the GitHub Actions CI/CD pipeline — no deployment proceeds
unless all tests pass.

## Test Stack

Jest is the test framework — it runs all test suites,
measures coverage, and enforces the coverage threshold.
Supertest allows HTTP requests to be made directly against
the Express application without starting a real server,
making tests fast and isolated.

## Test Suites

### Authentication — tests/auth.test.js
Tests user registration, login, and profile retrieval.
Covers valid credentials, duplicate emails, weak passwords,
missing fields, wrong passwords, and invalid tokens.

### Accounts — tests/accounts.test.js
Tests account listing and data access controls. Verifies
that authenticated users can access their own accounts and
that unauthenticated requests are rejected. Confirms no
sensitive data is exposed in responses.

### Transfers — tests/transfers.test.js
Tests fund transfers between accounts. Covers successful
transfers, the £10,000 single transfer limit, insufficient
funds, unauthenticated requests, and same-account transfers.

### Health — tests/health.test.js
Tests the health check endpoint used by Kubernetes liveness
and readiness probes. Verifies the response structure
matches what Kubernetes expects.

## Coverage

The coverage threshold is set at 70% line coverage.
The pipeline fails if coverage drops below this threshold
on any commit — preventing untested code from reaching
production.

Current coverage: 77% lines

## Test Design Principles

Each test suite is completely independent. It creates its
own test data in beforeAll and removes it in afterAll.
No test suite depends on data created by another — this
ensures tests pass regardless of execution order and
prevents test pollution between suites.

Tests run sequentially using --runInBand to avoid database
connection conflicts between parallel test suites.

## Running Tests

Run the full test suite with coverage:
npm test

## Test Data

All test data uses obviously fake vaultline.com email
addresses. Test users are created before each suite and
deleted after — they never appear in the production
database.

Test emails used:
- test@vaultline.com
- accounts.test@vaultline.com
- transfer.one@vaultline.com
- transfer.two@vaultline.com
# Add Deployment API Contract Tests

## Objective

Protect public semantics while Project APIs coexist during migration.

## Background

RFC-0001 §9; Implementation Plan Phase 4.

## Scope

Document error/response contract and add API consumer-style compatibility coverage.

## Out of Scope

Frontend feature work.

## Files

Create: API contract tests, `docs/implementation/deployment-api-migration.md`. Modify: API documentation/schemas.

## Dependencies

TASK-017.

## Acceptance Criteria

- Existing Project reads stay compatible; new API never exposes provider fields or secrets.

## Testing

- Contract regression tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

S (1–3 hours)

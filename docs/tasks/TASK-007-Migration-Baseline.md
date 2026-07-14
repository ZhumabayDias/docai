# Introduce Migration Baseline

## Objective

Replace runtime schema creation with forward-only migration ownership.

## Background

RFC-0001 §8; Implementation Plan Phase 2.

## Scope

Configure migration tooling and create an upgrade path from the current Project schema.

## Out of Scope

Deployment tables or PostgreSQL migration.

## Files

Create: `backend/migrations/` and migration configuration. Modify: `backend/app/database.py`, `backend/app/main.py`, requirements.

## Dependencies

TASK-002.

## Acceptance Criteria

- New and legacy-copy databases upgrade without data loss.
- Runtime schema creation is removed only after migration path works.

## Testing

- Fresh-install and legacy-upgrade migration tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

M (2–3 hours)

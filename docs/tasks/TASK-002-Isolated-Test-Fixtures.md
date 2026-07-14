# Establish Isolated Test Fixtures

## Objective

Make backend tests independent of developer databases and deployment workspaces.

## Background

RFC-0001 §4.2; Implementation Plan Phase 0.

## Scope

Add isolated database/workspace fixtures and teardown rules.

## Out of Scope

Migration tooling or production cleanup.

## Files

Create: `backend/tests/conftest.py`, `backend/tests/architecture/`. Modify: test configuration and `.gitignore` if needed.

## Dependencies

TASK-001.

## Acceptance Criteria

- Tests neither read nor write `users.db` or shared deployment directories.
- Repeated runs leave no test workspace.

## Testing

- Run fixture tests twice in fresh processes.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

S (1–3 hours)

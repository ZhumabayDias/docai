# Implement Source Adapter and Workspace Lifecycle

## Objective

Retrieve pinned input only in worker-owned temporary space.

## Background

RFC-0001 §§3–4; Plan Phase 7.

## Scope

Implement source retrieval, workspace creation/cleanup, and normalized source failures using local fixtures.

## Out of Scope

Build execution or API cloning.

## Files

Create: source adapter/tests/fixtures. Modify: orchestrator/configuration/`.gitignore`.

## Dependencies

TASK-027, TASK-029.

## Acceptance Criteria

- Retrieval uses pinned input; cancellation/restart cleanup is idempotent; no route imports adapter.

## Testing

- Inaccessible revision, interruption, and cleanup tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

M (2–3 hours)

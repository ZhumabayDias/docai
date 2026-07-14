# Add Atomic Transition Persistence and Versioning

## Objective

Prevent concurrent workers from corrupting status or history.

## Background

RFC-0001 §§4.2, 5.4, 8; Implementation Plan Phase 2.

## Scope

Add expected-version persistence and atomic status/outcome-event transaction behavior.

## Out of Scope

Queue dispatch.

## Files

Modify: Deployment repository/mappings/migrations. Create: concurrency and rollback integration tests.

## Dependencies

TASK-008.

## Acceptance Criteria

- Exactly one competing expected-version update succeeds.
- Failed transaction leaves neither partial status nor partial event.

## Testing

- Concurrent writer and forced-rollback tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

M (2–3 hours)

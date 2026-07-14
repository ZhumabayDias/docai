# Add Source/Build Cleanup Regression Tests

## Objective

Prove preparation resources are released for all lifecycle exits.

## Background

RFC-0001 §10.2; Plan Phase 7.

## Scope

Test success, failure, stop, and restart cleanup; remove remaining direct clone responsibility.

## Out of Scope

Docker cleanup.

## Files

Modify: legacy deploy service, source/build tests, migration notes.

## Dependencies

TASK-030, TASK-031.

## Acceptance Criteria

- No execution path calls legacy direct clone; fixture workspaces are always released.

## Testing

- Lifecycle cleanup integration tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

S (1–3 hours)

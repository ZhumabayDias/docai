# Implement Docker Release and Reconciliation

## Objective

Release allocations idempotently and observe provider state for recovery.

## Background

RFC-0001 §§5, 10–11; Plan Phase 8.

## Scope

Implement release, absent-resource handling, cleanup sweep, and externally removed-workload observation.

## Out of Scope

Health checks or routing.

## Files

Modify: Docker adapter/reconciler. Create: Docker cleanup integration tests.

## Dependencies

TASK-028, TASK-034.

## Acceptance Criteria

- Duplicate/absent release succeeds safely; observed state is normalized and does not directly mutate status.

## Testing

- Lost-worker, duplicate-release, and external-removal tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

M (2–3 hours)

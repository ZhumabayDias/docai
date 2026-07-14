# Handle Verified Execution Loss

## Objective

Fail a healthy deployment only after confirmed irrecoverable loss.

## Background

RFC-0001 §§5.2, 5.5; Plan Phase 10.

## Scope

Extend reconciliation with verified execution-loss policy and user-visible history semantics.

## Out of Scope

Liveness auto-restart or scaling.

## Files

Modify: reconciler, health tests, status UI wording.

## Dependencies

TASK-028, TASK-041.

## Acceptance Criteria

- Isolated probe failure does not fail `Healthy`; verified loss records `execution_failure` once.

## Testing

- Externally removed workload and false-probe regression tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

S (1–3 hours)

# Add Transactional Work Outbox

## Objective

Reliably hand accepted deployment work to asynchronous processing.

## Background

RFC-0001 §4.2; Implementation Plan Phase 2.

## Scope

Add dispatch-record persistence, idempotent enqueue intent, and recovery query support.

## Out of Scope

Worker implementation.

## Files

Create: outbox repository/mapping/tests. Modify: migrations and transaction composition.

## Dependencies

TASK-009.

## Acceptance Criteria

- Deployment acceptance and dispatch record commit together.
- Crash-after-commit records are discoverable for delivery.

## Testing

- Transaction and recovery integration tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

S (1–3 hours)

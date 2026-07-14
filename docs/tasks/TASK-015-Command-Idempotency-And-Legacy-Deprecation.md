# Add Command Idempotency and Deprecate Legacy Service

## Objective

Make mutation retries safe and stop new work from extending the prototype service.

## Background

RFC-0001 §4.2; Implementation Plan Phase 3.

## Scope

Persist idempotency handling for mutating commands; mark legacy service deprecated and remove new call sites.

## Out of Scope

HTTP idempotency header parsing or route migration.

## Files

Create: idempotency storage/service/tests. Modify: `backend/app/services/deploy_service.py`, application wiring/migrations.

## Dependencies

TASK-011, TASK-013, TASK-014.

## Acceptance Criteria

- Same command/key returns original result and creates no extra deployment/event.

## Testing

- Duplicate key and mismatched-key-payload tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

M (2–3 hours)

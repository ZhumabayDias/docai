# Implement Stop Deployment Use Case

## Objective

Record authorized stop intent through the state machine.

## Background

RFC-0001 §5; Implementation Plan Phase 3.

## Scope

Implement stop authorization, idempotent transition to `Stopping`, event creation, and dispatch intent.

## Out of Scope

Resource release worker logic.

## Files

Create: stop command/service/tests. Modify: application wiring.

## Dependencies

TASK-011.

## Acceptance Criteria

- Valid active statuses accept one `StopRequested`; invalid/terminal behavior is deterministic.

## Testing

- Transition and duplicate-stop application tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

S (1–3 hours)

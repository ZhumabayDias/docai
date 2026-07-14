# Add Deployment Polling and UI Smoke Test

## Objective

Keep active deployment views current without unsafe client races.

## Background

RFC-0001 §9; Plan Phase 5.

## Scope

Implement bounded polling/cancellation and one queued-deployment UI smoke test.

## Out of Scope

Real-time streams or logs.

## Files

Modify: deployment hooks/components. Create: frontend polling and E2E tests.

## Dependencies

TASK-022.

## Acceptance Criteria

- Polling stops on unmount/terminal status and does not enable duplicate actions.

## Testing

- Fake-timer component tests and queued-flow smoke test.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

S (1–3 hours)

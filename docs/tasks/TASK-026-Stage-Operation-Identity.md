# Add Stage Operation Identity and Deadlines

## Objective

Make each side effect retryable and observable.

## Background

RFC-0001 §§4.2, 10.2; Plan Phase 6.

## Scope

Persist operation kind/token/claim/deadline and retry classification policy.

## Out of Scope

Provider calls or reconciliation loop.

## Files

Create: application operations module/tests. Modify: migrations/persistence configuration.

## Dependencies

TASK-025.

## Acceptance Criteria

- One deployment-stage operation has stable identity across retries and restarts.

## Testing

- Claim, expiry, duplicate, and retry-classification tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

M (2–3 hours)

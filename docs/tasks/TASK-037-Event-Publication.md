# Implement Versioned Event Publication

## Objective

Publish durable Deployment Events for downstream consumers without coupling lifecycle completion.

## Background

RFC-0001 §6; Plan Phase 9.

## Scope

Add outbox publisher, versioned envelope validation, and consumer deduplication guidance.

## Out of Scope

Analytics, notification, or billing consumers.

## Files

Create: events publisher/tests, `docs/implementation/event-contract.md`. Modify: outbox wiring.

## Dependencies

TASK-025, TASK-035.

## Acceptance Criteria

- At-least-once publication has stable event IDs and reference consumer deduplicates/retries.

## Testing

- Publish-crash, duplicate, and cross-deployment ordering tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

M (2–3 hours)

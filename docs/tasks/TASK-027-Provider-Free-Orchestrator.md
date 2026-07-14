# Implement Provider-Free Deployment Orchestrator

## Objective

Advance lifecycle using ports and fakes without becoming a second state machine.

## Background

RFC-0001 §§4–5, 10; Plan Phase 6.

## Scope

Implement small stage handlers with fake adapters for success/failure/stop paths.

## Out of Scope

Real source, build, Docker, or health adapter.

## Files

Create: orchestrator and fake-provider tests. Modify: worker wiring.

## Dependencies

TASK-024, TASK-026.

## Acceptance Criteria

- Fake success reaches `Healthy`; failures are normalized; only domain commands change status.

## Testing

- API→outbox→worker fake-provider integration test.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

M (2–3 hours)

# Implement Request Deployment Use Case

## Objective

Create authorized `Queued` deployments without external work.

## Background

RFC-0001 §§3–4; Implementation Plan Phase 3.

## Scope

Implement Project authorization lookup, input snapshot capture, aggregate creation, and outbox write.

## Out of Scope

Source retrieval, API routes, or worker dispatch.

## Files

Create: application request command/service/tests. Modify: Project lookup port and wiring.

## Dependencies

TASK-010.

## Acceptance Criteria

- Authorized request produces `Queued` and `DeploymentRequested` atomically with work intent.

## Testing

- Application authorization and input-resolution tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

M (2–3 hours)

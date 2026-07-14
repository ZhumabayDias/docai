# Implement Reconciliation and Restart Recovery

## Objective

Recover active or uncertain deployments independent of request traffic.

## Background

RFC-0001 §§4.4, 5.5, 10.3; Plan Phase 6.

## Scope

Scan expired/uncertain work, observe ports, and request only valid next actions.

## Out of Scope

Docker-specific inspection.

## Files

Create: reconciler/tests. Modify: worker scheduling/configuration.

## Dependencies

TASK-027.

## Acceptance Criteria

- Restart, stale work, and late outcomes cannot corrupt/revive terminal state.

## Testing

- Crash-point, stale-operation, and stop-race tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

M (2–3 hours)

# Implement Redeploy Use Case

## Objective

Ensure retry/redeploy creates history rather than rewriting it.

## Background

RFC-0001 §§3.3, 5.4, 9; Implementation Plan Phase 3.

## Scope

Create a new deployment from an explicit prior/current immutable input and lineage reference.

## Out of Scope

Traffic rollback or promotion.

## Files

Create: redeploy command/service/tests. Modify: application wiring.

## Dependencies

TASK-011, TASK-012.

## Acceptance Criteria

- Original deployment/events remain unchanged; new Deployment has immutable lineage.

## Testing

- Redeploy input-selection and cross-tenant tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

S (1–3 hours)

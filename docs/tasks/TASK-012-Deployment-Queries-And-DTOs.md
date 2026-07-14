# Implement Deployment Queries and DTOs

## Objective

Provide safe reads for deployment state and history.

## Background

RFC-0001 §§3, 6, 9; Implementation Plan Phase 3.

## Scope

Add list/get/event query services, ownership filtering, and provider-neutral DTO mapping.

## Out of Scope

HTTP routes or log reads.

## Files

Create: application queries/DTOs/tests. Modify: repository query interface.

## Dependencies

TASK-008, TASK-011.

## Acceptance Criteria

- Queries return ordered safe history and never expose secrets/provider internals.

## Testing

- Authorization, ordering, and DTO redaction tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

S (1–3 hours)

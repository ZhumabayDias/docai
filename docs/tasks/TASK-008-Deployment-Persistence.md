# Persist Deployments and Ordered Events

## Objective

Store aggregate state and append-only history behind repository ports.

## Background

RFC-0001 §§3, 8; Implementation Plan Phase 2.

## Scope

Add Deployment/Event mappings, repository port/adapter, immutable fields, and sequence uniqueness.

## Out of Scope

Outbox dispatch or application commands.

## Files

Create: persistence mappings/repository and persistence tests. Modify: migration files, Project relationship only if required.

## Dependencies

TASK-006, TASK-007.

## Acceptance Criteria

- Deployment and ordered events round-trip; immutable values cannot be updated by repository methods.

## Testing

- SQLite repository and sequence-uniqueness integration tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

M (2–3 hours)

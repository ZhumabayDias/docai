# Expose Deployment Read API

## Objective

Publish stable list, detail, and event-history resources.

## Background

RFC-0001 §9; Implementation Plan Phase 4.

## Scope

Add read schemas/routes, authenticated ownership enforcement, and cursor pagination.

## Out of Scope

Mutation routes or logs.

## Files

Create: `backend/app/routes/deployments.py`, `schemas/deployment.py`, API tests. Modify: `main.py` router wiring.

## Dependencies

TASK-012.

## Acceptance Criteria

- List/get/events are authorized, stable, paginated, and provider-neutral.

## Testing

- API authentication, cursor, ordering, and not-found tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

M (2–3 hours)

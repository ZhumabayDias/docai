# Expose Logs and Operational Read Models

## Objective

Provide authorized log access and identify stuck lifecycle work.

## Background

RFC-0001 §§8–9; Plan Phase 9.

## Scope

Add paginated log read route/UI separation and metrics/read models for delayed/failed/cleanup-pending deployments.

## Out of Scope

External analytics platform.

## Files

Create: log route/tests and operational metrics/read-model code. Modify: deployment UI/router/configuration.

## Dependencies

TASK-038, TASK-021.

## Acceptance Criteria

- Authorized users read logs separately; operations can query active work past deadline.

## Testing

- Authorization, cursor, and stuck-deployment tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

M (2–3 hours)

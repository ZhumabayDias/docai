# Add Frontend Deployment Client and Hooks

## Objective

Give the UI typed access to deployment resources.

## Background

RFC-0001 §9; Implementation Plan Phase 5.

## Scope

Add deployment types, API client functions, and list/detail query hooks.

## Out of Scope

Timeline UI or action controls.

## Files

Create: `frontend/src/{types/deployment.ts,services/deployments.ts,hooks/useDeployments.ts,hooks/useDeployment.ts}`.

## Dependencies

TASK-018.

## Acceptance Criteria

- Client represents public schemas and propagates safe API errors.

## Testing

- API-mock hook tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

S (1–3 hours)

# Add Frontend Deployment Actions

## Objective

Allow safe deploy, stop, and redeploy requests from Project UI.

## Background

RFC-0001 §9; Plan Phase 5.

## Scope

Add action controls, duplicate-submission protection, and accepted-state feedback.

## Out of Scope

Polling or streaming.

## Files

Create: `frontend/src/components/DeploymentActions.tsx`. Modify: Project details and deployment client.

## Dependencies

TASK-020, TASK-021.

## Acceptance Criteria

- Actions use idempotency semantics and show queued/accepted results without provider details.

## Testing

- Component/API-mock action tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

S (1–3 hours)

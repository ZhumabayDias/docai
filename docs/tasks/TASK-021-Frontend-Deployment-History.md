# Add Deployment History and Status UI

## Objective

Render deployments as Project-owned history, not Project status.

## Background

RFC-0001 §§2, 6; Implementation Plan Phase 5.

## Scope

Add timeline/status components and integrate deployment history into Project details.

## Out of Scope

Deploy/stop/redeploy controls or log viewing.

## Files

Create: timeline/status components. Modify: `frontend/src/pages/ProjectDetailsPage.tsx`, project types/status display.

## Dependencies

TASK-020.

## Acceptance Criteria

- UI distinguishes Project metadata from current Deployment Status and ordered events.

## Testing

- Component tests for every status and terminal reason.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

M (2–3 hours)

# Add Deployment CI Gate and Feature Flag

## Objective

Prevent unsafe merges while keeping new deployment behavior disabled.

## Background

Implementation Plan Phase 0.

## Scope

Add CI checks and configuration for an off-by-default deployment-engine feature gate.

## Out of Scope

Exposing new deployment routes.

## Files

Create: CI workflow/configuration. Modify: `backend/app/config.py`, dependency manifests, developer documentation.

## Dependencies

TASK-002.

## Acceptance Criteria

- Clean CI runs backend/frontend checks.
- Feature gate defaults disabled and is documented.

## Testing

- CI dry run; configuration-default test.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

S (1–3 hours)

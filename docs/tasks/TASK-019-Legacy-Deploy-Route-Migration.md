# Migrate Legacy Deploy Route

## Objective

Remove direct clone execution from the old route without breaking controlled clients.

## Background

RFC-0001 §§4, 9; Implementation Plan Phase 4.

## Scope

Delegate or feature-gate/deprecate `POST /projects/{id}/deploy` per migration note.

## Out of Scope

Removing all legacy Project fields.

## Files

Modify: `backend/app/routes/deploy.py`, `services/deploy_service.py`, route tests, migration documentation.

## Dependencies

TASK-017, TASK-018.

## Acceptance Criteria

- Legacy route never clones/runs source directly and has documented response behavior.

## Testing

- Characterization-to-delegation API tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

S (1–3 hours)

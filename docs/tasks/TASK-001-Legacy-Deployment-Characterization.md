# Characterize Legacy Deployment Behavior

## Objective

Capture existing deploy and Project-status behavior before replacement.

## Background

RFC-0001 §§3–4; Implementation Plan Phase 0.

## Scope

Add characterization tests and document current endpoint/status semantics.

## Out of Scope

Changing legacy behavior.

## Files

Create: `backend/tests/legacy/`, `docs/implementation/deployment-migration-notes.md`. Modify: legacy deploy-route test configuration.

## Dependencies

None.

## Acceptance Criteria

- Current deploy, project read, and status outcomes are reproducibly documented and tested.

## Testing

- Backend characterization tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

S (1–3 hours)

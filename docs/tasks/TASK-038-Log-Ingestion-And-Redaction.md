# Implement Log Ingestion and Redaction Boundary

## Objective

Capture correlated diagnostics without treating logs as lifecycle events.

## Background

RFC-0001 §6 and §12; Plan Phase 9.

## Scope

Add log port/store boundary, deployment correlation, redaction, size/rate/retention controls.

## Out of Scope

Live log streaming or event-state changes.

## Files

Create: observability logs/redaction/tests, `docs/implementation/logging-and-redaction.md`. Modify: adapter hooks.

## Dependencies

TASK-031, TASK-035.

## Acceptance Criteria

- Logs remain separate from Deployment Events; secret corpus and limits tests pass.

## Testing

- Redaction, retention, high-volume, and correlation tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

M (2–3 hours)

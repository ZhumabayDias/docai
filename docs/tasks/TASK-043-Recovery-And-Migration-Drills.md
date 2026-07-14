# Run Recovery and Migration Drills

## Objective

Produce operational evidence that deployment state and resources recover safely.

## Background

RFC-0001 §§4, 8, 12; Plan Phase 11.

## Scope

Rehearse backup/restore, migration, dispatcher outage, worker restart, and orphan cleanup; record results/runbook.

## Out of Scope

Remediation of unrelated drill findings.

## Files

Create: `docs/operations/deployment-engine-runbook.md`, drill evidence. Modify: release checklist.

## Dependencies

TASK-042.

## Acceptance Criteria

- Each drill has reproducible steps, result, owner, and follow-up for failures.

## Testing

- Controlled rehearsal in non-production environment.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

M (2–3 hours)

# Integrate Health into Deployment Orchestration

## Objective

Gate `Healthy` on policy verification and clean up terminal failures.

## Background

RFC-0001 §5; Plan Phase 10.

## Scope

Add retry/deadline/cancellation handling, health events, and cleanup before `health_check_failure`.

## Out of Scope

Automatic redeploy or traffic management.

## Files

Modify: orchestrator, Docker release integration, DTO/UI labels. Create: orchestration health tests.

## Dependencies

TASK-035, TASK-040.

## Acceptance Criteria

- Only a passed policy makes `Healthy`; stop cancels checks; terminal failure cleans allocation.

## Testing

- Retry, cancellation, flapping, and late-result tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

M (2–3 hours)

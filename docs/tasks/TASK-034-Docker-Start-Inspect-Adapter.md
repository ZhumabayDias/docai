# Implement Docker Start and Inspect Adapter

## Objective

Implement initial Execution Environment start/inspect operations behind the port.

## Background

RFC-0001 §11; Plan Phase 8.

## Scope

Translate provider-neutral execution specification, return opaque reference, and normalize start/inspect results.

## Out of Scope

Status mutation, release, or public Docker fields.

## Files

Create: Docker adapter/start-inspect tests. Modify: dependency injection/configuration.

## Dependencies

TASK-031, TASK-033.

## Acceptance Criteria

- Adapter accepts no Docker-only domain input and never writes Deployment Status.

## Testing

- Client-fake tests plus gated safe-workload start test.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

M (2–3 hours)

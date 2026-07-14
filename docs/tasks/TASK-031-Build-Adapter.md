# Implement Build Adapter and Artifact Result

## Objective

Prepare source into an immutable artifact through the build port.

## Background

RFC-0001 §§2, 10; Plan Phase 7.

## Scope

Implement MVP build adapter, artifact correlation, and build-failure normalization.

## Out of Scope

Buildpacks, remote cache, or Docker execution.

## Files

Create: build adapter/tests. Modify: orchestrator and observability correlation hooks.

## Dependencies

TASK-030.

## Acceptance Criteria

- Success returns immutable artifact reference; failures become safe `build_failure` outcomes.

## Testing

- Controlled fixture success and malformed-build failure tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

M (2–3 hours)

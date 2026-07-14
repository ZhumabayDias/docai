# Add Docker Integration Test Gate

## Objective

Make real-provider testing safe, isolated, and release-relevant.

## Background

RFC-0001 §§11–12; Plan Phase 8.

## Scope

Add opt-in CI job, dedicated resource labeling, timeout, and mandatory cleanup verification.

## Out of Scope

General CI redesign.

## Files

Modify: CI and deploy configuration. Create: Docker integration test harness.

## Dependencies

TASK-035.

## Acceptance Criteria

- Adapter changes run gated integration tests that verify no workload leak.

## Testing

- Intentional start failure and cleanup test job.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

S (1–3 hours)

# Define Source and Artifact Contracts

## Objective

Specify reproducible inputs and provider-neutral build outputs.

## Background

RFC-0001 §§2–3, 11; Plan Phase 7.

## Scope

Define pinned source, workspace ownership, artifact reference, and retention contracts.

## Out of Scope

Git clone/build implementation.

## Files

Create: `docs/implementation/build-contract.md`, source/build contract tests. Modify: source/build ports.

## Dependencies

TASK-024.

## Acceptance Criteria

- Contracts contain immutable references, no credentials, and no Docker assumptions.

## Testing

- Contract validation tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

S (1–3 hours)

# Define Deployment Types and Specification

## Objective

Introduce provider-neutral Deployment Status, failure categories, and immutable input.

## Background

RFC-0001 §§2–3, 5; Implementation Plan Phase 1.

## Scope

Create domain value types for status, specification snapshot, release input, and lineage.

## Out of Scope

Persistence, framework imports, or provider references.

## Files

Create: `backend/app/deployment_management/domain/{status,specification,failures}.py`. Modify: package initializers only.

## Dependencies

TASK-003.

## Acceptance Criteria

- Types express RFC states/categories and reject mutable/secret-bearing specification data.

## Testing

- Domain unit tests for validation and immutability.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

S (1–3 hours)

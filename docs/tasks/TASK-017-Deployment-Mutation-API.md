# Expose Deployment Mutation API

## Objective

Expose asynchronous create, stop, and redeploy commands.

## Background

RFC-0001 §9; Implementation Plan Phase 4.

## Scope

Add mutation schemas/routes, idempotency-key extraction, and safe error mapping.

## Out of Scope

Worker execution or legacy-route compatibility.

## Files

Modify: deployment routes/schemas/API tests.

## Dependencies

TASK-015, TASK-016.

## Acceptance Criteria

- Mutations return accepted resource state, require idempotency key, and never block for execution.

## Testing

- API duplicate-key, transition-error, and validation tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

M (2–3 hours)

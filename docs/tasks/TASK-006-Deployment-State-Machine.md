# Implement and Test Deployment State Machine

## Objective

Make RFC-0001 lifecycle transitions the only domain authority.

## Background

RFC-0001 §5; Implementation Plan Phase 1.

## Scope

Implement transition validation, stop precedence, terminal rules, and architecture-import tests.

## Out of Scope

Worker retries or provider observations.

## Files

Create: `backend/app/deployment_management/domain/state_machine.py`, domain/architecture tests. Modify: aggregate.

## Dependencies

TASK-005.

## Acceptance Criteria

- Full valid/invalid matrix passes; late success cannot revive stopped/terminal deployments.
- Domain imports no FastAPI, SQLAlchemy, Docker, or subprocess module.

## Testing

- Table-driven and property-style domain tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

M (2–3 hours)

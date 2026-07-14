# Implement Deployment Aggregate and Events

## Objective

Represent a single deployment attempt and its ordered domain facts.

## Background

RFC-0001 §3 and §6; Implementation Plan Phase 1.

## Scope

Create aggregate commands, immutable event envelope, sequence handling, and terminal outcome data.

## Out of Scope

State transition policy implementation or database mappings.

## Files

Create: `backend/app/deployment_management/domain/{deployment,events,commands}.py`; domain tests.

## Dependencies

TASK-004.

## Acceptance Criteria

- Aggregate preserves Project ownership, immutable facts, ordered events, and safe payloads.

## Testing

- Unit tests for creation, event sequence, lineage, and payload safety.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

S (1–3 hours)

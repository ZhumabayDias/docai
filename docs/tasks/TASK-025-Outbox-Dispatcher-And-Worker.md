# Implement Outbox Dispatcher and Worker Entry Point

## Objective

Deliver durable work records at least once outside request handling.

## Background

RFC-0001 §4.2; Plan Phase 6.

## Scope

Implement dispatch claiming/delivery and a restartable worker entry point.

## Out of Scope

Stage orchestration or provider adapters.

## Files

Create: dispatch infrastructure, `backend/app/worker.py`, tests. Modify: configuration/deploy docs.

## Dependencies

TASK-010, TASK-024.

## Acceptance Criteria

- Crash-safe records are redelivered; request handlers do not execute work.

## Testing

- Duplicate-delivery and dispatcher-restart tests.

## Review Checklist

- [ ] Architecture/RFC/plan compliant; no unrelated changes; tests and docs included.

## Estimated Size

M (2–3 hours)

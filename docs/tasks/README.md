# DocAI Cloud Deployment Task Backlog

## Project Overview

This directory converts the approved Deployment Engine implementation plan into pull-request-sized engineering work. The architecture remains defined by [RFC-0001](../rfcs/RFC-0001-Deployment-Engine.md); sequencing and delivery constraints remain defined by the [Deployment Implementation Plan](../implementation/DEPLOYMENT_IMPLEMENTATION_PLAN.md). A task may clarify implementation detail, but it must not redesign either source document.

The backlog delivers a provider-neutral deployment lifecycle first. Docker appears only after domain, persistence, asynchronous orchestration, source/build, and fake-provider recovery behavior are proven.

## Task Numbering Strategy

`TASK-NNN-Short-Name.md` uses a monotonic three-digit identifier. IDs are never reused. Related tasks are grouped by epic in `BACKLOG.md`, not by renumbering. A superseded task remains in history and is marked superseded in the backlog rather than deleted.

## Dependency Rules

- Complete every listed dependency before implementation begins, unless `BACKLOG.md` explicitly permits parallel work.
- Dependencies are outcomes, not merely merged pull requests; their acceptance criteria and tests must pass.
- A task must not introduce a provider dependency into `backend/app/deployment_management/domain/`.
- A task must not bypass the state machine, write Deployment Status from an adapter, or mutate Deployment history.
- If a task discovers an architectural conflict, stop and open an RFC/plan review rather than inventing a local exception.

## Workflow

1. Select the first unblocked task in `BACKLOG.md`.
2. Read its dependencies, relevant RFC sections, and implementation-plan phase.
3. Create one branch and one focused pull request for that task.
4. Implement only its scope, including required tests and documentation.
5. Run required checks locally and in CI; attach evidence to the pull request.
6. Update task/epic progress only after merge and verification in the target integration environment.

## Review Process

Every pull request must use the task's Review Checklist. Reviewers additionally verify: no unrelated refactor is bundled; public API/provider boundaries remain stable; migrations are forward-only and tested; security-sensitive work has the named reviewer; and test failure modes match the task's acceptance criteria. Docker, secrets, execution isolation, and migration changes require backend and platform/security review as applicable.

## Completion Process

A task is complete only when its acceptance checklist is satisfied, required tests pass in CI, documentation is updated, and the pull request is merged. Mark its backlog checkbox complete, add the merged PR/reference if the tracker supports it, and unblock dependents. A milestone is complete only when all mapped tasks meet this definition and its Definition of Done in the implementation plan is evidenced.

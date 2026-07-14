# Deployment Migration Notes

## Purpose

These notes capture the legacy deployment behavior that exists before RFC-0001 is implemented. They are a migration aid only. They do not redefine the approved Deployment Management architecture.

## Architectural boundary

RFC-0001 makes Deployment Management the owner of deployment lifecycle, Deployment Status, and Deployment Events. The current implementation predates that boundary:

- deployment is requested through project routes;
- deployment work runs synchronously in the request path;
- `Project.status` is mutated to represent deployment progress;
- source retrieval is executed directly by `DeployService`;
- there is no Deployment aggregate, Deployment Event, Deployment History, outbox, worker, or Execution Environment port.

This behavior is intentionally characterized by tests so later tasks can replace it without guessing what users and callers currently observe.

## Current legacy behavior

| Scenario | Observed behavior |
| --- | --- |
| Read project before deployment | `GET /api/projects/{project_id}` returns the project with status `CREATED`. |
| Deploy through API route | `POST /api/projects/{project_id}/deploy` runs deployment work synchronously and returns a project representation whose status is `RUNNING` on success. |
| Deploy through legacy route | `POST /projects/{project_id}/deploy` runs the same deployment work and returns only `{"status": "RUNNING"}` on success. |
| Deployment side effects | The service deletes any existing deployment directory for the project, recreates it, and invokes `git clone` into that directory. |
| Deployment failure | If source retrieval or later synchronous work raises, the service persists `Project.status = FAILED` and the request returns a server error. |
| Project read after success | Subsequent project reads expose `Project.status = RUNNING`. |
| Project read after failure | Subsequent project reads expose `Project.status = FAILED`. |
| Cross-user project access | Reads and deploy requests for another user's project return `404 Project not found`. |
| Missing authentication | Deploy requests without the authentication cookie return `401 Not authenticated`. |

## Migration implications

`Project.status` is legacy compatibility state. It must not become the source of truth for RFC-0001 Deployment Status. Future tasks should introduce Deployment-owned state in parallel, then migrate route behavior deliberately.

During replacement, engineers should preserve these externally visible behaviors only where the implementation plan explicitly requires compatibility. The RFC-compliant target is asynchronous Deployment creation, immutable Deployment History, and lifecycle transitions owned by the Deployment state machine.

## Characterization tests

The legacy behavior is pinned in `backend/tests/legacy/test_legacy_deploy_characterization.py`. The tests isolate the database, deployment directory, sleep, and subprocess calls so they verify application semantics without relying on the developer machine, GitHub, or the production SQLite database.

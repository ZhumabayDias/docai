# DocAI Cloud Engineering Guide

Version: 1.0

---

# Introduction

This document defines the engineering standards for the DocAI Cloud project.

Every contributor should read this document before making changes to the codebase.

The purpose of this guide is to ensure that the project remains consistent, maintainable, scalable and easy to understand as it grows.

The rules described here are not suggestions.

They represent the engineering standards of the project.

---

# 1. Engineering Philosophy

Engineering is not about writing the largest amount of code.

Engineering is about solving problems with the simplest architecture that can support future growth.

Every decision should improve one or more of the following:

- Maintainability
- Readability
- Reliability
- Scalability
- Security

Never optimize for speed at the expense of architecture.

Always assume that another engineer will maintain your code in the future.

Code is written once but read many times.

Readable code is more valuable than clever code.

Small improvements made consistently are preferred over large rewrites.

Consistency is more important than personal coding style.

---

# 2. Core Principles

## Simplicity

Prefer the simplest solution that correctly solves the problem.

Do not introduce complexity before it becomes necessary.

---

## Maintainability

Every new feature should make the project easier—not harder—to maintain.

Avoid solutions that increase coupling between modules.

---

## Modularity

The system should be divided into small independent modules.

Each module should have a single responsibility.

---

## Scalability

Design the architecture so new functionality can be added without major refactoring.

Future features should extend the architecture rather than replace it.

---

## Reusability

Business logic should be reusable.

Avoid duplicated code.

If the same logic appears twice, consider extracting it.

---

## Predictability

The project should follow consistent conventions.

Developers should always know where to find specific functionality.

---

## Security

Security is part of development.

It is never an afterthought.

Protect secrets.

Validate input.

Trust nothing by default.

---

# 3. Engineering Mindset

Before writing code ask yourself:

Why is this feature needed?

Does a similar solution already exist?

Can existing code be reused?

Will this still make sense in one year?

Can another developer understand this without explanation?

If the answer is "no", reconsider the implementation.

---

# 4. Long-Term Thinking

Every feature should be implemented with future growth in mind.

However,

do not implement future functionality today.

Build only what is needed now.

Design so future functionality can be added later.

This is called extensibility.

Extensibility is preferred over premature optimization.

---

# 5. Technical Debt

Technical debt is acceptable only when:

- documented
- temporary
- intentional

Never introduce technical debt accidentally.

Every workaround must include an explanation.

Never leave mysterious code.


# 6. Architecture Rules

The architecture of DocAI Cloud follows a layered design.

Each layer has a clearly defined responsibility.

A layer may only communicate with the layer directly below it.

No shortcuts are allowed.

---

## System Layers

```
Frontend

↓

REST API

↓

Routes

↓

Services

↓

Repositories

↓

Database
```

Each layer must remain independent.

Business logic must never leak into other layers.

---

## Dependency Direction

Dependencies must always point downward.

Correct:

Frontend

↓

Routes

↓

Services

↓

Repositories

↓

Database

Incorrect:

Repository → Service

Database → Routes

Service → Route

Model → Repository

No circular dependencies are allowed.

---

## Separation of Concerns

Each layer has one responsibility.

Routes coordinate requests.

Services implement business logic.

Repositories access data.

Models represent entities.

Schemas define API contracts.

Utilities provide reusable helper functions.

Mixing responsibilities is prohibited.

---

## Business Logic

Business logic belongs only inside Services.

Business logic must never exist inside:

- Routes
- Repositories
- Models
- Schemas

Services are responsible for orchestrating workflows.

---

## Repository Pattern

Repositories are responsible only for data persistence.

Repositories:

- query the database
- insert records
- update records
- delete records

Repositories must never:

- validate business rules
- call Docker
- call GitHub
- calculate deployment status
- contain workflow logic

Repositories answer the question:

"How do we store or retrieve data?"

Nothing more.

---

## Service Layer

Services answer the question:

"How does the system behave?"

A service may:

- validate business rules
- coordinate repositories
- call external services
- start deployments
- update deployment status
- trigger DockerService
- trigger GitHubService

Services should never contain SQL.

---

## Routes

Routes represent the API surface.

Responsibilities:

- authenticate users
- authorize requests
- validate request data
- call services
- return responses

Routes should contain almost no business logic.

As a rule, a route should fit comfortably on one screen.

If a route becomes large, move logic into a Service.

---

## Models

Models describe persistent entities.

Models should contain:

- fields
- relationships
- constraints

Models should never:

- perform deployments
- communicate with Docker
- access GitHub
- execute business workflows

---

## Schemas

Schemas define communication between the backend and clients.

Schemas exist only for validation and serialization.

Schemas are not business objects.

Schemas should remain simple.

---

## Utilities

Utility functions should remain generic.

Good examples:

- date formatting
- slug generation
- hashing
- string helpers

Utilities must never know about:

Projects

Deployments

Users

Business workflows

---

## External Services

Every external system must have its own Service.

Examples:

GitHubService

DockerService

LogService

NotificationService

RuntimeDetector

No other module should communicate directly with external systems.

---

## Dependency Injection

Dependencies should be injected.

Avoid creating dependencies manually inside business logic.

This improves:

- testing
- readability
- flexibility

---

## Single Responsibility Principle

Every class should have one reason to change.

If a class performs multiple unrelated tasks, split it.

Large classes become difficult to maintain.

---

## Open / Closed Principle

Modules should be open for extension.

Modules should be closed for modification.

New functionality should extend the architecture rather than rewrite existing components.

---

## Code Duplication

Duplicated business logic is not allowed.

If similar logic appears multiple times:

Extract it.

Reuse it.

Document it.

---

## File Size

Large files are difficult to understand.

Recommended limits:

Routes:
< 200 lines

Services:
< 300 lines

Repositories:
< 250 lines

If a file continues to grow,
consider splitting responsibilities.

These are guidelines, not strict limits.

---

## Class Size

Large classes are difficult to reason about.

Prefer many focused classes over one massive class.

Avoid "God Objects".

---

## Coupling

Keep coupling low.

Changing one module should not require changes across the entire project.

Modules should communicate through clear interfaces.

---

## Cohesion

Each module should represent one concept.

Examples:

ProjectService

DeploymentService

DockerService

Avoid creating services that manage unrelated concepts.

---

## Error Handling

Errors should be handled at the appropriate layer.

Repositories report database failures.

Services decide what those failures mean.

Routes translate failures into HTTP responses.

Never expose internal implementation details to clients.

---

## Logging

Every important business operation should generate logs.

Examples:

Deployment started

Deployment completed

Deployment failed

Project deleted

Repository imported

Logs should explain what happened.

Not simply that something happened.

---

## Future-Proof Design

The architecture should allow future additions without major refactoring.

Examples:

New runtimes

New deployment strategies

New databases

New cloud providers

New authentication providers

Good architecture grows through extension,
not replacement.

---

## Architecture Rule

Whenever uncertain,
choose the solution that keeps the architecture simpler.

---

# 7. CI and Deployment Feature Gate

Pull requests must keep backend and frontend checks passing.

The CI workflow runs:

- backend dependency installation
- backend tests with `python -m pytest backend/tests`
- frontend dependency installation
- frontend lint with `npm run lint`
- frontend build with `npm run build`

The RFC-0001 Deployment Engine is guarded by `DEPLOYMENT_ENGINE_ENABLED`.

The flag defaults to disabled. Do not expose new deployment-engine routes or behavior unless a later task explicitly requires it.

# Architecture Decisions

Version: 1.0

---

# Purpose

This document records the most important architectural decisions made during the development of DocAI Cloud.

The goal is to explain why a decision was made.

This document is not a changelog.

It records reasoning rather than implementation.

Every major architectural decision should be added here.

---

# Decision Template

Every new decision follows this format.

## Decision

Describe the architectural decision.

### Date

YYYY-MM-DD

### Status

Accepted

### Context

Why was this decision needed?

### Decision

What was chosen?

### Alternatives

What other options were considered?

### Consequences

Positive consequences.

Negative consequences.

Future impact.

---

# ADR-001

## Date

2026-07-14

## Status

Accepted

## Title

Repository Pattern

## Context

Business logic and database logic should remain independent.

As the project grows, direct database access inside API routes would make maintenance increasingly difficult.

## Decision

The project adopts the Repository Pattern.

Repositories become the only layer responsible for communicating with the database.

Services use repositories instead of SQLAlchemy sessions directly.

## Alternatives

Direct SQLAlchemy access inside routes.

Active Record pattern.

## Consequences

Positive

- Better separation of concerns.
- Easier testing.
- Cleaner architecture.
- Easier migration to PostgreSQL.

Negative

- Slightly more boilerplate.

Future Impact

Supports long-term scalability.


# ADR-002

## Title

Service Layer

## Context

Business logic should not be mixed with HTTP endpoints.

## Decision

Every business workflow will be implemented inside Services.

Routes coordinate requests only.

## Alternatives

Business logic inside Routes.

## Consequences

Positive

- Cleaner API.

- Reusable logic.

- Easier testing.

Negative

- More classes.

Future Impact

Supports larger business workflows.


# ADR-003

## Title

FastAPI

## Context

The backend requires high performance and modern Python features.

## Decision

Use FastAPI.

## Alternatives

Django

Flask

## Consequences

Positive

Async support.

Automatic OpenAPI.

Dependency Injection.

Negative

Smaller ecosystem than Django.


# ADR-004


## Title

React + TypeScript

## Context

The frontend requires reusable components and maintainable code.

## Decision

React with TypeScript.

## Alternatives

Vue

Angular

Plain HTML

## Consequences

Positive

Large ecosystem.

Strong typing.

Component architecture.

Negative

Higher learning curve.



# ADR-005

## Title

SQLite for MVP

## Context

The project is currently developed by one engineer.

The primary goal is rapid development.

## Decision

SQLite will be used until PostgreSQL becomes necessary.

## Alternatives

PostgreSQL from day one.

## Consequences

Positive

Very fast development.

Simple deployment.

Negative

Limited scalability.

Migration Plan

PostgreSQL during Platform Phase.



# ADR-006

## Title

Docker Runtime

## Context

Applications require isolated execution.

## Decision

Every deployment runs inside Docker.

## Alternatives

Direct execution.

Virtual Machines.

## Consequences

Positive

Isolation.

Portability.

Predictability.

Negative

Additional resource usage.



# ADR-007

## Title

Deployment-Centric Architecture

## Context

A project may be deployed multiple times.

Each deployment has independent logs, status and runtime.

## Decision

Deployment becomes a first-class entity.

Projects never own runtime state.

Deployments own runtime state.

## Alternatives

Store deployment state inside Project.

## Consequences

Positive

Deployment history.

Rollback.

Logs.

Scalability.

Negative

Additional database tables.



# ADR-008

## Title

GitHub as Source of Truth

## Context

Development happens on macOS while production runs on Linux.

Manual synchronization causes drift.

## Decision

GitHub becomes the single source of truth.

Development happens locally.

Production receives changes from GitHub.

## Alternatives

Editing production directly.

Manual file copying.

## Consequences

Positive

Reliable workflow.

Version history.

Safer deployments.

Negative

Requires Git workflow.



# ADR-009

## Title

Layered Architecture

## Context

The project should remain maintainable as features grow.

## Decision

Adopt a layered architecture:

Routes

↓

Services

↓

Repositories

↓

Database

## Alternatives

Fat routes.

Direct ORM access.

## Consequences

Positive

Clear responsibilities.

Scalable architecture.

Negative

More files.



# ADR-010

## Title

Documentation First

## Context

Long-term projects often lose architectural consistency.

## Decision

Major architectural decisions must be documented before large implementation work.

## Alternatives

Code first.

Documentation later.

## Consequences

Positive

Shared understanding.

Better onboarding.

Better AI assistance.

Negative

Slightly slower initial development.
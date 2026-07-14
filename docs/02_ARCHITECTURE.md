# DocAI Cloud Architecture

Version: 1.0

---

# 1. System Overview

DocAI Cloud is a Platform-as-a-Service (PaaS) that allows users to deploy applications directly from GitHub repositories.

The platform automates the deployment lifecycle while keeping the architecture simple, maintainable and scalable.

The first version focuses on supporting Python and Node.js applications running inside Docker containers.

---

# 2. High Level Architecture

```
                User
                  │
                  ▼
        React Frontend (Vite)
                  │
          HTTPS REST API
                  │
                  ▼
          FastAPI Backend
                  │
        ┌─────────┴─────────┐
        │                   │
        ▼                   ▼
 Business Services     GitHub API
        │
        ▼
 SQLAlchemy Repositories
        │
        ▼
     SQLite Database
        │
        ▼
 Docker Runtime
        │
        ▼
 Linux Server
```

---

# 3. Domain Model

The system is composed of several core business entities.

```
User
 │
 ├────────────── owns ──────────────┐
 │                                  │
 ▼                                  ▼
Project                     GitHub Repository
 │
 ├────────────── has many ──────────┐
 │                                  │
 ▼                                  ▼
Deployment                  Environment Variables
 │
 ├────────────── creates ───────────┐
 │                                  │
 ▼                                  ▼
Docker Container               Deployment Logs
```

---

# 4. Core Entities

## User

Represents an authenticated GitHub user.

Responsibilities:

- Login with GitHub
- Own projects
- Create deployments
- Manage deployments

---

## Repository

Represents a GitHub repository.

Repository is NOT owned by DocAI.

DocAI stores only metadata.

Examples:

- repository name
- owner
- clone url
- default branch

---

## Project

Represents one deployable application.

Examples:

- Portfolio
- Blog
- API
- Telegram Bot

A project exists independently from deployments.

One project may have many deployments.

---

## Deployment

Represents one deployment attempt.

Every press of the Deploy button creates a new Deployment.

Deployment stores:

- status
- commit SHA
- branch
- timestamps
- logs
- container information

Deployments are immutable.

Old deployments are never modified.

---

## Container

Represents one Docker container.

Container stores:

- container id
- image
- exposed port
- runtime status

---

## Environment Variable

Stores secrets and configuration.

Examples:

DATABASE_URL

JWT_SECRET

OPENAI_API_KEY

Environment variables belong to Project.

Every deployment receives a snapshot of current variables.

---

## Deployment Log

Stores build and runtime logs.

Logs belong only to Deployment.

Never to Project.

---

# 5. Relationships

```
User
 │
 └──────────────┐
                │
                ▼
            Project
                │
      ┌─────────┴─────────┐
      │                   │
      ▼                   ▼
Environment         Deployment
Variables                │
                          │
                          ▼
                    Docker Container
                          │
                          ▼
                         Logs
```

---

# 6. Deployment Lifecycle

Every deployment follows the same lifecycle.

```
PENDING

↓

CLONING

↓

DETECTING_RUNTIME

↓

BUILDING

↓

STARTING

↓

HEALTH_CHECK

↓

RUNNING
```

Possible failure states:

```
FAILED

STOPPED

CANCELLED
```

Future states may be added without breaking existing architecture.

---

# 7. Backend Layers

The backend follows a layered architecture.

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

Each layer has a single responsibility.

---

## Routes

Responsibilities:

- Validate requests
- Authenticate users
- Call services
- Return responses

Routes must never contain business logic.

---

## Services

Responsibilities:

- Business logic
- Workflow orchestration
- Service coordination

Services must never execute SQL directly.

---

## Repositories

Responsibilities:

- Database operations
- SQLAlchemy queries
- Transactions

Repositories must never contain business logic.

---

## Database

Stores application state.

Current database:

SQLite

Future:

PostgreSQL

Architecture must remain database-independent.

---

# 8. Major Services

The backend is composed of several independent services.

## GitHubService

Responsibilities:

- OAuth
- User information
- Repository import

---

## ProjectService

Responsibilities:

- Create project
- Delete project
- Update project
- Repository synchronization

---

## DeploymentService

Responsibilities:

- Create deployment
- Start deployment
- Monitor deployment
- Update deployment status

DeploymentService must never execute Docker commands directly.

---

## DockerService

Responsibilities:

- Build image
- Run container
- Stop container
- Remove container
- Inspect container
- Read logs

DockerService is the only component allowed to communicate with Docker.

---

## RuntimeDetector

Responsibilities:

- Detect project type

Examples:

Python

Node.js

Dockerfile

Future:

Go

Java

Rust

PHP

---

## LogService

Responsibilities:

- Store deployment logs
- Stream logs
- Retrieve logs

---

# 9. Current Technology Stack

Backend

- FastAPI
- SQLAlchemy
- Python

Frontend

- React
- TypeScript
- Vite
- TailwindCSS

Infrastructure

- Rocky Linux
- Docker
- Nginx
- systemd
- Cloudflare

Database

Current:

SQLite

Future:

PostgreSQL

---

# 10. Architectural Principles

The architecture follows these principles.

## Separation of Concerns

Every layer has exactly one responsibility.

---

## Single Responsibility Principle

Every class should have only one reason to change.

---

## Reusability

Business logic must be reusable.

Never duplicate code.

---

## Scalability

The architecture should allow adding:

- new runtimes
- deployment history
- custom domains
- build queues
- PostgreSQL

without major refactoring.

---

## Security

Never store secrets inside source code.

Never expose tokens.

Always use environment variables.

---

# 11. Future Architecture

Planned modules.

Phase 1

- Deployment Engine

Phase 2

- Docker Runtime

Phase 3

- Deployment Logs

Phase 4

- Environment Variables

Phase 5

- Domains

Phase 6

- Health Checks

Phase 7

- Automatic Redeploy

Phase 8

- Scaling

---

# 12. Architecture Rules

Business logic belongs inside Services.

SQL belongs inside Repositories.

Docker belongs inside DockerService.

Routes coordinate requests only.

No layer may bypass another layer.

Maintainability is preferred over short-term development speed.

The architecture must remain simple, modular and easy to extend.
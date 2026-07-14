# DocAI Cloud Roadmap

Version: 1.0

---

# Purpose

This roadmap defines the long-term development strategy of DocAI Cloud.

The goal is not to build every possible feature.

The goal is to build a stable, maintainable and production-ready Platform-as-a-Service step by step.

Each phase should deliver real value to users while preserving architectural quality.

---

# Product Vision

DocAI Cloud will evolve from a simple deployment application into a complete cloud deployment platform.

Development follows one principle:

Build a solid foundation before adding complexity.

Features should be introduced gradually.

Every phase should leave the system in a deployable state.

---

# Current Status

Infrastructure

✅ Linux Server

✅ Nginx

✅ HTTPS

✅ Cloudflare

✅ Docker Installed

✅ Git

Backend

✅ FastAPI

✅ SQLAlchemy

✅ GitHub OAuth

✅ JWT Authentication

Frontend

✅ React

✅ TypeScript

✅ Dashboard

Deployment

🚧 Deployment Engine

---

# Phase 1

## Deployment Foundation

Goal

Create a complete deployment domain model.

This phase establishes the foundation for every future feature.

Deliverables

- Deployment Model
- Deployment Repository
- Deployment Service
- Deployment API
- Deployment Status Machine
- Deployment History
- Deployment Details Page

Result

Users can create and manage deployments.

Deployments exist independently from projects.

Status

Current Phase

---

# Phase 2

## Runtime Engine

Goal

Run real applications.

Deliverables

- DockerService
- Runtime Detection
- Docker Build
- Docker Run
- Docker Stop
- Docker Restart
- Docker Remove

Supported Runtimes

Python

Node.js

Dockerfile

Result

Applications become deployable.

---

# Phase 3

## Build System

Goal

Automate application builds.

Deliverables

- Git Clone
- Runtime Detection
- Build Pipeline
- Docker Image Creation
- Build Logs
- Build Status

Result

Deployment becomes automatic.

---

# Phase 4

## Environment Management

Goal

Support production configuration.

Deliverables

- Environment Variables
- Secret Management
- Runtime Configuration
- Variable Validation

Result

Applications become configurable without rebuilding.

---

# Phase 5

## Monitoring

Goal

Give users visibility.

Deliverables

- Deployment Logs
- Live Logs
- Health Checks
- Container Status
- Resource Usage

Result

Users can understand deployment behavior.

---

# Phase 6

## Developer Experience

Goal

Improve deployment workflow.

Deliverables

- Redeploy
- Restart
- Rollback
- Deployment History
- Deployment Comparison
- Favorite Projects

Result

Daily usage becomes faster.

---

# Phase 7

## Domains

Goal

Allow applications to become publicly accessible.

Deliverables

- Custom Domains
- Automatic HTTPS
- Domain Validation
- SSL Certificates

Result

Applications become production-ready.

---

# Phase 8

## Scaling

Goal

Support larger workloads.

Deliverables

- PostgreSQL
- Background Workers
- Job Queue
- Multiple Containers
- Horizontal Scaling

Result

Platform supports larger applications.

---

# Phase 9

## Platform Intelligence

Goal

Provide operational insights.

Deliverables

- Metrics
- Performance Dashboard
- Deployment Analytics
- Build Statistics
- Failure Analysis

Result

Developers understand platform behavior.

---

# Future Features

Potential future modules.

- Notifications
- Team Collaboration
- Organizations
- CLI
- REST API Tokens
- Webhooks
- Deployment Templates
- Marketplace
- Billing
- Usage Limits

These features are intentionally postponed.

---

# Current Sprint

Current Goal

Build Deployment Engine.

Tasks

☐ Deployment Model

☐ Deployment Repository

☐ Deployment Service

☐ Deployment API

☐ Deployment Status Machine

☐ Deployment History

☐ UI Integration

Completion Criteria

Users can create deployments.

Deployments have statuses.

Deployments are stored in the database.

Deployments are visible in the UI.

---

# Definition of MVP

The MVP is complete when users can:

Login using GitHub.

Import repositories.

Create projects.

Deploy applications.

View deployment status.

View deployment logs.

Manage environment variables.

Access applications through HTTPS.

---

# Success Metrics

Technical

Deployment Success Rate

Deployment Duration

Average Build Time

System Availability

Application Response Time

Product

Active Users

Successful Deployments

Projects Created

Average Deployments per User

---

# Roadmap Principles

The roadmap is a living document.

Features may move between phases.

Architecture quality is more important than release speed.

Every phase should leave the platform stable.

Every completed phase must improve the user experience.

No feature should compromise the engineering principles defined in the Engineering Guide.
# ZCAT Backend Architecture — Enterprise-Grade Design

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Folder Structure](#folder-structure)
3. [Database Schema](#database-schema)
4. [Authentication & Security](#authentication--security)
5. [Code Execution Engine](#code-execution-engine)
6. [Realtime Architecture](#realtime-architecture)
7. [API Design](#api-design)
8. [Performance Optimization](#performance-optimization)
9. [Monitoring & Logging](#monitoring--logging)
10. [DevOps & Deployment](#devops--deployment)
11. [Implementation Order](#implementation-order)

---

## Architecture Overview

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│  Next.js 15 App Router + React Query + Zustand + WebSockets    │
└────────────────────────┬────────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                      API GATEWAY LAYER                           │
│  Edge Middleware → Rate Limiting → Auth → Validation            │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌─────▼─────┐  ┌──────▼──────┐
│ Server       │  │   Route    │  │  WebSocket  │
│ Actions      │  │  Handlers  │  │   Server    │
└───────┬──────┘  └─────┬─────┘  └──────┬──────┘
        │                │                │
        └────────────────┼────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────────┐
│                     SERVICE LAYER                                │
│  Business Logic + Domain Services + Use Cases                   │
└────────────────────────┬────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌─────▼─────┐  ┌──────▼──────┐
│ Repository   │  │   Cache    │  │    Queue    │
│   Layer      │  │   Layer    │  │   Layer     │
└───────┬──────┘  └─────┬─────┘  └──────┬──────┘
        │                │                │
┌───────▼──────┐  ┌─────▼─────┐  ┌──────▼──────┐
│  PostgreSQL  │  │   Redis    │  │   BullMQ    │
│  (Supabase)  │  │  (Upstash) │  │   Workers   │
└──────────────┘  └────────────┘  └──────┬──────┘
                                          │
                                  ┌───────▼──────┐
                                  │    Docker    │
                                  │   Sandbox    │
                                  └──────────────┘
```

### Core Principles

1. **Separation of Concerns**: Clear boundaries between layers
2. **Dependency Injection**: Loose coupling, high testability
3. **Domain-Driven Design**: Business logic encapsulation
4. **CQRS Pattern**: Separate read/write operations
5. **Event-Driven**: Async processing for heavy operations
6. **Microservice-Ready**: Easy to extract services later

---

## Folder Structure

```
zcat/
├── src/
│   ├── app/                              # Next.js App Router
│   │   ├── (auth)/
│   │   ├── (dashboard)/
│   │   ├── api/                          # API Route Handlers
│   │   │   ├── v1/
│   │   │   │   ├── assessments/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── route.ts
│   │   │   │   │       ├── submit/route.ts
│   │   │   │   │       └── results/route.ts
│   │   │   │   ├── submissions/
│   │   │   │   │   ├── route.ts
│   │   │   │   │   └── [id]/
│   │   │   │   │       ├── route.ts
│   │   │   │   │       └── execute/route.ts
│   │   │   │   ├── candidates/
│   │   │   │   ├── analytics/
│   │   │   │   ├── proctoring/
│   │   │   │   ├── leaderboard/
│   │   │   │   └── webhooks/
│   │   │   └── health/route.ts
│   │   ├── layout.tsx
│   │   └── page.tsx
│   │
│   ├── actions/                          # Server Actions
│   │   ├── auth/
│   │   │   ├── login.action.ts
│   │   │   ├── register.action.ts
│   │   │   ├── logout.action.ts
│   │   │   └── refresh.action.ts
│   │   ├── assessments/
│   │   │   ├── create.action.ts
│   │   │   ├── update.action.ts
│   │   │   ├── delete.action.ts
│   │   │   └── publish.action.ts
│   │   ├── submissions/
│   │   │   ├── submit.action.ts
│   │   │   └── execute.action.ts
│   │   ├── candidates/
│   │   │   ├── update-profile.action.ts
│   │   │   └── upload-resume.action.ts
│   │   └── proctoring/
│   │       ├── log-violation.action.ts
│   │       └── update-integrity.action.ts
│   │
│   ├── services/                         # Business Logic Layer
│   │   ├── auth/
│   │   │   ├── auth.service.ts
│   │   │   ├── session.service.ts
│   │   │   └── permission.service.ts
│   │   ├── assessments/
│   │   │   ├── assessment.service.ts
│   │   │   ├── question.service.ts
│   │   │   └── test-case.service.ts
│   │   ├── submissions/
│   │   │   ├── submission.service.ts
│   │   │   └── evaluation.service.ts
│   │   ├── execution/
│   │   │   ├── executor.service.ts
│   │   │   ├── sandbox.service.ts
│   │   │   └── compiler.service.ts
│   │   ├── proctoring/
│   │   │   ├── proctoring.service.ts
│   │   │   ├── violation.service.ts
│   │   │   └── integrity.service.ts
│   │   ├── analytics/
│   │   │   ├── analytics.service.ts
│   │   │   ├── leaderboard.service.ts
│   │   │   └── performance.service.ts
│   │   ├── notifications/
│   │   │   ├── notification.service.ts
│   │   │   └── email.service.ts
│   │   └── storage/
│   │       └── storage.service.ts
│   │
│   ├── repositories/                     # Data Access Layer
│   │   ├── base.repository.ts
│   │   ├── user.repository.ts
│   │   ├── assessment.repository.ts
│   │   ├── question.repository.ts
│   │   ├── submission.repository.ts
│   │   ├── execution.repository.ts
│   │   ├── violation.repository.ts
│   │   ├── session.repository.ts
│   │   ├── analytics.repository.ts
│   │   └── leaderboard.repository.ts
│   │
│   ├── lib/                              # Shared Utilities
│   │   ├── prisma/
│   │   │   ├── client.ts
│   │   │   └── seed.ts
│   │   ├── supabase/
│   │   │   ├── client.ts
│   │   │   ├── server.ts
│   │   │   └── middleware.ts
│   │   ├── redis/
│   │   │   ├── client.ts
│   │   │   └── cache.ts
│   │   ├── queue/
│   │   │   ├── client.ts
│   │   │   └── jobs.ts
│   │   ├── websocket/
│   │   │   ├── server.ts
│   │   │   └── events.ts
│   │   ├── logger/
│   │   │   ├── logger.ts
│   │   │   └── transports.ts
│   │   ├── errors/
│   │   │   ├── app-error.ts
│   │   │   ├── error-handler.ts
│   │   │   └── error-codes.ts
│   │   ├── utils/
│   │   │   ├── crypto.ts
│   │   │   ├── date.ts
│   │   │   ├── string.ts
│   │   │   └── response.ts
│   │   └── config/
│   │       ├── env.ts
│   │       └── constants.ts
│   │
│   ├── middleware/                       # Express-style Middleware
│   │   ├── auth.middleware.ts
│   │   ├── rbac.middleware.ts
│   │   ├── rate-limit.middleware.ts
│   │   ├── validation.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── logging.middleware.ts
│   │   └── cors.middleware.ts
│   │
│   ├── validators/                       # Zod Schemas
│   │   ├── auth.validator.ts
│   │   ├── assessment.validator.ts
│   │   ├── submission.validator.ts
│   │   ├── user.validator.ts
│   │   ├── question.validator.ts
│   │   └── common.validator.ts
│   │
│   ├── workers/                          # Background Workers
│   │   ├── execution/
│   │   │   ├── execution.worker.ts
│   │   │   └── sandbox.worker.ts
│   │   ├── analytics/
│   │   │   ├── analytics.worker.ts
│   │   │   └── leaderboard.worker.ts
│   │   ├── notifications/
│   │   │   └── notification.worker.ts
│   │   └── cleanup/
│   │       └── cleanup.worker.ts
│   │
│   ├── queues/                           # Queue Definitions
│   │   ├── execution.queue.ts
│   │   ├── analytics.queue.ts
│   │   ├── notification.queue.ts
│   │   └── cleanup.queue.ts
│   │
│   ├── types/                            # TypeScript Types
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   ├── assessment.types.ts
│   │   ├── submission.types.ts
│   │   ├── execution.types.ts
│   │   ├── proctoring.types.ts
│   │   ├── analytics.types.ts
│   │   └── index.ts
│   │
│   ├── hooks/                            # React Hooks
│   │   ├── use-auth.ts
│   │   ├── use-assessments.ts
│   │   ├── use-submissions.ts
│   │   ├── use-proctoring.ts
│   │   ├── use-analytics.ts
│   │   └── use-websocket.ts
│   │
│   ├── stores/                           # Zustand Stores
│   │   ├── auth-store.ts
│   │   ├── ui-store.ts
│   │   ├── exam-store.ts
│   │   └── proctoring-store.ts
│   │
│   ├── constants/                        # Constants
│   │   ├── roles.ts
│   │   ├── permissions.ts
│   │   ├── languages.ts
│   │   ├── error-codes.ts
│   │   └── events.ts
│   │
│   └── features/                         # Feature Modules (Optional)
│       ├── assessments/
│       ├── submissions/
│       ├── proctoring/
│       └── analytics/
│
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
│
├── workers/                              # Standalone Workers
│   ├── execution-worker/
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   └── src/
│   │       ├── index.ts
│   │       ├── sandbox.ts
│   │       └── executor.ts
│   └── analytics-worker/
│       ├── Dockerfile
│       ├── package.json
│       └── src/
│
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── e2e/
│   └── fixtures/
│
├── scripts/
│   ├── setup-db.sh
│   ├── seed-data.ts
│   └── migrate.sh
│
├── docker/
│   ├── docker-compose.yml
│   ├── Dockerfile.worker
│   └── Dockerfile.sandbox
│
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
│
├── docs/
│   ├── api/
│   ├── architecture/
│   └── deployment/
│
├── .env.example
├── .env.local
├── next.config.ts
├── tsconfig.json
├── package.json
└── README.md
```

---

## Database Schema

### Prisma Schema


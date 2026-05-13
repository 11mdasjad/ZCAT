# ZCAT Backend Architecture - Complete Guide

## 📚 Documentation Index

1. **[BACKEND_ARCHITECTURE.md](./BACKEND_ARCHITECTURE.md)** - High-level architecture overview
2. **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Step-by-step implementation
3. **[prisma/schema.prisma](./prisma/schema.prisma)** - Complete database schema
4. **This file** - Quick start and reference guide

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm/pnpm
- PostgreSQL 15+ (via Supabase)
- Redis (via Upstash)
- Docker (for code execution)

### Installation

```bash
# Clone and install
git clone <repo-url>
cd zcat
npm install

# Set up environment
cp .env.example .env.local
# Edit .env.local with your credentials

# Set up database
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# Start development
npm run dev              # Next.js app (port 3000)
npm run worker:execution # Execution worker
npm run websocket        # WebSocket server (port 3001)
```

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── api/v1/            # REST API endpoints
│   ├── (auth)/            # Auth pages
│   └── (dashboard)/       # Dashboard pages
│
├── actions/               # Server Actions
│   ├── auth/
│   ├── assessments/
│   └── submissions/
│
├── services/              # Business Logic
│   ├── auth/
│   ├── assessments/
│   ├── submissions/
│   ├── execution/
│   └── proctoring/
│
├── repositories/          # Data Access Layer
│   ├── base.repository.ts
│   ├── assessment.repository.ts
│   └── submission.repository.ts
│
├── middleware/            # Request Middleware
│   ├── auth.middleware.ts
│   ├── rbac.middleware.ts
│   └── rate-limit.middleware.ts
│
├── validators/            # Zod Schemas
│   ├── common.validator.ts
│   ├── assessment.validator.ts
│   └── submission.validator.ts
│
├── lib/                   # Shared Utilities
│   ├── prisma/
│   ├── redis/
│   ├── queue/
│   ├── websocket/
│   ├── logger/
│   └── errors/
│
└── workers/               # Background Workers
    └── execution/
```

---

## 🏛️ Architecture Layers

### 1. API Layer (Routes & Actions)

**Route Handlers** (`app/api/v1/`)
- RESTful API endpoints
- Used for: CRUD operations, complex queries, external integrations
- Example: `GET /api/v1/assessments`, `POST /api/v1/submissions`

**Server Actions** (`actions/`)
- Direct server-side functions
- Used for: Form submissions, mutations, simple operations
- Example: `submitCodeAction()`, `updateProfileAction()`

### 2. Service Layer

Business logic and use cases. Services orchestrate repositories and external services.

```typescript
// Example: Assessment Service
class AssessmentService {
  async create(input, userId) {
    // Validate business rules
    // Call repository
    // Invalidate cache
    // Return result
  }
}
```

### 3. Repository Layer

Data access abstraction. All database operations go through repositories.

```typescript
// Example: Base Repository
class BaseRepository<T> {
  async findById(id: string): Promise<T | null>
  async findAll(filters): Promise<T[]>
  async create(data): Promise<T>
  async update(id, data): Promise<T>
  async delete(id): Promise<void>
}
```

### 4. Middleware Layer

Request processing pipeline:
1. **Authentication** - Verify JWT token
2. **Authorization** - Check RBAC permissions
3. **Rate Limiting** - Prevent abuse
4. **Validation** - Validate request data
5. **Logging** - Log requests and errors

---

## 🔐 Authentication & Authorization

### Authentication Flow

```
1. User submits credentials
2. Supabase Auth validates
3. JWT token issued
4. Token stored in httpOnly cookie
5. Subsequent requests include token
6. Middleware validates token
7. User object attached to request
```

### RBAC System

**Roles:**
- `SUPER_ADMIN` - Full system access
- `ADMIN` - Platform management
- `RECRUITER` - Assessment creation and monitoring
- `CANDIDATE` - Take assessments

**Permissions:**
```typescript
enum Permission {
  ASSESSMENT_CREATE = 'assessment:create',
  ASSESSMENT_READ = 'assessment:read',
  ASSESSMENT_UPDATE = 'assessment:update',
  ASSESSMENT_DELETE = 'assessment:delete',
  // ... more permissions
}
```

**Usage:**
```typescript
// In route handler
const authError = requireRecruiterOrAdmin(user);
if (authError) return authError;

// In service
if (!hasPermission(user.role, Permission.ASSESSMENT_CREATE)) {
  throw new ForbiddenError();
}
```

---

## 💾 Database Design

### Key Tables

**Users & Profiles**
- `users` - Core user data
- `profiles` - Extended profile info
- `candidate_profiles` - Candidate-specific data
- `recruiter_profiles` - Recruiter-specific data

**Assessments**
- `assessments` - Assessment metadata
- `questions` - Question bank
- `test_cases` - Test cases for coding questions
- `assessment_questions` - Many-to-many relationship

**Submissions & Execution**
- `submissions` - Code submissions
- `code_executions` - Execution records
- `test_case_results` - Individual test results

**Sessions & Proctoring**
- `exam_sessions` - Active exam sessions
- `violations` - Proctoring violations
- `proctoring_snapshots` - Webcam snapshots

**Analytics**
- `assessment_analytics` - Aggregated stats
- `leaderboards` - Ranking data
- `performance_snapshots` - Historical performance

### Indexing Strategy

```sql
-- Frequently queried fields
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Composite indexes for common queries
CREATE INDEX idx_submissions_user_assessment 
  ON submissions(user_id, assessment_id);

-- Partial indexes for active records
CREATE INDEX idx_active_sessions 
  ON exam_sessions(status) 
  WHERE status = 'ACTIVE';
```

---

## 🚀 Code Execution Engine

### Architecture

```
Client → API → Queue → Worker → Docker Sandbox → Results
```

### Flow

1. **Submission**: User submits code via API/Action
2. **Validation**: Code and metadata validated
3. **Queue**: Job added to BullMQ queue
4. **Worker**: Worker picks up job
5. **Sandbox**: Code executed in isolated Docker container
6. **Evaluation**: Results compared with test cases
7. **Storage**: Results saved to database
8. **Notification**: Real-time update sent via WebSocket

### Docker Sandbox

```typescript
// Sandbox configuration
{
  image: 'python:3.11-alpine',
  memory: 512 * 1024 * 1024, // 512 MB
  cpuQuota: 10 * 100000,     // 10 seconds
  networkMode: 'none',        // No network
  readonlyRootfs: true,       // Read-only filesystem
  pidsLimit: 50               // Max 50 processes
}
```

### Supported Languages

- Python 3.11
- JavaScript (Node 20)
- Java 17
- C++ (GCC)
- C (GCC)

---

## 🔄 Real-time Features

### WebSocket Events

**Client → Server:**
- `join_session` - Join exam session
- `leave_session` - Leave session
- `ping` - Keep-alive

**Server → Client:**
- `connected` - Connection established
- `submission_update` - Submission status changed
- `violation_alert` - Proctoring violation detected
- `timer_sync` - Timer synchronization
- `leaderboard_update` - Leaderboard changed

### Supabase Realtime (Alternative)

```typescript
// Subscribe to submission updates
const channel = supabase
  .channel('submissions')
  .on(
    'postgres_changes',
    {
      event: 'UPDATE',
      schema: 'public',
      table: 'submissions',
      filter: `user_id=eq.${userId}`,
    },
    (payload) => {
      console.log('Submission updated:', payload);
    }
  )
  .subscribe();
```

---

## 📊 Caching Strategy

### Cache Layers

1. **Redis Cache** - Application-level caching
2. **Next.js Cache** - Page and data caching
3. **Prisma Cache** - Query result caching

### Cache Keys

```typescript
const CacheKeys = {
  user: (id) => `user:${id}`,
  assessment: (id) => `assessment:${id}`,
  leaderboard: (id) => `leaderboard:${id}`,
  analytics: (id) => `analytics:${id}`,
};
```

### TTL Strategy

```typescript
const CacheTTL = {
  SHORT: 60,        // 1 minute - frequently changing data
  MEDIUM: 300,      // 5 minutes - semi-static data
  LONG: 3600,       // 1 hour - static data
  DAY: 86400,       // 24 hours - rarely changing data
};
```

### Cache Invalidation

```typescript
// Invalidate on update
await assessmentService.update(id, data);
await CacheService.del(CacheKeys.assessment(id));
await CacheService.delPattern('assessments:*');
```

---

## 🛡️ Security Best Practices

### Input Validation

```typescript
// Always validate with Zod
const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const validated = await schema.parseAsync(input);
```

### SQL Injection Prevention

```typescript
// ✅ Good - Parameterized queries (Prisma)
await prisma.user.findMany({
  where: { email: userInput },
});

// ❌ Bad - Raw SQL with interpolation
await prisma.$queryRaw`SELECT * FROM users WHERE email = ${userInput}`;
```

### XSS Prevention

```typescript
// Sanitize user input
import DOMPurify from 'isomorphic-dompurify';

const clean = DOMPurify.sanitize(userInput);
```

### Rate Limiting

```typescript
// Apply rate limiting to sensitive endpoints
await rateLimiters.auth(req, user?.id);
```

### CORS Configuration

```typescript
// next.config.ts
const config = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: process.env.NEXT_PUBLIC_APP_URL },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE,OPTIONS' },
        ],
      },
    ];
  },
};
```

---

## 📈 Performance Optimization

### Database Optimization

1. **Indexing**: Add indexes on frequently queried columns
2. **Query Optimization**: Use `select` to fetch only needed fields
3. **Pagination**: Always paginate large result sets
4. **Connection Pooling**: Configure Prisma connection pool

```typescript
// Optimize queries
const users = await prisma.user.findMany({
  select: {
    id: true,
    name: true,
    email: true,
    // Don't fetch unnecessary fields
  },
  take: 10,
  skip: (page - 1) * 10,
});
```

### API Optimization

1. **Response Compression**: Enable gzip compression
2. **Caching**: Cache frequently accessed data
3. **Lazy Loading**: Load data on demand
4. **Batch Requests**: Combine multiple requests

### Next.js Optimization

1. **Server Components**: Use by default
2. **Streaming**: Stream large responses
3. **Partial Prerendering**: Enable PPR
4. **Image Optimization**: Use Next.js Image component

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// services/assessment.service.test.ts
describe('AssessmentService', () => {
  it('should create assessment', async () => {
    const input = { title: 'Test', ... };
    const result = await assessmentService.create(input, userId);
    expect(result).toBeDefined();
    expect(result.title).toBe('Test');
  });
});
```

### Integration Tests

```typescript
// api/assessments.test.ts
describe('POST /api/v1/assessments', () => {
  it('should create assessment with valid data', async () => {
    const response = await fetch('/api/v1/assessments', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    expect(response.status).toBe(201);
  });
});
```

### E2E Tests

```typescript
// e2e/submission-flow.spec.ts
test('complete submission flow', async ({ page }) => {
  await page.goto('/code/question-1');
  await page.fill('[data-testid="code-editor"]', code);
  await page.click('[data-testid="submit-button"]');
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

---

## 📊 Monitoring & Logging

### Structured Logging

```typescript
logger.info('User logged in', {
  userId: user.id,
  email: user.email,
  timestamp: new Date().toISOString(),
});

logger.error('Database error', {
  error: error.message,
  stack: error.stack,
  query: 'SELECT ...',
});
```

### Error Tracking (Sentry)

```typescript
import * as Sentry from '@sentry/nextjs';

Sentry.captureException(error, {
  tags: {
    component: 'AssessmentService',
    action: 'create',
  },
  extra: {
    userId,
    input,
  },
});
```

### Performance Monitoring

```typescript
// Track slow queries
const start = Date.now();
const result = await prisma.user.findMany();
const duration = Date.now() - start;

if (duration > 1000) {
  logger.warn('Slow query detected', { duration, query: 'findMany users' });
}
```

---

## 🚢 Deployment

### Environment Setup

1. **Development**: Local with Docker Compose
2. **Staging**: Vercel + Railway workers
3. **Production**: Vercel + Fly.io workers

### CI/CD Pipeline

```yaml
# .github/workflows/deploy.yml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Install dependencies
        run: npm ci
      - name: Run tests
        run: npm test
      - name: Build
        run: npm run build
      - name: Deploy to Vercel
        run: vercel --prod
```

### Health Checks

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = {
    database: await checkDatabase(),
    redis: await checkRedis(),
    queue: await checkQueue(),
  };

  const healthy = Object.values(checks).every(c => c.status === 'ok');

  return Response.json(
    { status: healthy ? 'healthy' : 'unhealthy', checks },
    { status: healthy ? 200 : 503 }
  );
}
```

---

## 📚 Additional Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [BullMQ Documentation](https://docs.bullmq.io)
- [Upstash Redis](https://docs.upstash.com/redis)

---

## 🤝 Contributing

1. Follow the established architecture patterns
2. Write tests for new features
3. Update documentation
4. Follow TypeScript strict mode
5. Use conventional commits

---

## 📝 License

MIT License - see LICENSE file for details

---

**Built with ❤️ for enterprise-grade assessment platform**

# ZCAT Backend Implementation Guide

## 🚀 Step-by-Step Implementation Order

### Phase 1: Foundation Setup (Week 1)

#### 1.1 Environment & Dependencies

```bash
# Install core dependencies
npm install @prisma/client prisma
npm install @upstash/redis
npm install bullmq ioredis
npm install zod
npm install winston
npm install @tanstack/react-query
npm install ws

# Install dev dependencies
npm install -D @types/node
npm install -D @types/ws
npm install -D vitest
npm install -D playwright
```

#### 1.2 Environment Variables

Create `.env.local`:

```env
# Database
DATABASE_URL="postgresql://user:password@host:5432/zcat?schema=public"
DIRECT_URL="postgresql://user:password@host:5432/zcat?schema=public"

# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_JWT_SECRET="your-jwt-secret"

# Redis (Upstash)
UPSTASH_REDIS_REST_URL="https://your-redis.upstash.io"
UPSTASH_REDIS_REST_TOKEN="your-token"
REDIS_URL="redis://default:password@host:6379"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"
NODE_ENV="development"

# Security
JWT_SECRET="your-32-char-secret-key-here"
ENCRYPTION_KEY="your-32-char-encryption-key"

# Code Execution
EXECUTION_WORKER_URL="http://localhost:3002"
EXECUTION_TIMEOUT="30000"
MAX_MEMORY_MB="512"
MAX_CPU_TIME="10"

# Monitoring
LOG_LEVEL="debug"
SENTRY_DSN=""

# WebSocket
WEBSOCKET_PORT="3001"
```

#### 1.3 Database Setup

```bash
# Initialize Prisma
npx prisma init

# Generate Prisma Client
npx prisma generate

# Create migration
npx prisma migrate dev --name init

# Seed database
npx prisma db seed
```

#### 1.4 Supabase Setup

Create RLS policies in Supabase SQL Editor:

```sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
-- ... repeat for all tables

-- Users can read their own data
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

-- Admins can view all assessments
CREATE POLICY "Admins can view all assessments"
  ON assessments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role IN ('ADMIN', 'SUPER_ADMIN')
    )
  );

-- Candidates can view public assessments
CREATE POLICY "Candidates can view public assessments"
  ON assessments FOR SELECT
  USING (is_public = true OR created_by_id = auth.uid());

-- More policies...
```

---

### Phase 2: Core Services (Week 2)

#### 2.1 Authentication Service

Create `src/services/auth/auth.service.ts`:

```typescript
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma/client';
import { UnauthorizedError } from '@/lib/errors/app-error';
import { CacheService, CacheKeys, CacheTTL } from '@/lib/redis/client';

export class AuthService {
  async login(email: string, password: string) {
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new UnauthorizedError('Invalid credentials');
    }

    // Get user profile
    const profile = await prisma.user.findUnique({
      where: { id: data.user.id },
      include: {
        profile: true,
        candidateProfile: true,
        recruiterProfile: true,
      },
    });

    // Cache user data
    await CacheService.set(
      CacheKeys.user(data.user.id),
      profile,
      CacheTTL.MEDIUM
    );

    return {
      user: profile,
      session: data.session,
    };
  }

  async register(input: RegisterInput) {
    const supabase = createClient();
    
    // Create auth user
    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          name: input.name,
          role: input.role,
        },
      },
    });

    if (error) {
      throw new Error(error.message);
    }

    // Create user profile in database
    const user = await prisma.user.create({
      data: {
        id: data.user!.id,
        email: input.email,
        name: input.name,
        role: input.role,
        profile: {
          create: {},
        },
        ...(input.role === 'CANDIDATE' && {
          candidateProfile: {
            create: {
              university: input.university,
              graduationYear: input.graduationYear,
              skills: input.skills,
            },
          },
        }),
        ...(input.role === 'RECRUITER' && {
          recruiterProfile: {
            create: {
              companyName: input.companyName,
              jobTitle: input.jobTitle,
            },
          },
        }),
      },
    });

    return { user, session: data.session };
  }

  async logout(userId: string) {
    const supabase = createClient();
    
    await supabase.auth.signOut();
    
    // Clear cache
    await CacheService.del(CacheKeys.user(userId));
  }

  async refreshSession(refreshToken: string) {
    const supabase = createClient();
    
    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new UnauthorizedError('Invalid refresh token');
    }

    return data.session;
  }

  async getCurrentUser(userId: string) {
    // Try cache first
    const cached = await CacheService.get(CacheKeys.user(userId));
    if (cached) return cached;

    // Fetch from database
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        candidateProfile: true,
        recruiterProfile: true,
      },
    });

    if (user) {
      await CacheService.set(
        CacheKeys.user(userId),
        user,
        CacheTTL.MEDIUM
      );
    }

    return user;
  }
}

export const authService = new AuthService();
```

#### 2.2 Assessment Service

Create `src/services/assessments/assessment.service.ts`:

```typescript
import { assessmentRepository } from '@/repositories/assessment.repository';
import { CreateAssessmentInput, UpdateAssessmentInput } from '@/validators/assessment.validator';
import { CacheService, CacheKeys, CacheTTL } from '@/lib/redis/client';
import { ForbiddenError, NotFoundError } from '@/lib/errors/app-error';

export class AssessmentService {
  async create(input: CreateAssessmentInput, createdById: string) {
    const assessment = await assessmentRepository.create({
      ...input,
      createdBy: {
        connect: { id: createdById },
      },
    });

    // Add questions if provided
    if (input.questions && input.questions.length > 0) {
      await assessmentRepository.addQuestions(
        assessment.id,
        input.questions
      );
    }

    // Invalidate cache
    await CacheService.delPattern('assessments:*');

    return assessment;
  }

  async findById(id: string, userId?: string) {
    // Try cache first
    const cached = await CacheService.get(CacheKeys.assessment(id));
    if (cached) return cached;

    const assessment = await assessmentRepository.findByIdWithDetails(id);
    
    if (!assessment) {
      throw new NotFoundError('Assessment');
    }

    // Check access
    if (userId) {
      const hasAccess = await assessmentRepository.hasAccess(id, userId);
      if (!hasAccess) {
        throw new ForbiddenError('You do not have access to this assessment');
      }
    }

    // Cache result
    await CacheService.set(
      CacheKeys.assessment(id),
      assessment,
      CacheTTL.MEDIUM
    );

    return assessment;
  }

  async findAll(filters: any, page: number, limit: number) {
    const cacheKey = CacheKeys.assessmentList(page, limit);
    
    // Try cache
    const cached = await CacheService.get(cacheKey);
    if (cached) return cached;

    const result = await assessmentRepository.findWithFilters(
      filters,
      page,
      limit
    );

    // Cache result
    await CacheService.set(cacheKey, result, CacheTTL.SHORT);

    return result;
  }

  async update(id: string, input: UpdateAssessmentInput, userId: string) {
    const assessment = await assessmentRepository.findById(id);
    
    if (!assessment) {
      throw new NotFoundError('Assessment');
    }

    // Check ownership
    if (assessment.createdById !== userId) {
      throw new ForbiddenError('You can only update your own assessments');
    }

    const updated = await assessmentRepository.update(id, input);

    // Invalidate cache
    await CacheService.del(CacheKeys.assessment(id));
    await CacheService.delPattern('assessments:*');

    return updated;
  }

  async delete(id: string, userId: string) {
    const assessment = await assessmentRepository.findById(id);
    
    if (!assessment) {
      throw new NotFoundError('Assessment');
    }

    if (assessment.createdById !== userId) {
      throw new ForbiddenError('You can only delete your own assessments');
    }

    await assessmentRepository.softDelete(id);

    // Invalidate cache
    await CacheService.del(CacheKeys.assessment(id));
    await CacheService.delPattern('assessments:*');
  }

  async publish(id: string, startTime: Date, endTime: Date, userId: string) {
    const assessment = await assessmentRepository.findById(id);
    
    if (!assessment) {
      throw new NotFoundError('Assessment');
    }

    if (assessment.createdById !== userId) {
      throw new ForbiddenError('You can only publish your own assessments');
    }

    const published = await assessmentRepository.publish(id, startTime, endTime);

    // Invalidate cache
    await CacheService.del(CacheKeys.assessment(id));

    return published;
  }

  async getStatistics(id: string) {
    const cacheKey = CacheKeys.analytics(id);
    
    // Try cache
    const cached = await CacheService.get(cacheKey);
    if (cached) return cached;

    const stats = await assessmentRepository.getStatistics(id);

    // Cache for longer
    await CacheService.set(cacheKey, stats, CacheTTL.LONG);

    return stats;
  }
}

export const assessmentService = new AssessmentService();
```

---

### Phase 3: Code Execution Engine (Week 3)

#### 3.1 Queue Setup

Create `src/lib/queue/client.ts`:

```typescript
import { Queue, Worker, Job } from 'bullmq';
import { env } from '../config/env';
import { logger } from '../logger/logger';

const connection = {
  host: env.REDIS_URL.split(':')[1].replace('//', ''),
  port: parseInt(env.REDIS_URL.split(':')[2]),
};

export const executionQueue = new Queue('code-execution', {
  connection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: {
      age: 3600, // Keep for 1 hour
      count: 1000,
    },
    removeOnFail: {
      age: 86400, // Keep for 24 hours
    },
  },
});

export interface ExecutionJob {
  submissionId: string;
  code: string;
  language: string;
  testCases: Array<{
    id: string;
    input: string;
    expectedOutput: string;
  }>;
  timeLimit: number;
  memoryLimit: number;
}

export async function addExecutionJob(data: ExecutionJob) {
  const job = await executionQueue.add('execute', data, {
    priority: 1,
  });
  
  logger.info(`Added execution job: ${job.id}`);
  
  return job;
}

export async function getJobStatus(jobId: string) {
  const job = await executionQueue.getJob(jobId);
  
  if (!job) {
    return null;
  }

  const state = await job.getState();
  const progress = job.progress;

  return {
    id: job.id,
    state,
    progress,
    data: job.data,
    returnvalue: job.returnvalue,
    failedReason: job.failedReason,
  };
}
```

#### 3.2 Execution Worker

Create `workers/execution-worker/src/index.ts`:

```typescript
import { Worker, Job } from 'bullmq';
import { ExecutionJob } from './types';
import { DockerSandbox } from './sandbox';
import { logger } from './logger';

const worker = new Worker<ExecutionJob>(
  'code-execution',
  async (job: Job<ExecutionJob>) => {
    logger.info(`Processing job ${job.id}`);
    
    const { code, language, testCases, timeLimit, memoryLimit } = job.data;
    
    const sandbox = new DockerSandbox({
      language,
      timeLimit,
      memoryLimit,
    });

    try {
      const results = [];
      
      for (let i = 0; i < testCases.length; i++) {
        const testCase = testCases[i];
        
        // Update progress
        await job.updateProgress((i / testCases.length) * 100);
        
        // Execute code
        const result = await sandbox.execute(code, testCase.input);
        
        results.push({
          testCaseId: testCase.id,
          passed: result.output.trim() === testCase.expectedOutput.trim(),
          output: result.output,
          executionTime: result.executionTime,
          memoryUsed: result.memoryUsed,
          error: result.error,
        });
      }
      
      return {
        submissionId: job.data.submissionId,
        results,
        totalTests: testCases.length,
        passedTests: results.filter(r => r.passed).length,
      };
    } catch (error) {
      logger.error(`Execution error:`, error);
      throw error;
    } finally {
      await sandbox.cleanup();
    }
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379'),
    },
    concurrency: 5, // Process 5 jobs concurrently
  }
);

worker.on('completed', (job) => {
  logger.info(`Job ${job.id} completed`);
});

worker.on('failed', (job, err) => {
  logger.error(`Job ${job?.id} failed:`, err);
});

logger.info('Execution worker started');
```

#### 3.3 Docker Sandbox

Create `workers/execution-worker/src/sandbox.ts`:

```typescript
import Docker from 'dockerode';
import { logger } from './logger';

const docker = new Docker();

export interface SandboxConfig {
  language: string;
  timeLimit: number; // seconds
  memoryLimit: number; // MB
}

export interface ExecutionResult {
  output: string;
  error?: string;
  executionTime: number;
  memoryUsed: number;
  exitCode: number;
}

const LANGUAGE_IMAGES = {
  PYTHON: 'python:3.11-alpine',
  JAVASCRIPT: 'node:20-alpine',
  JAVA: 'openjdk:17-alpine',
  CPP: 'gcc:latest',
  C: 'gcc:latest',
};

const LANGUAGE_COMMANDS = {
  PYTHON: (file: string) => ['python', file],
  JAVASCRIPT: (file: string) => ['node', file],
  JAVA: (file: string) => ['java', file],
  CPP: (file: string) => ['./a.out'],
  C: (file: string) => ['./a.out'],
};

export class DockerSandbox {
  private config: SandboxConfig;
  private container?: Docker.Container;

  constructor(config: SandboxConfig) {
    this.config = config;
  }

  async execute(code: string, input: string): Promise<ExecutionResult> {
    const startTime = Date.now();
    
    try {
      // Create container
      this.container = await docker.createContainer({
        Image: LANGUAGE_IMAGES[this.config.language as keyof typeof LANGUAGE_IMAGES],
        Cmd: this.getCommand(),
        HostConfig: {
          Memory: this.config.memoryLimit * 1024 * 1024, // Convert to bytes
          MemorySwap: this.config.memoryLimit * 1024 * 1024,
          CpuPeriod: 100000,
          CpuQuota: this.config.timeLimit * 100000,
          NetworkMode: 'none', // No network access
          ReadonlyRootfs: true,
          PidsLimit: 50,
        },
        AttachStdin: true,
        AttachStdout: true,
        AttachStderr: true,
        OpenStdin: true,
        StdinOnce: true,
      });

      // Start container
      await this.container.start();

      // Write code to container
      await this.writeCode(code);

      // Execute with input
      const result = await this.runWithInput(input);

      const executionTime = Date.now() - startTime;

      // Get stats
      const stats = await this.container.stats({ stream: false });
      const memoryUsed = stats.memory_stats.usage / (1024 * 1024); // Convert to MB

      return {
        output: result.output,
        error: result.error,
        executionTime,
        memoryUsed,
        exitCode: result.exitCode,
      };
    } catch (error) {
      logger.error('Sandbox execution error:', error);
      throw error;
    }
  }

  private async writeCode(code: string) {
    // Implementation depends on language
    // Write code to container filesystem
  }

  private async runWithInput(input: string) {
    // Execute code with input
    // Return output, error, and exit code
  }

  private getCommand() {
    return LANGUAGE_COMMANDS[this.config.language as keyof typeof LANGUAGE_COMMANDS]('main');
  }

  async cleanup() {
    if (this.container) {
      try {
        await this.container.stop();
        await this.container.remove();
      } catch (error) {
        logger.error('Cleanup error:', error);
      }
    }
  }
}
```

---

### Phase 4: Real-time Features (Week 4)

#### 4.1 WebSocket Server

Create `src/lib/websocket/server.ts`:

```typescript
import { WebSocketServer, WebSocket } from 'ws';
import { createClient } from '@/lib/supabase/server';
import { logger } from '../logger/logger';

interface Client {
  ws: WebSocket;
  userId: string;
  sessionId?: string;
}

export class RealtimeServer {
  private wss: WebSocketServer;
  private clients: Map<string, Client> = new Map();

  constructor(port: number) {
    this.wss = new WebSocketServer({ port });
    this.setupHandlers();
    logger.info(`WebSocket server started on port ${port}`);
  }

  private setupHandlers() {
    this.wss.on('connection', async (ws, req) => {
      try {
        // Authenticate
        const token = this.extractToken(req.url);
        const user = await this.authenticateToken(token);

        if (!user) {
          ws.close(1008, 'Unauthorized');
          return;
        }

        const clientId = this.generateClientId();
        this.clients.set(clientId, { ws, userId: user.id });

        logger.info(`Client connected: ${clientId}`);

        ws.on('message', (data) => {
          this.handleMessage(clientId, data.toString());
        });

        ws.on('close', () => {
          this.clients.delete(clientId);
          logger.info(`Client disconnected: ${clientId}`);
        });

        ws.on('error', (error) => {
          logger.error(`WebSocket error for ${clientId}:`, error);
        });

        // Send welcome message
        this.send(clientId, {
          type: 'connected',
          clientId,
        });
      } catch (error) {
        logger.error('Connection error:', error);
        ws.close(1011, 'Internal error');
      }
    });
  }

  private handleMessage(clientId: string, message: string) {
    try {
      const data = JSON.parse(message);
      
      switch (data.type) {
        case 'join_session':
          this.handleJoinSession(clientId, data.sessionId);
          break;
        case 'leave_session':
          this.handleLeaveSession(clientId);
          break;
        case 'ping':
          this.send(clientId, { type: 'pong' });
          break;
        default:
          logger.warn(`Unknown message type: ${data.type}`);
      }
    } catch (error) {
      logger.error('Message handling error:', error);
    }
  }

  private handleJoinSession(clientId: string, sessionId: string) {
    const client = this.clients.get(clientId);
    if (client) {
      client.sessionId = sessionId;
      logger.info(`Client ${clientId} joined session ${sessionId}`);
    }
  }

  private handleLeaveSession(clientId: string) {
    const client = this.clients.get(clientId);
    if (client) {
      client.sessionId = undefined;
      logger.info(`Client ${clientId} left session`);
    }
  }

  // Broadcast to all clients in a session
  broadcastToSession(sessionId: string, message: any) {
    this.clients.forEach((client) => {
      if (client.sessionId === sessionId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  // Send to specific client
  send(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  // Send to specific user
  sendToUser(userId: string, message: any) {
    this.clients.forEach((client) => {
      if (client.userId === userId && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  private extractToken(url?: string): string | null {
    if (!url) return null;
    const match = url.match(/token=([^&]+)/);
    return match ? match[1] : null;
  }

  private async authenticateToken(token: string | null) {
    if (!token) return null;
    
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser(token);
    
    return user;
  }

  private generateClientId(): string {
    return `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Start server
const port = parseInt(process.env.WEBSOCKET_PORT || '3001');
export const realtimeServer = new RealtimeServer(port);
```

---

## 📦 Package.json Scripts

Add to `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "prisma generate && next build",
    "start": "next start",
    "lint": "eslint",
    "prisma:generate": "prisma generate",
    "prisma:migrate": "prisma migrate dev",
    "prisma:studio": "prisma studio",
    "prisma:seed": "tsx prisma/seed.ts",
    "worker:execution": "tsx workers/execution-worker/src/index.ts",
    "websocket": "tsx src/lib/websocket/server.ts",
    "test": "vitest",
    "test:e2e": "playwright test"
  }
}
```

---

## 🐳 Docker Setup

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: zcat
      POSTGRES_PASSWORD: password
      POSTGRES_DB: zcat
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

  execution-worker:
    build:
      context: ./workers/execution-worker
      dockerfile: Dockerfile
    environment:
      REDIS_HOST: redis
      REDIS_PORT: 6379
    depends_on:
      - redis
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock

volumes:
  postgres_data:
  redis_data:
```

---

## 🔄 Complete Implementation Checklist

### Week 1: Foundation
- [ ] Set up project structure
- [ ] Configure environment variables
- [ ] Set up Prisma with PostgreSQL
- [ ] Configure Supabase Auth
- [ ] Set up Redis (Upstash)
- [ ] Implement logging system
- [ ] Create error handling utilities
- [ ] Set up middleware (auth, RBAC, rate limiting)

### Week 2: Core Services
- [ ] Implement authentication service
- [ ] Implement user management
- [ ] Implement assessment service
- [ ] Implement question service
- [ ] Create repositories
- [ ] Add validation schemas
- [ ] Implement caching layer

### Week 3: Code Execution
- [ ] Set up BullMQ queues
- [ ] Create execution worker
- [ ] Implement Docker sandbox
- [ ] Add language support (Python, JS, Java, C++, C)
- [ ] Implement test case evaluation
- [ ] Add execution monitoring

### Week 4: Real-time Features
- [ ] Set up WebSocket server
- [ ] Implement session management
- [ ] Add proctoring events
- [ ] Implement live monitoring
- [ ] Add real-time leaderboard
- [ ] Implement notifications

### Week 5: Analytics & Reporting
- [ ] Implement analytics service
- [ ] Create leaderboard system
- [ ] Add performance tracking
- [ ] Implement certificate generation
- [ ] Add export functionality

### Week 6: Testing & Optimization
- [ ] Write unit tests
- [ ] Write integration tests
- [ ] Add E2E tests
- [ ] Performance optimization
- [ ] Security audit
- [ ] Load testing

### Week 7: DevOps & Deployment
- [ ] Set up CI/CD pipeline
- [ ] Configure staging environment
- [ ] Set up monitoring (Sentry)
- [ ] Configure logging aggregation
- [ ] Deploy to production
- [ ] Set up backups

---

## 🎯 Next Steps

1. Start with Phase 1 (Foundation Setup)
2. Follow the implementation order strictly
3. Test each phase before moving to the next
4. Document any deviations or issues
5. Keep security and scalability in mind

This guide provides a solid foundation for building the ZCAT backend. Each phase builds upon the previous one, ensuring a stable and scalable architecture.

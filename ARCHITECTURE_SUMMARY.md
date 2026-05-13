# ZCAT Platform - Complete Architecture Summary

## 📋 Executive Summary

ZCAT is an enterprise-grade AI-powered assessment platform built with a modern, scalable, and maintainable architecture. The system is designed to handle 10,000+ concurrent users, real-time code execution, AI proctoring, and comprehensive analytics.

---

## 🏗️ Technology Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS 4
- **State Management**: Zustand + React Query
- **Animations**: Framer Motion
- **Code Editor**: Monaco Editor
- **Charts**: Recharts

### Backend
- **Runtime**: Node.js 20+
- **Database**: PostgreSQL 15 (Supabase)
- **ORM**: Prisma
- **Cache**: Redis (Upstash)
- **Queue**: BullMQ
- **Auth**: Supabase Auth + JWT
- **Validation**: Zod
- **Logging**: Winston

### Infrastructure
- **Hosting**: Vercel (Frontend + API)
- **Workers**: Railway / Fly.io
- **Storage**: Supabase Storage
- **CDN**: Vercel Edge Network
- **Monitoring**: Sentry
- **CI/CD**: GitHub Actions

---

## 🎯 Core Features

### 1. Assessment Management
- Create, update, delete assessments
- Multiple question types (coding, MCQ, descriptive)
- Question versioning
- Test case management
- Assessment scheduling
- Candidate invitations

### 2. Code Execution Engine
- Multi-language support (Python, JS, Java, C++, C)
- Docker-based sandboxing
- Resource limits (CPU, memory, time)
- Queue-based execution
- Real-time results
- Hidden test cases

### 3. AI Proctoring
- Face detection
- Tab switching detection
- Copy-paste monitoring
- Audio anomaly detection
- Integrity scoring
- Violation logging

### 4. Real-time Features
- Live exam monitoring
- WebSocket connections
- Timer synchronization
- Submission updates
- Leaderboard updates
- Notifications

### 5. Analytics & Reporting
- Assessment analytics
- Candidate performance
- Skill heatmaps
- Leaderboards
- Certificate generation
- Export functionality

---

## 📊 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                            │
│  Next.js 15 + React Query + Zustand + WebSockets           │
└────────────────────┬────────────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   EDGE MIDDLEWARE                            │
│  Rate Limiting → Auth → RBAC → Validation                   │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼────────┐ ┌▼──────────┐
│   Server     │ │   Route    │ │ WebSocket │
│   Actions    │ │  Handlers  │ │  Server   │
└───────┬──────┘ └──┬────────┘ └┬──────────┘
        │            │            │
        └────────────┼────────────┘
                     │
┌────────────────────▼────────────────────────────────────────┐
│                   SERVICE LAYER                              │
│  Auth • Assessments • Submissions • Execution • Analytics   │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
┌───────▼──────┐ ┌──▼────────┐ ┌▼──────────┐
│ Repository   │ │   Cache    │ │   Queue   │
│   Layer      │ │   Layer    │ │   Layer   │
└───────┬──────┘ └──┬────────┘ └┬──────────┘
        │            │            │
┌───────▼──────┐ ┌──▼────────┐ ┌▼──────────┐
│  PostgreSQL  │ │   Redis    │ │  BullMQ   │
│  (Supabase)  │ │ (Upstash)  │ │  Workers  │
└──────────────┘ └────────────┘ └┬──────────┘
                                  │
                          ┌───────▼──────┐
                          │    Docker    │
                          │   Sandbox    │
                          └──────────────┘
```

---

## 🔐 Security Architecture

### Authentication
- Supabase Auth (JWT-based)
- HTTP-only cookies
- Refresh token rotation
- Session management
- Device tracking

### Authorization (RBAC)
- Role-based access control
- Permission-based authorization
- Resource ownership checks
- Fine-grained permissions

### Data Security
- Input validation (Zod)
- SQL injection prevention (Prisma)
- XSS protection
- CSRF protection
- Rate limiting
- Encryption at rest

### Code Execution Security
- Docker isolation
- No network access
- Read-only filesystem
- Resource limits
- Process limits
- Timeout protection

---

## 💾 Database Schema

### Core Tables (30+ tables)

**User Management**
- users, profiles, candidate_profiles, recruiter_profiles
- refresh_tokens, device_sessions

**Assessments**
- assessments, questions, test_cases
- assessment_questions, question_versions

**Submissions**
- submissions, code_executions, test_case_results

**Sessions & Proctoring**
- exam_sessions, violations, proctoring_snapshots

**Analytics**
- assessment_analytics, leaderboards, leaderboard_entries
- performance_snapshots

**Certificates & Notifications**
- certificates, notifications, assessment_invitations

**AI Interview**
- interview_sessions, interview_questions, interview_responses

**Audit**
- audit_logs, system_config

### Indexing Strategy
- Primary keys (UUID)
- Foreign keys with indexes
- Composite indexes for common queries
- Partial indexes for active records
- Full-text search indexes

---

## 🚀 Performance Optimizations

### Database
- Connection pooling
- Query optimization
- Selective field fetching
- Pagination
- Batch operations

### Caching
- Redis for application cache
- Next.js cache for pages
- Query result caching
- CDN caching
- Cache invalidation strategies

### API
- Response compression
- Lazy loading
- Batch requests
- Streaming responses
- Edge functions

### Frontend
- Server Components
- Code splitting
- Image optimization
- Lazy loading
- Optimistic updates

---

## 📈 Scalability

### Horizontal Scaling
- Stateless API servers
- Load balancing
- Database read replicas
- Redis clustering
- Worker scaling

### Vertical Scaling
- Database optimization
- Query optimization
- Connection pooling
- Resource allocation

### Queue-Based Architecture
- Async processing
- Job prioritization
- Retry mechanisms
- Dead letter queues
- Worker auto-scaling

---

## 🔄 Data Flow Examples

### Code Submission Flow

```
1. User submits code (Client)
   ↓
2. Server Action validates input
   ↓
3. Create submission record (Database)
   ↓
4. Add job to execution queue (BullMQ)
   ↓
5. Worker picks up job
   ↓
6. Execute in Docker sandbox
   ↓
7. Evaluate test cases
   ↓
8. Update submission status (Database)
   ↓
9. Send real-time update (WebSocket)
   ↓
10. Client receives result
```

### Assessment Creation Flow

```
1. Recruiter creates assessment (Client)
   ↓
2. API validates data (Zod)
   ↓
3. Check permissions (RBAC)
   ↓
4. Create assessment (Service)
   ↓
5. Add questions (Repository)
   ↓
6. Invalidate cache (Redis)
   ↓
7. Return response
   ↓
8. Revalidate paths (Next.js)
```

### Proctoring Flow

```
1. Candidate starts exam (Client)
   ↓
2. Create exam session (Database)
   ↓
3. Start webcam monitoring (Client)
   ↓
4. Detect violations (Client)
   ↓
5. Send violation event (WebSocket)
   ↓
6. Log violation (Database)
   ↓
7. Update integrity score
   ↓
8. Alert admin (Real-time)
```

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)
- Services
- Repositories
- Utilities
- Validators

### Integration Tests
- API endpoints
- Database operations
- Queue processing
- Cache operations

### E2E Tests (Playwright)
- User flows
- Assessment creation
- Code submission
- Proctoring

### Load Tests
- Concurrent users
- Code execution
- Database queries
- API endpoints

---

## 📊 Monitoring & Observability

### Logging
- Structured logging (Winston)
- Log levels (error, warn, info, debug)
- Request logging
- Error logging
- Audit logging

### Error Tracking
- Sentry integration
- Error grouping
- Stack traces
- User context
- Performance monitoring

### Metrics
- API response times
- Database query times
- Queue processing times
- Cache hit rates
- Error rates

### Alerts
- High error rates
- Slow queries
- Queue backlog
- Resource usage
- Security events

---

## 🚢 Deployment Strategy

### Environments
1. **Development**: Local with Docker Compose
2. **Staging**: Vercel + Railway
3. **Production**: Vercel + Fly.io

### CI/CD Pipeline
```
Push to GitHub
  ↓
Run Tests
  ↓
Build Application
  ↓
Run Security Scan
  ↓
Deploy to Staging
  ↓
Run E2E Tests
  ↓
Deploy to Production
  ↓
Health Check
```

### Rollback Strategy
- Instant rollback via Vercel
- Database migrations (reversible)
- Feature flags
- Blue-green deployment

---

## 📚 API Design

### RESTful Endpoints

```
# Assessments
GET    /api/v1/assessments
POST   /api/v1/assessments
GET    /api/v1/assessments/:id
PUT    /api/v1/assessments/:id
DELETE /api/v1/assessments/:id

# Submissions
POST   /api/v1/submissions
GET    /api/v1/submissions/:id
GET    /api/v1/submissions/:id/status

# Analytics
GET    /api/v1/analytics/assessments/:id
GET    /api/v1/analytics/leaderboard/:id

# Proctoring
POST   /api/v1/proctoring/violations
GET    /api/v1/proctoring/sessions/:id
```

### Response Format

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  },
  "timestamp": "2026-05-13T10:00:00Z"
}
```

### Error Format

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": { ... }
  },
  "timestamp": "2026-05-13T10:00:00Z"
}
```

---

## 🎯 Best Practices

### Code Organization
- Feature-driven structure
- Separation of concerns
- Single responsibility
- Dependency injection
- Interface segregation

### TypeScript
- Strict mode enabled
- No implicit any
- Proper type definitions
- Generic types
- Type guards

### Error Handling
- Custom error classes
- Proper error propagation
- User-friendly messages
- Error logging
- Graceful degradation

### Performance
- Lazy loading
- Code splitting
- Caching strategies
- Query optimization
- Resource pooling

### Security
- Input validation
- Output encoding
- Authentication
- Authorization
- Rate limiting

---

## 📖 Documentation

### Code Documentation
- JSDoc comments
- Type definitions
- README files
- Architecture diagrams
- API documentation

### User Documentation
- User guides
- Admin guides
- API reference
- Troubleshooting
- FAQs

---

## 🔮 Future Enhancements

### Phase 1 (Completed)
- ✅ Core assessment system
- ✅ Code execution engine
- ✅ Basic proctoring
- ✅ Analytics dashboard

### Phase 2 (In Progress)
- 🔄 AI-powered proctoring
- 🔄 Advanced analytics
- 🔄 Certificate generation
- 🔄 Mobile app

### Phase 3 (Planned)
- 📋 AI interview system
- 📋 Plagiarism detection
- 📋 Video proctoring
- 📋 Advanced reporting

### Phase 4 (Future)
- 💡 GPT-powered code review
- 💡 Automated question generation
- 💡 Predictive analytics
- 💡 ATS integration

---

## 📞 Support & Maintenance

### Development Team
- Backend: 2-3 developers
- Frontend: 2-3 developers
- DevOps: 1 engineer
- QA: 1-2 testers

### Maintenance Schedule
- Daily: Monitoring and alerts
- Weekly: Performance review
- Monthly: Security audit
- Quarterly: Architecture review

### SLA Targets
- Uptime: 99.9%
- API Response: < 200ms (p95)
- Code Execution: < 30s
- Support Response: < 4 hours

---

## 🎓 Learning Resources

### Required Reading
1. Next.js 15 Documentation
2. Prisma Best Practices
3. Supabase Auth Guide
4. BullMQ Documentation
5. Docker Security Guide

### Recommended Reading
1. Clean Architecture (Robert C. Martin)
2. Designing Data-Intensive Applications
3. System Design Interview
4. Web Security Handbook

---

## ✅ Implementation Checklist

### Week 1: Foundation
- [x] Project structure
- [x] Environment setup
- [x] Database schema
- [x] Authentication
- [x] Middleware

### Week 2: Core Features
- [x] Assessment CRUD
- [x] Question management
- [x] User management
- [x] Validation
- [x] Caching

### Week 3: Execution Engine
- [ ] Queue setup
- [ ] Worker implementation
- [ ] Docker sandbox
- [ ] Language support
- [ ] Test evaluation

### Week 4: Real-time
- [ ] WebSocket server
- [ ] Session management
- [ ] Proctoring events
- [ ] Live monitoring
- [ ] Notifications

### Week 5: Analytics
- [ ] Analytics service
- [ ] Leaderboard
- [ ] Performance tracking
- [ ] Certificates
- [ ] Reports

### Week 6: Testing
- [ ] Unit tests
- [ ] Integration tests
- [ ] E2E tests
- [ ] Load tests
- [ ] Security tests

### Week 7: Deployment
- [ ] CI/CD pipeline
- [ ] Staging environment
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Documentation

---

## 🏆 Success Metrics

### Technical Metrics
- API Response Time: < 200ms (p95)
- Database Query Time: < 50ms (p95)
- Code Execution Time: < 30s
- Cache Hit Rate: > 80%
- Error Rate: < 0.1%

### Business Metrics
- Concurrent Users: 10,000+
- Assessments Created: 1,000+/month
- Code Submissions: 100,000+/month
- Uptime: 99.9%
- User Satisfaction: > 4.5/5

---

**This architecture is designed to scale from MVP to enterprise-level platform serving millions of users.**

**Built with enterprise-grade standards, security, and performance in mind.**

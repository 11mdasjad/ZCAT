# ZCAT Platform - Architecture Diagrams

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT LAYER                                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │   Browser    │  │   Mobile     │  │   Desktop    │  │   Tablet     │   │
│  │  (Chrome,    │  │   (iOS,      │  │   (Electron) │  │   (iPad)     │   │
│  │   Safari)    │  │   Android)   │  │              │  │              │   │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │
│         │                 │                 │                 │             │
│         └─────────────────┴─────────────────┴─────────────────┘             │
│                                    │                                         │
└────────────────────────────────────┼─────────────────────────────────────────┘
                                     │
                                     │ HTTPS
                                     │
┌────────────────────────────────────┼─────────────────────────────────────────┐
│                         PRESENTATION LAYER                                   │
│                                    │                                         │
│  ┌─────────────────────────────────▼──────────────────────────────────────┐ │
│  │                         Next.js 15 App Router                           │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │ │
│  │  │   Landing    │  │     Auth     │  │   Dashboard  │                 │ │
│  │  │    Pages     │  │    Pages     │  │    Pages     │                 │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                 │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │ │
│  │  │ Code Editor  │  │  Challenges  │  │   Profile    │                 │ │
│  │  │    Page      │  │     List     │  │    Pages     │                 │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                 │ │
│  │                                                                          │ │
│  │  Components: React 19 + Framer Motion + Tailwind CSS 4                 │ │
│  │  State: Zustand + React Query                                          │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────┬─────────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼─────────────────────────────────────────┐
│                            API LAYER                                         │
│                                    │                                         │
│  ┌─────────────────────────────────▼──────────────────────────────────────┐ │
│  │                      Next.js API Routes                                 │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │ │
│  │  │  Questions   │  │ Assessments  │  │ Submissions  │                 │ │
│  │  │     API      │  │     API      │  │     API      │                 │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                 │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │ │
│  │  │    Users     │  │  Analytics   │  │    Admin     │                 │ │
│  │  │     API      │  │     API      │  │     API      │                 │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                 │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                         │
│  ┌─────────────────────────────────▼──────────────────────────────────────┐ │
│  │                         Middleware Stack                                │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │ │
│  │  │     Auth     │→ │     RBAC     │→ │ Rate Limit   │                 │ │
│  │  │  Middleware  │  │  Middleware  │  │  Middleware  │                 │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                 │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────┬─────────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼─────────────────────────────────────────┐
│                          SERVICE LAYER                                       │
│                                    │                                         │
│  ┌─────────────────────────────────▼──────────────────────────────────────┐ │
│  │                        Business Logic Services                          │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │ │
│  │  │   Question   │  │  Assessment  │  │  Submission  │                 │ │
│  │  │   Service    │  │   Service    │  │   Service    │                 │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                 │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │ │
│  │  │     User     │  │  Proctoring  │  │  Analytics   │                 │ │
│  │  │   Service    │  │   Service    │  │   Service    │                 │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                 │ │
│  │                                                                          │ │
│  │  Features: Validation, Error Handling, Logging, Caching                │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────┬─────────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼─────────────────────────────────────────┐
│                        REPOSITORY LAYER                                      │
│                                    │                                         │
│  ┌─────────────────────────────────▼──────────────────────────────────────┐ │
│  │                      Data Access Repositories                           │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │ │
│  │  │   Question   │  │  Assessment  │  │  Submission  │                 │ │
│  │  │  Repository  │  │  Repository  │  │  Repository  │                 │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                 │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │ │
│  │  │     User     │  │   Session    │  │  Certificate │                 │ │
│  │  │  Repository  │  │  Repository  │  │  Repository  │                 │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                 │ │
│  │                                                                          │ │
│  │  Pattern: Generic CRUD + Custom Queries                                │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────┬─────────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼─────────────────────────────────────────┐
│                          DATA LAYER                                          │
│                                    │                                         │
│  ┌─────────────────────────────────▼──────────────────────────────────────┐ │
│  │                         Prisma ORM                                      │ │
│  │  ┌──────────────────────────────────────────────────────────────────┐  │ │
│  │  │  Query Builder │ Migrations │ Type Safety │ Connection Pool     │  │ │
│  │  └──────────────────────────────────────────────────────────────────┘  │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
│                                    │                                         │
│  ┌─────────────────────────────────▼──────────────────────────────────────┐ │
│  │                    PostgreSQL (Supabase)                                │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐                 │ │
│  │  │   30+ Tables │  │   Indexes    │  │  Relations   │                 │ │
│  │  │   203 Ques   │  │   50+ Index  │  │   Foreign    │                 │ │
│  │  └──────────────┘  └──────────────┘  └──────────────┘                 │ │
│  └──────────────────────────────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────────────────────────────┘
```

## 🔄 Code Execution Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        CODE EXECUTION PIPELINE                               │
└─────────────────────────────────────────────────────────────────────────────┘

1. SUBMISSION
   ┌──────────────┐
   │   Student    │
   │   Submits    │
   │     Code     │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │  Validation  │  ← Zod Schema
   │   & Saving   │  ← Prisma
   └──────┬───────┘
          │
          ▼

2. QUEUEING
   ┌──────────────┐
   │   BullMQ     │
   │    Queue     │  ← Job Priority
   │              │  ← Retry Logic
   └──────┬───────┘
          │
          ▼

3. WORKER PROCESSING
   ┌──────────────┐
   │  Execution   │
   │   Worker     │  ← Node.js Process
   │              │  ← Job Consumer
   └──────┬───────┘
          │
          ▼

4. DOCKER SANDBOX
   ┌──────────────────────────────────────┐
   │         Docker Container             │
   │  ┌────────────────────────────────┐  │
   │  │  Language Runtime              │  │
   │  │  • Python 3.11                 │  │
   │  │  • Node.js 20                  │  │
   │  │  • OpenJDK 17                  │  │
   │  │  • GCC 12 (C/C++)              │  │
   │  └────────────────────────────────┘  │
   │                                      │
   │  Security Limits:                    │
   │  • CPU: 1 core, 10s max             │
   │  • Memory: 512 MB                   │
   │  • Network: Disabled                │
   │  • File System: Read-only           │
   └──────┬───────────────────────────────┘
          │
          ▼

5. TEST EXECUTION
   ┌──────────────┐
   │  Run Tests   │
   │  • Sample    │  ← Visible to student
   │  • Hidden    │  ← Secret test cases
   └──────┬───────┘
          │
          ▼

6. RESULT PROCESSING
   ┌──────────────┐
   │   Evaluate   │
   │   Results    │  ← Pass/Fail
   │              │  ← Score Calculation
   └──────┬───────┘
          │
          ▼

7. STORAGE & NOTIFICATION
   ┌──────────────┐     ┌──────────────┐
   │  Save to DB  │     │   WebSocket  │
   │   (Prisma)   │     │  Real-time   │
   │              │     │   Update     │
   └──────────────┘     └──────────────┘
          │                     │
          └──────────┬──────────┘
                     ▼
              ┌──────────────┐
              │   Student    │
              │   Receives   │
              │   Results    │
              └──────────────┘
```

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION FLOW                                   │
└─────────────────────────────────────────────────────────────────────────────┘

1. LOGIN REQUEST
   ┌──────────────┐
   │    User      │
   │  Enters      │
   │ Credentials  │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │  Validation  │  ← Zod Schema
   │              │  ← Email/Password
   └──────┬───────┘
          │
          ▼

2. SUPABASE AUTH
   ┌──────────────┐
   │  Supabase    │
   │    Auth      │  ← Password Verification
   │              │  ← User Lookup
   └──────┬───────┘
          │
          ▼

3. TOKEN GENERATION
   ┌──────────────┐
   │  JWT Tokens  │
   │  • Access    │  ← 15 min expiry
   │  • Refresh   │  ← 7 day expiry
   └──────┬───────┘
          │
          ▼

4. SESSION CREATION
   ┌──────────────┐
   │   Database   │
   │   Session    │  ← Device Info
   │   Record     │  ← IP Address
   └──────┬───────┘
          │
          ▼

5. RESPONSE
   ┌──────────────┐
   │  Set Cookies │
   │  • httpOnly  │
   │  • secure    │
   │  • sameSite  │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │  Redirect    │
   │  Dashboard   │
   └──────────────┘

SUBSEQUENT REQUESTS:
   ┌──────────────┐
   │   Request    │
   │  + Cookie    │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │    Auth      │
   │  Middleware  │  ← Verify JWT
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │    RBAC      │
   │  Middleware  │  ← Check Role
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │   Handler    │
   │  Executes    │
   └──────────────┘
```

## 📊 Data Flow - Question Browsing

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     QUESTION BROWSING DATA FLOW                              │
└─────────────────────────────────────────────────────────────────────────────┘

CLIENT SIDE:
   ┌──────────────┐
   │   Student    │
   │   Visits     │
   │ /challenges  │
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │  React Page  │
   │   Renders    │  ← Loading State
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │   useEffect  │
   │   Triggers   │  ← Fetch Questions
   └──────┬───────┘
          │
          │ HTTP GET
          │
SERVER SIDE:
          │
          ▼
   ┌──────────────┐
   │  API Route   │
   │ /api/v1/     │  ← Parse Query Params
   │  questions   │  ← page, limit, difficulty
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │  Validation  │
   │  Middleware  │  ← Zod Schema
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │   Question   │
   │   Service    │  ← Business Logic
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │   Question   │
   │  Repository  │  ← Build Query
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │    Prisma    │
   │    Query     │  ← SQL Generation
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │  PostgreSQL  │
   │   Database   │  ← Execute Query
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │   Results    │
   │  Transform   │  ← Format Response
   └──────┬───────┘
          │
          │ JSON Response
          │
CLIENT SIDE:
          │
          ▼
   ┌──────────────┐
   │   setState   │
   │   Update     │  ← Store in State
   └──────┬───────┘
          │
          ▼
   ┌──────────────┐
   │  Re-render   │
   │   Display    │  ← Show Questions
   │   Questions  │  ← Pagination
   └──────────────┘
```

## 🎯 Component Hierarchy

```
App
├── RootLayout
│   ├── Navbar
│   ├── ParticleBackground
│   └── Footer
│
├── Landing Page (/)
│   ├── HeroSection
│   ├── FeaturesSection
│   ├── CodeEditorSection
│   ├── ProctoringSection
│   ├── StatsSection
│   ├── TestimonialsSection
│   ├── PricingSection
│   ├── TrustedSection
│   └── ContactSection
│
├── Auth Pages
│   ├── Login (/login)
│   │   └── LoginForm
│   └── Register (/register)
│       └── RegisterForm
│
├── Candidate Dashboard (/candidate)
│   ├── DashboardLayout
│   │   ├── Sidebar
│   │   └── Header
│   │
│   ├── Overview (/candidate)
│   │   ├── StatsCards
│   │   ├── RecentTests
│   │   └── PerformanceChart
│   │
│   ├── Challenges (/candidate/challenges)
│   │   ├── SearchBar
│   │   ├── FilterButtons
│   │   ├── StatsCards
│   │   ├── QuestionCard (x203)
│   │   └── Pagination
│   │
│   ├── Code Editor (/code/:id)
│   │   ├── TopBar
│   │   │   ├── QuestionInfo
│   │   │   ├── Timer
│   │   │   ├── RunButton
│   │   │   └── SubmitButton
│   │   ├── LeftPanel
│   │   │   ├── Tabs (Description/Submissions)
│   │   │   ├── QuestionDescription
│   │   │   ├── Examples
│   │   │   └── Constraints
│   │   └── RightPanel
│   │       ├── EditorToolbar
│   │       │   ├── LanguageSelector
│   │       │   └── EditorControls
│   │       ├── MonacoEditor
│   │       └── Console
│   │           ├── Output
│   │           └── TestResults
│   │
│   ├── Tests (/candidate/tests)
│   ├── History (/candidate/history)
│   ├── Performance (/candidate/performance)
│   ├── Leaderboard (/candidate/leaderboard)
│   ├── Certificates (/candidate/certificates)
│   ├── Interview (/candidate/interview)
│   └── Profile (/candidate/profile)
│
└── Admin Dashboard (/admin)
    ├── DashboardLayout
    ├── Overview (/admin)
    ├── Assessments (/admin/assessments)
    ├── Questions (/admin/questions)
    ├── Candidates (/admin/candidates)
    ├── Analytics (/admin/analytics)
    ├── Reports (/admin/reports)
    ├── Monitoring (/admin/monitoring)
    └── Settings (/admin/settings)
```

## 🗄️ Database Entity Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      DATABASE RELATIONSHIPS                                  │
└─────────────────────────────────────────────────────────────────────────────┘

USER DOMAIN:
   User ──1:1──> Profile
   User ──1:1──> CandidateProfile
   User ──1:1──> RecruiterProfile
   User ──1:N──> RefreshToken
   User ──1:N──> DeviceSession
   User ──1:N──> AuditLog

ASSESSMENT DOMAIN:
   User ──1:N──> Assessment (created_by)
   Assessment ──N:M──> Question (via AssessmentQuestion)
   Question ──1:N──> TestCase
   Question ──1:N──> QuestionVersion

SUBMISSION DOMAIN:
   User ──1:N──> Submission
   Assessment ──1:N──> Submission
   Question ──1:N──> Submission
   ExamSession ──1:N──> Submission
   Submission ──1:N──> CodeExecution
   Submission ──1:N──> TestCaseResult

SESSION & PROCTORING:
   User ──1:N──> ExamSession
   Assessment ──1:N──> ExamSession
   ExamSession ──1:N──> Violation
   ExamSession ──1:N──> ProctoringSnapshot

ANALYTICS:
   Assessment ──1:1──> AssessmentAnalytics
   Assessment ──1:1──> Leaderboard
   Leaderboard ──1:N──> LeaderboardEntry
   User ──1:N──> LeaderboardEntry
   User ──1:N──> PerformanceSnapshot

CERTIFICATES & NOTIFICATIONS:
   User ──1:N──> Certificate
   User ──1:N──> Notification
   Assessment ──1:N──> AssessmentInvitation

AI INTERVIEW:
   User ──1:N──> InterviewSession
   InterviewSession ──1:N──> InterviewQuestion
   InterviewSession ──1:N──> InterviewResponse
   InterviewQuestion ──1:N──> InterviewResponse
```

## 🔄 State Management Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        ZUSTAND STATE FLOW                                    │
└─────────────────────────────────────────────────────────────────────────────┘

AUTH STORE:
   ┌──────────────┐
   │  authStore   │
   │              │
   │  State:      │
   │  • user      │
   │  • isAuth    │
   │              │
   │  Actions:    │
   │  • login()   │──┐
   │  • logout()  │  │
   │  • update()  │  │
   └──────────────┘  │
                     │
                     ▼
              ┌──────────────┐
              │  Components  │
              │  Subscribe   │
              └──────────────┘

EXAM STORE:
   ┌──────────────┐
   │  examStore   │
   │              │
   │  State:      │
   │  • exam      │
   │  • timer     │
   │  • subs      │
   │              │
   │  Actions:    │
   │  • start()   │──┐
   │  • submit()  │  │
   │  • end()     │  │
   └──────────────┘  │
                     │
                     ▼
              ┌──────────────┐
              │  Components  │
              │  Subscribe   │
              └──────────────┘

UI STORE:
   ┌──────────────┐
   │   uiStore    │
   │              │
   │  State:      │
   │  • sidebar   │
   │  • theme     │
   │  • notifs    │
   │              │
   │  Actions:    │
   │  • toggle()  │──┐
   │  • setTheme()│  │
   │  • notify()  │  │
   └──────────────┘  │
                     │
                     ▼
              ┌──────────────┐
              │  Components  │
              │  Subscribe   │
              └──────────────┘
```

---

**Last Updated**: May 13, 2026  
**Version**: 0.1.0  
**Status**: ✅ Architecture Complete

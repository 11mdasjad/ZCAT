# LeetCode Questions Integration Guide

## Quick Start

### Option 1: Automated Setup (Recommended)
```bash
# Run the setup script
./scripts/setup-questions.sh
```

### Option 2: Manual Setup
```bash
# 1. Generate Prisma Client
npx prisma generate

# 2. Push database schema
npx prisma db push

# 3. Seed questions
npm run prisma:seed

# 4. Start development server
npm run dev
```

## API Endpoints

### List Questions
```http
GET /api/v1/questions?page=1&limit=20&difficulty=MEDIUM&search=array
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20, max: 100)
- `difficulty` (enum): EASY | MEDIUM | HARD
- `tags` (string): Comma-separated tags
- `search` (string): Search in title and description

**Response:**
```json
{
  "success": true,
  "message": "Questions fetched successfully",
  "data": {
    "questions": [...],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 203,
      "pages": 11
    }
  }
}
```

### Get Question by ID
```http
GET /api/v1/questions/:id
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "title": "Two Sum",
    "slug": "two-sum",
    "difficulty": "EASY",
    "description": "...",
    "examples": ["..."],
    "constraints": ["..."],
    "tags": ["Array", "Hash Table"],
    "timeLimit": 2000,
    "memoryLimit": 256,
    "testCases": [...]
  }
}
```

### Get Question by Slug
```http
GET /api/v1/questions/slug/:slug
```

### Get Random Question
```http
GET /api/v1/questions/random?difficulty=MEDIUM
```

### Get All Tags
```http
GET /api/v1/questions/tags
```

**Response:**
```json
{
  "success": true,
  "data": {
    "tags": ["Array", "String", "Tree", "Dynamic Programming", ...]
  }
}
```

### Get Statistics
```http
GET /api/v1/questions/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "stats": [
      { "difficulty": "EASY", "count": 47 },
      { "difficulty": "MEDIUM", "count": 123 },
      { "difficulty": "HARD", "count": 33 }
    ]
  }
}
```

## Frontend Pages

### Challenges List
**URL:** `/candidate/challenges`

**Features:**
- View all 203 questions
- Filter by difficulty
- Search by title
- Pagination
- Statistics cards
- Tag display

### Code Editor
**URL:** `/code/:id`

**Features:**
- Monaco code editor
- Multiple language support (Python, JavaScript, Java, C++, C)
- Run code
- Submit solution
- View test cases
- Timer
- Question description

## Database Schema

### Question Model
```prisma
model Question {
  id             String     @id @default(uuid())
  title          String
  slug           String     @unique
  description    String
  type           QuestionType @default(CODING)
  difficulty     Difficulty
  tags           String[]   @default([])
  timeLimit      Int?       // milliseconds
  memoryLimit    Int?       // MB
  constraints    String[]   @default([])
  examples       String[]   @default([])
  isActive       Boolean    @default(true)
  testCases      TestCase[]
  submissions    Submission[]
  createdAt      DateTime   @default(now())
  updatedAt      DateTime   @updatedAt
}
```

### TestCase Model
```prisma
model TestCase {
  id             String   @id @default(uuid())
  questionId     String
  input          String
  expectedOutput String
  isHidden       Boolean  @default(false)
  explanation    String?
  orderIndex     Int      @default(0)
  question       Question @relation(...)
}
```

## Code Examples

### Fetching Questions (Client Component)
```typescript
'use client';

import { useState, useEffect } from 'react';

export default function QuestionsList() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQuestions() {
      const response = await fetch('/api/v1/questions?page=1&limit=20');
      const data = await response.json();
      setQuestions(data.data.questions);
      setLoading(false);
    }
    fetchQuestions();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      {questions.map(q => (
        <div key={q.id}>{q.title}</div>
      ))}
    </div>
  );
}
```

### Using Question Service
```typescript
import { questionService } from '@/services/questions/question.service';

// Get questions with filters
const result = await questionService.getQuestions({
  page: 1,
  limit: 20,
  difficulty: 'MEDIUM',
  tags: ['Array', 'Hash Table'],
  search: 'sum'
});

// Get single question
const question = await questionService.getQuestionById('uuid');

// Get random question
const random = await questionService.getRandomQuestion('EASY');

// Get tags
const tags = await questionService.getTags();

// Get statistics
const stats = await questionService.getDifficultyStats();
```

### Using Question Repository
```typescript
import { questionRepository } from '@/repositories/question.repository';

// Find with filters
const { questions, total, pages } = await questionRepository.findAllWithFilters(
  { difficulty: 'MEDIUM', tags: ['Array'] },
  1,  // page
  20  // limit
);

// Find by slug
const question = await questionRepository.findBySlugWithTestCases('two-sum');

// Get random
const random = await questionRepository.getRandomByDifficulty('EASY');

// Get popular
const popular = await questionRepository.getPopularQuestions(10);
```

## Testing

### Test API Endpoints
```bash
# List questions
curl http://localhost:3001/api/v1/questions

# Get question by ID
curl http://localhost:3001/api/v1/questions/[uuid]

# Get random question
curl http://localhost:3001/api/v1/questions/random?difficulty=EASY

# Get tags
curl http://localhost:3001/api/v1/questions/tags

# Get stats
curl http://localhost:3001/api/v1/questions/stats
```

### Test with Prisma Studio
```bash
npx prisma studio
```

## Troubleshooting

### Questions not showing
1. Check database connection
2. Verify questions are seeded: `npx prisma studio`
3. Check API response: `/api/v1/questions`
4. Check browser console for errors

### Seed script fails
1. Ensure `scripts/leetcode-questions.json` exists
2. Check database connection in `.env`
3. Run `npx prisma generate` first
4. Check Prisma schema is valid

### API returns 500 error
1. Check server logs
2. Verify database connection
3. Check Prisma Client is generated
4. Verify environment variables

## Performance Tips

### Caching
Consider adding Redis caching for:
- Question lists
- Popular questions
- Tags
- Statistics

### Pagination
- Default limit: 20 questions
- Maximum limit: 100 questions
- Use cursor-based pagination for large datasets

### Indexing
Database indexes are already optimized for:
- Difficulty filtering
- Tag searching
- Title searching
- Slug lookups

## Security

### Input Validation
All inputs are validated using Zod schemas:
- Query parameters
- Path parameters
- Request bodies

### SQL Injection
Protected by Prisma ORM parameterized queries.

### Rate Limiting
Consider adding rate limiting middleware for API endpoints.

## Monitoring

### Logging
All operations are logged using Winston:
- Question fetches
- Errors
- Performance metrics

### Analytics
Track:
- Most viewed questions
- Most attempted questions
- Success rates
- Popular tags

## Contributing

### Adding New Questions
```typescript
import { questionRepository } from '@/repositories/question.repository';

await questionRepository.create({
  title: 'New Question',
  slug: 'new-question',
  difficulty: 'MEDIUM',
  description: '...',
  tags: ['Array'],
  timeLimit: 2000,
  memoryLimit: 256,
  // ...
});
```

### Updating Questions
```typescript
await questionRepository.update('question-id', {
  description: 'Updated description',
  tags: ['Array', 'Hash Table'],
});
```

### Bulk Operations
```typescript
await questionRepository.bulkCreate([
  { title: 'Q1', slug: 'q1', ... },
  { title: 'Q2', slug: 'q2', ... },
]);
```

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Zod Validation](https://zod.dev/)
- [LeetCode](https://leetcode.com/)

## Support

For issues or questions:
1. Check this documentation
2. Review `LEETCODE_INTEGRATION_COMPLETE.md`
3. Check server logs
4. Inspect database with Prisma Studio

---

**Total Questions**: 203
**Status**: ✅ Production Ready
**Last Updated**: May 13, 2026

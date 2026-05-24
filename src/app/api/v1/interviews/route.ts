/**
 * Interviews Platform API Route
 * GET /api/v1/interviews - List all sessions for the candidate
 * POST /api/v1/interviews - Start a new mock interview session
 */

import { NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth.middleware';
import { interviewService } from '@/services/interview/interview.service';
import { successResponse, errorResponse, createdResponse } from '@/lib/utils/response';
import { z } from 'zod';
import { ValidationError } from '@/lib/errors/app-error';

// Input Validator Schema
const createSessionSchema = z.object({
  title: z.string().min(1, 'Target job title/role is required'),
  category: z.enum(['TECHNICAL', 'HR', 'PLACEMENT'], {
    errorMap: () => ({ message: 'Category must be TECHNICAL, HR, or PLACEMENT' }),
  }),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD'], {
    errorMap: () => ({ message: 'Difficulty must be EASY, MEDIUM, or HARD' }),
  }),
  duration: z.number().min(1).default(15),
});

/**
 * GET /api/v1/interviews
 * List all previous mock interview sessions
 */
export async function GET(req: NextRequest) {
  try {
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    const sessions = await interviewService.getUserSessions(user.id);
    return successResponse(sessions);
  } catch (err: any) {
    return errorResponse(err);
  }
}

/**
 * POST /api/v1/interviews
 * Start a new mock interview session and generate the first question
 */
export async function POST(req: NextRequest) {
  try {
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    const body = await req.json();
    const validatedData = createSessionSchema.parse(body);

    const session = await interviewService.createSession(
      user.id,
      validatedData.title,
      validatedData.category,
      validatedData.difficulty,
      validatedData.duration
    );

    return createdResponse(session);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return errorResponse(new ValidationError('Invalid configuration fields', err.errors));
    }
    return errorResponse(err);
  }
}

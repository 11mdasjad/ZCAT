import { NextRequest } from 'next/server';
import { questionService } from '@/services/questions/question.service';
import { questionListQuerySchema } from '@/validators/question.validator';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { AppError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';

/**
 * GET /api/v1/questions
 * Get paginated list of questions with filters
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters (convert null → undefined so Zod defaults work)
    const queryParams = questionListQuerySchema.parse({
      page: searchParams.get('page') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      difficulty: searchParams.get('difficulty') ?? undefined,
      tags: searchParams.get('tags') ?? undefined,
      search: searchParams.get('search') ?? undefined,
    });

    const result = await questionService.getQuestions(queryParams);

    return successResponse(result);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error, error.statusCode);
    }

    logger.error('GET /api/v1/questions error', { error, params: request.url });
    return errorResponse(new Error('Failed to fetch questions'), 500);
  }
}

/**
 * POST /api/v1/questions
 * Create a new question (Admin only)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await questionService.createQuestion(body);
    return successResponse(result, 201);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error, error.statusCode);
    }
    logger.error('POST /api/v1/questions error', { error });
    return errorResponse(new Error('Failed to create question'), 500);
  }
}

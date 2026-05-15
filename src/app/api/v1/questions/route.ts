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

    // Parse and validate query parameters
    const queryParams = questionListQuerySchema.parse({
      page: searchParams.get('page'),
      limit: searchParams.get('limit'),
      difficulty: searchParams.get('difficulty'),
      tags: searchParams.get('tags'),
      search: searchParams.get('search'),
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

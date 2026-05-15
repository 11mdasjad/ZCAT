import { NextRequest } from 'next/server';
import { questionService } from '@/services/questions/question.service';
import { questionIdParamSchema } from '@/validators/question.validator';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { AppError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';

/**
 * GET /api/v1/questions/:id
 * Get question by ID with test cases
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<unknown> }
) {
  try {
    const resolvedParams = await params;
    // Validate ID parameter
    const { id } = questionIdParamSchema.parse(resolvedParams);

    // TODO: Get user ID from auth session
    const userId = undefined;

    const question = await questionService.getQuestionById(id, userId);

    return successResponse(question);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error, error.statusCode);
    }

    logger.error('GET /api/v1/questions/:id error', { error, params });
    return errorResponse(new Error('Failed to fetch question'), 500);
  }
}

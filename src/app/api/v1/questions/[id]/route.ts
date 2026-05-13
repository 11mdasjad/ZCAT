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
  { params }: { params: { id: string } }
) {
  try {
    // Validate ID parameter
    const { id } = questionIdParamSchema.parse(params);

    // TODO: Get user ID from auth session
    const userId = undefined;

    const question = await questionService.getQuestionById(id, userId);

    return successResponse(question, 'Question fetched successfully');
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }

    logger.error('GET /api/v1/questions/:id error', { error, params });
    return errorResponse('Failed to fetch question', 500);
  }
}

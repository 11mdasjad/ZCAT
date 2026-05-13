import { NextRequest } from 'next/server';
import { questionService } from '@/services/questions/question.service';
import { questionSlugParamSchema } from '@/validators/question.validator';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { AppError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';

/**
 * GET /api/v1/questions/slug/:slug
 * Get question by slug with test cases
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    // Validate slug parameter
    const { slug } = questionSlugParamSchema.parse(params);

    // TODO: Get user ID from auth session
    const userId = undefined;

    const question = await questionService.getQuestionBySlug(slug, userId);

    return successResponse(question, 'Question fetched successfully');
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }

    logger.error('GET /api/v1/questions/slug/:slug error', { error, params });
    return errorResponse('Failed to fetch question', 500);
  }
}

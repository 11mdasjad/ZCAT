import { NextRequest } from 'next/server';
import { questionService } from '@/services/questions/question.service';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { AppError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';

/**
 * GET /api/v1/questions/tags
 * Get all available question tags
 */
export async function GET(request: NextRequest) {
  try {
    const tags = await questionService.getTags();

    return successResponse({ tags }, 'Tags fetched successfully');
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error.message, error.statusCode);
    }

    logger.error('GET /api/v1/questions/tags error', { error });
    return errorResponse('Failed to fetch tags', 500);
  }
}

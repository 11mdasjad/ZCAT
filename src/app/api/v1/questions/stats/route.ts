import { NextRequest } from 'next/server';
import { questionService } from '@/services/questions/question.service';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { AppError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';

/**
 * GET /api/v1/questions/stats
 * Get question statistics (difficulty distribution)
 */
export async function GET(request: NextRequest) {
  try {
    const stats = await questionService.getDifficultyStats();

    return successResponse({ stats });
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error, error.statusCode);
    }

    logger.error('GET /api/v1/questions/stats error', { error });
    return errorResponse(new Error('Failed to fetch statistics'), 500);
  }
}

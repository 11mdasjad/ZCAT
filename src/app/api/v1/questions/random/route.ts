import { NextRequest } from 'next/server';
import { questionService } from '@/services/questions/question.service';
import { randomQuestionQuerySchema } from '@/validators/question.validator';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { AppError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';

/**
 * GET /api/v1/questions/random
 * Get a random question for practice
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse and validate query parameters
    const { difficulty } = randomQuestionQuerySchema.parse({
      difficulty: searchParams.get('difficulty'),
    });

    const question = await questionService.getRandomQuestion(difficulty);

    return successResponse(question);
  } catch (error) {
    if (error instanceof AppError) {
      return errorResponse(error, error.statusCode);
    }

    logger.error('GET /api/v1/questions/random error', { error });
    return errorResponse(new Error('Failed to fetch random question'), 500);
  }
}

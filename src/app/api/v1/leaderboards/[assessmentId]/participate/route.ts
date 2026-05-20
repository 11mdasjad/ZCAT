import { NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth.middleware';
import { rateLimiters } from '@/middleware/rate-limit.middleware';
import { leaderboardService } from '@/services/leaderboard/leaderboard.service';
import { successResponse, errorResponse } from '@/lib/utils/response';

interface RouteContext {
  params: Promise<{
    assessmentId: string;
  }>;
}

/**
 * POST /api/v1/leaderboards/[assessmentId]/participate
 * Register current candidate as active participant (0 points)
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    // Rate limiting
    await rateLimiters.strict(req);

    // Authentication required
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    const { assessmentId } = await context.params;
    const entry = await leaderboardService.participate(assessmentId, user.id);

    return successResponse({
      entry,
      message: 'Successfully joined the leaderboard'
    });
  } catch (error) {
    return errorResponse(error as Error);
  }
}

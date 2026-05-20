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
 * GET /api/v1/leaderboards/[assessmentId]
 * Get the rankings list for a specific assessment
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    // Rate limiting
    await rateLimiters.standard(req);

    // Authentication required
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    const { assessmentId } = await context.params;
    const leaderboardDetails = await leaderboardService.getLeaderboard(assessmentId);

    return successResponse(leaderboardDetails);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

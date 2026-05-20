import { NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth.middleware';
import { requireRecruiterOrAdmin } from '@/middleware/rbac.middleware';
import { rateLimiters } from '@/middleware/rate-limit.middleware';
import { leaderboardService } from '@/services/leaderboard/leaderboard.service';
import { successResponse, errorResponse } from '@/lib/utils/response';

interface RouteContext {
  params: Promise<{
    assessmentId: string;
  }>;
}

/**
 * POST /api/v1/leaderboards/[assessmentId]/reset
 * Admin only: Wipes all rankings on a leaderboard
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    // Rate limiting
    await rateLimiters.strict(req);

    // Authentication & RBAC required
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    const authError = requireRecruiterOrAdmin(user);
    if (authError) return authError;

    const { assessmentId } = await context.params;
    await leaderboardService.resetLeaderboard(assessmentId);
    return successResponse({
      message: 'Leaderboard rankings reset successfully'
    });
  } catch (error) {
    return errorResponse(error as Error);
  }
}

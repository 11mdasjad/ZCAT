import { NextRequest, NextResponse } from 'next/server';
import { authMiddleware } from '@/middleware/auth.middleware';
import { requireRecruiterOrAdmin } from '@/middleware/rbac.middleware';
import { rateLimiters } from '@/middleware/rate-limit.middleware';
import { leaderboardService } from '@/services/leaderboard/leaderboard.service';
import {
  successResponse,
  errorResponse,
  createdResponse,
} from '@/lib/utils/response';
import { ValidationError } from '@/lib/errors/app-error';

/**
 * GET /api/v1/leaderboards
 * List all assessments with leaderboard details
 */
export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    await rateLimiters.standard(req);

    // Optional auth - check user is logged in
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    const data = await leaderboardService.listAllLeaderboards();
    return successResponse(data);
  } catch (error) {
    return errorResponse(error as Error);
  }
}

/**
 * POST /api/v1/leaderboards
 * Connect or disconnect a leaderboard for an assessment
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    await rateLimiters.strict(req);

    // Authentication & RBAC required
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    const authError = requireRecruiterOrAdmin(user);
    if (authError) return authError;

    // Parse and validate request
    const body = await req.json();
    const { assessmentId, enabled } = body;

    if (!assessmentId || typeof enabled !== 'boolean') {
      throw new ValidationError('Missing required fields: assessmentId (string) and enabled (boolean)');
    }

    const leaderboard = await leaderboardService.toggleLeaderboard(assessmentId, enabled);
    return successResponse({
      leaderboard,
      message: enabled ? 'Leaderboard connected successfully' : 'Leaderboard disconnected successfully'
    });
  } catch (error) {
    return errorResponse(error as Error);
  }
}

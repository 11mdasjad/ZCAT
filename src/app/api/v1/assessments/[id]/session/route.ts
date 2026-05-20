import { NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth.middleware';
import { successResponse, errorResponse } from '@/lib/utils/response';
import prisma from '@/lib/prisma/client';
import { logger } from '@/lib/logger/logger';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/v1/assessments/[id]/session
 * Get the active exam session and integrity score for the candidate.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    const { id: assessmentId } = await context.params;

    // Find exam session
    const session = await prisma.examSession.findUnique({
      where: {
        assessmentId_userId: {
          assessmentId,
          userId: user.id,
        },
      },
    });

    if (!session) {
      // If session doesn't exist, they have 100% integrity by default 
      // but it means they haven't started or had a violation yet.
      return successResponse({ integrityScore: 100 });
    }

    return successResponse(session);
  } catch (err) {
    logger.error('Error fetching exam session:', err);
    return errorResponse(err as Error, 500);
  }
}

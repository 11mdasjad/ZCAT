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
 * POST /api/v1/assessments/[id]/session/submit
 * Mark the candidate's exam session as COMPLETED.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    // 1. Authenticate candidate
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    const { id: assessmentId } = await context.params;

    // 2. Find active exam session
    const session = await prisma.examSession.findUnique({
      where: {
        assessmentId_userId: {
          assessmentId,
          userId: user.id,
        },
      },
    });

    if (!session) {
      return errorResponse(new Error('No exam session found for this candidate'), 404);
    }

    if (session.status === 'COMPLETED' || session.status === 'TERMINATED') {
      return successResponse({
        message: 'Exam session is already submitted.',
        session,
      });
    }

    // 3. Update session to COMPLETED status
    const updatedSession = await prisma.examSession.update({
      where: { id: session.id },
      data: {
        status: 'COMPLETED',
        endedAt: new Date(),
      },
    });

    logger.info(`Candidate ${user.email} successfully COMPLETED and submitted assessment session: ${session.id}`, {
      userId: user.id,
      sessionId: session.id,
    });

    return successResponse({
      message: 'Exam session submitted and completed successfully.',
      session: updatedSession,
    });
  } catch (err) {
    logger.error('Error submitting exam session:', err);
    return errorResponse(err as Error, 500);
  }
}

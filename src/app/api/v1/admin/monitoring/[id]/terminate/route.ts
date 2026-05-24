/**
 * Admin Exam Session Disqualification/Termination API
 * POST /api/v1/admin/monitoring/[id]/terminate - Disqualify and end a candidate's exam session
 */

import { NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth.middleware';
import { requireRecruiterOrAdmin } from '@/middleware/rbac.middleware';
import prisma from '@/lib/prisma/client';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { logger } from '@/lib/logger/logger';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate admin user
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    // 2. Authorize - must be Recruiter or Admin
    const authError = requireRecruiterOrAdmin(user);
    if (authError) return authError;

    const { id: sessionId } = await params;

    // 3. Find and update the session status to TERMINATED
    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
    });

    if (!session) {
      return errorResponse(new Error('Active exam session not found'), 404);
    }

    if (session.status === 'TERMINATED') {
      return errorResponse(new Error('Exam session has already been terminated'), 400);
    }

    const updatedSession = await prisma.examSession.update({
      where: { id: sessionId },
      data: {
        status: 'TERMINATED',
        endedAt: new Date(),
      },
    });

    logger.warn(`Admin ${user.email} TERMINATED candidate exam session: ${sessionId}`, {
      adminId: user.id,
      sessionId,
      candidateId: session.userId,
    });

    return successResponse({
      message: 'Exam session terminated successfully. Candidate has been disqualified.',
      session: updatedSession,
    });
  } catch (err: any) {
    logger.error('Error terminating exam session:', err);
    return errorResponse(err);
  }
}

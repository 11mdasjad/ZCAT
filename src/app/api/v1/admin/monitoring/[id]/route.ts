/**
 * Admin specific exam session monitoring details API
 * GET /api/v1/admin/monitoring/[id] - Fetch snapshots, violations, and real-time status of a candidate
 */

import { NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth.middleware';
import { requireRecruiterOrAdmin } from '@/middleware/rbac.middleware';
import prisma from '@/lib/prisma/client';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Authenticate
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    // 2. Authorize
    const authError = requireRecruiterOrAdmin(user);
    if (authError) return authError;

    const { id: sessionId } = await params;

    // 3. Fetch session with violations and snapshots
    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        assessment: {
          select: {
            title: true,
            duration: true,
          },
        },
        violations: {
          orderBy: { timestamp: 'desc' },
        },
        snapshots: {
          orderBy: { capturedAt: 'desc' },
        },
      },
    });

    if (!session) {
      throw new Error('Exam session not found');
    }

    return successResponse(session);
  } catch (err: any) {
    return errorResponse(err);
  }
}

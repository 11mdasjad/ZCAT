/**
 * Admin specific exam session monitoring details API
 * GET /api/v1/admin/monitoring/[id] - Fetch snapshots, violations, submissions count, and real-time status of a candidate
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

    // 3. Fetch session with all proctoring data, submissions count, and metadata
    const session = await prisma.examSession.findUnique({
      where: { id: sessionId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        assessment: {
          select: {
            id: true,
            title: true,
            type: true,
            difficulty: true,
            duration: true,
            totalMarks: true,
            passingMarks: true,
          },
        },
        violations: {
          orderBy: { timestamp: 'desc' },
        },
        snapshots: {
          orderBy: { capturedAt: 'desc' },
          take: 20, // last 20 captures
        },
        submissions: {
          select: {
            id: true,
            questionId: true,
            status: true,
            score: true,
            submittedAt: true,
          },
          orderBy: { submittedAt: 'desc' },
        },
      },
    });

    if (!session) {
      throw new Error('Exam session not found');
    }

    // 4. Compute derived metrics
    const elapsedSeconds = Math.floor(
      (Date.now() - new Date(session.startedAt).getTime()) / 1000
    );
    const totalDurationSeconds = session.assessment.duration * 60;
    const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds);
    const remainingMins = Math.floor(remainingSeconds / 60);
    const remainingSecs = remainingSeconds % 60;

    const hasCriticalViolation = session.violations.some((v) => v.severity === 'CRITICAL');
    const uniqueQuestionsAnswered = new Set(session.submissions.map((s) => s.questionId)).size;
    const correctSubmissions = session.submissions.filter((s) => s.status === 'ACCEPTED').length;
    const currentScore = session.submissions.reduce((sum, s) => sum + (s.score ?? 0), 0);

    return successResponse({
      ...session,
      // Override computed time values with fresh server-side calculation
      timeRemainingFormatted: `${String(remainingMins).padStart(2, '0')}:${String(remainingSecs).padStart(2, '0')}`,
      elapsedSeconds,
      remainingSeconds,
      // Derived analytics
      hasCriticalViolation,
      uniqueQuestionsAnswered,
      correctSubmissions,
      currentScore,
      totalSubmissions: session.submissions.length,
    });
  } catch (err: any) {
    return errorResponse(err);
  }
}

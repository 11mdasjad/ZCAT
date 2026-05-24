/**
 * Candidate Test History API
 * GET /api/v1/candidate/history
 * Returns all finalized (COMPLETED / TERMINATED) exam sessions for the logged-in candidate.
 * Includes assessment metadata, score, accuracy, integrity, and violation count.
 */

import { NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth.middleware';
import { successResponse, errorResponse } from '@/lib/utils/response';
import prisma from '@/lib/prisma/client';
import { logger } from '@/lib/logger/logger';

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate candidate
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    // 2. Fetch all finalized exam sessions with related data
    const sessions = await prisma.examSession.findMany({
      where: {
        userId: user.id,
        status: { in: ['COMPLETED', 'TERMINATED'] },
      },
      include: {
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
        submissions: {
          select: {
            id: true,
            status: true,
            score: true,
            questionId: true,
          },
        },
        violations: {
          select: { id: true, type: true, severity: true },
        },
      },
      orderBy: {
        endedAt: 'desc',
      },
    });

    // 3. Compute per-session scorecard metrics
    const history = sessions.map((session) => {
      // Score: sum of all accepted submission scores (each is +4 for MCQ/CODING)
      const finalScore = session.submissions.reduce((sum, sub) => {
        if (sub.status === 'ACCEPTED') {
          return sum + (sub.score ?? 4);
        }
        return sum;
      }, 0);

      // Accuracy: percentage of unique questions answered correctly
      const uniqueQuestionIds = [...new Set(session.submissions.map((s) => s.questionId))];
      const correctCount = uniqueQuestionIds.filter((qid) =>
        session.submissions.some((s) => s.questionId === qid && s.status === 'ACCEPTED')
      ).length;
      const accuracy =
        uniqueQuestionIds.length > 0
          ? Math.round((correctCount / uniqueQuestionIds.length) * 100)
          : 0;

      return {
        sessionId: session.id,
        assessmentId: session.assessment.id,
        assessmentTitle: session.assessment.title,
        assessmentType: session.assessment.type,
        difficulty: session.assessment.difficulty,
        duration: session.assessment.duration,
        totalMarks: session.assessment.totalMarks,
        passingMarks: session.assessment.passingMarks,
        status: session.status,
        finalScore,
        accuracy,
        integrityScore: session.integrityScore,
        violations: session.violations.length,
        startedAt: session.startedAt,
        endedAt: session.endedAt,
        isPassed: finalScore >= session.assessment.passingMarks,
      };
    });

    return successResponse(history);
  } catch (err) {
    logger.error('Error fetching candidate history:', err);
    return errorResponse(err as Error, 500);
  }
}

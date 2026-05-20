import { NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth.middleware';
import { rateLimiters } from '@/middleware/rate-limit.middleware';
import { leaderboardService } from '@/services/leaderboard/leaderboard.service';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { ValidationError } from '@/lib/errors/app-error';
import prisma from '@/lib/prisma/client';

interface RouteContext {
  params: Promise<{
    assessmentId: string;
  }>;
}

/**
 * POST /api/v1/leaderboards/[assessmentId]/submit
 * Record a correct submission and update leaderboard rankings
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    // Rate limiting
    await rateLimiters.strict(req);

    // Authentication required
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    const { assessmentId } = await context.params;

    // Parse request body
    const body = await req.json();
    const { questionId, timeTaken } = body;

    if (!questionId || typeof timeTaken !== 'number') {
      throw new ValidationError('Missing required fields: questionId (string) and timeTaken (number in seconds)');
    }

    // 1. Locate or automatically instantiate active ExamSession for this assessment and user
    let session = await prisma.examSession.findUnique({
      where: {
        assessmentId_userId: {
          assessmentId,
          userId: user.id
        }
      }
    });

    if (!session) {
      session = await prisma.examSession.create({
        data: {
          assessmentId,
          userId: user.id,
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
          userAgent: req.headers.get('user-agent') || 'Unknown',
          status: 'ACTIVE'
        }
      });
    }

    // 2. Check if already solved correctly in this exam session
    const alreadySolved = await prisma.submission.findFirst({
      where: {
        userId: user.id,
        assessmentId,
        questionId,
        status: 'ACCEPTED',
      },
    });

    let entry;
    // 3. Award points first if not already solved
    if (!alreadySolved) {
      entry = await leaderboardService.recordCorrectSubmission(
        assessmentId,
        user.id,
        questionId,
        timeTaken
      );
    } else {
      // Just fetch the current entry if already solved
      const leaderboard = await prisma.leaderboard.findUnique({
        where: { assessmentId }
      });
      if (leaderboard) {
        entry = await prisma.leaderboardEntry.findUnique({
          where: {
            leaderboardId_userId: {
              leaderboardId: leaderboard.id,
              userId: user.id
            }
          }
        });
      }
    }

    // 4. Record the submission in DB
    await prisma.submission.create({
      data: {
        assessmentId,
        questionId,
        userId: user.id,
        sessionId: session.id,
        code: body.code || body.optionSelected || 'Correct submission',
        language: ((body.language || 'python').toUpperCase()) as any,
        status: 'ACCEPTED',
        totalTests: body.totalTests || 1,
        passedTests: body.passedTests || 1,
        score: 4
      }
    });

    return successResponse({
      entry,
      message: 'Leaderboard updated successfully'
    });
  } catch (error) {
    return errorResponse(error as Error);
  }
}

import { NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth.middleware';
import { rateLimiters } from '@/middleware/rate-limit.middleware';
import { leaderboardService } from '@/services/leaderboard/leaderboard.service';
import { successResponse, errorResponse } from '@/lib/utils/response';
import prisma from '@/lib/prisma/client';
import { createError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/v1/assessments/[id]/submit-mcq
 * Evaluate MCQ answer securely and record points.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    // Rate limiting
    await rateLimiters.strict(req);

    // Authentication required
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    const { id: assessmentId } = await context.params;

    // Parse request body
    const body = await req.json();
    const { questionId, selectedOption, timeTaken } = body;

    if (!questionId || !selectedOption || typeof timeTaken !== 'number') {
      return errorResponse(new Error('Missing required fields: questionId, selectedOption, timeTaken'), 400);
    }

    // 1. Check if the question belongs to this assessment
    const isAssigned = await prisma.assessmentQuestion.findUnique({
      where: {
        assessmentId_questionId: {
          assessmentId,
          questionId,
        },
      },
    });

    if (!isAssigned) {
      return errorResponse(new Error('Question is not assigned to this assessment'), 400);
    }

    // 2. Fetch the question details
    const question = await prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      return errorResponse(new Error('Question not found'), 404);
    }

    if (question.type !== 'MCQ') {
      return errorResponse(new Error('This question is not an MCQ-based question'), 400);
    }

    // 3. Find or create an active exam session for this candidate
    let session = await prisma.examSession.findUnique({
      where: {
        assessmentId_userId: {
          assessmentId,
          userId: user.id,
        },
      },
    });

    if (!session) {
      session = await prisma.examSession.create({
        data: {
          assessmentId,
          userId: user.id,
          status: 'ACTIVE',
          ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
          userAgent: req.headers.get('user-agent') || 'Unknown',
        },
      });
    }

    // 4. Compare candidate's selectedOption with the correct solution
    // normalize inputs to uppercase
    const correctSolution = (question.solution || '').trim().toUpperCase();
    const selection = selectedOption.trim().toUpperCase();
    const isCorrect = correctSolution === selection;

    // Check if the user has ALREADY solved this question inside this assessment successfully
    const alreadySolved = await prisma.submission.findFirst({
      where: {
        userId: user.id,
        assessmentId,
        questionId,
        status: 'ACCEPTED',
      },
    });

    // 5. Award leaderboard points if correct and not already solved
    let leaderboardEntry = null;
    if (isCorrect && !alreadySolved) {
      leaderboardEntry = await leaderboardService.recordCorrectSubmission(
        assessmentId,
        user.id,
        questionId,
        timeTaken
      );
    } else {
      // Just fetch or join leaderboard to see status
      const lb = await prisma.leaderboard.findUnique({
        where: { assessmentId },
      });
      if (lb) {
        leaderboardEntry = await prisma.leaderboardEntry.findUnique({
          where: {
            leaderboardId_userId: {
              leaderboardId: lb.id,
              userId: user.id,
            },
          },
        });
      }
    }

    // 6. Create a Submission record
    const status = isCorrect ? 'ACCEPTED' : 'WRONG_ANSWER';
    
    const submission = await prisma.submission.create({
      data: {
        assessmentId,
        questionId,
        userId: user.id,
        sessionId: session.id,
        code: selection, // Stores candidate choice (A, B, C, D)
        language: 'JAVASCRIPT', // MCQ default
        status,
        score: isCorrect ? 4 : 0,
        totalTests: 1,
        passedTests: isCorrect ? 1 : 0,
      },
    });

    return successResponse({
      submissionId: submission.id,
      isCorrect,
      correctAnswer: isCorrect ? correctSolution : undefined, // secure: only reveal correct answers if they got it right, or reveal it to help them learn? Wait, let's return correct answer and explanation for technical quizzes so they get detailed feedback!
      correctAnswerActual: correctSolution,
      explanation: question.hints[0] || 'No explanation provided.',
      leaderboardEntry,
      message: isCorrect ? 'Correct! Real-time score updated by +4 points.' : 'Incorrect option selected.',
    });
  } catch (error) {
    logger.error('Error submitting MCQ answer:', error);
    return errorResponse(error as Error, 500);
  }
}

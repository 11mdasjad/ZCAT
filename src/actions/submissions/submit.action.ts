/**
 * Submit Code Server Action
 * Handles code submission and queues for execution
 */

'use server';

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import prisma from '@/lib/prisma/client';
import { addExecutionJob } from '@/lib/queue/client';
import { createSubmissionSchema } from '@/validators/submission.validator';
import { UnauthorizedError, ValidationError, NotFoundError } from '@/lib/errors/app-error';
import { z } from 'zod';

export async function submitCodeAction(formData: FormData) {
  try {
    // Get current user
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new UnauthorizedError('You must be logged in to submit code');
    }

    // Parse form data
    const data = {
      assessmentId: formData.get('assessmentId') as string,
      questionId: formData.get('questionId') as string,
      sessionId: formData.get('sessionId') as string,
      code: formData.get('code') as string,
      language: formData.get('language') as string,
    };

    // Validate input
    const validatedData = await createSubmissionSchema.parseAsync(data);

    // Check if session exists and is active
    const session = await prisma.examSession.findUnique({
      where: { id: validatedData.sessionId },
      include: {
        assessment: true,
      },
    });

    if (!session) {
      throw new NotFoundError('Exam session');
    }

    if (session.userId !== user.id) {
      throw new UnauthorizedError('This is not your session');
    }

    if (session.status !== 'ACTIVE') {
      throw new ValidationError('Session is not active');
    }

    // Check if assessment is still live
    const now = new Date();
    if (
      session.assessment.endTime &&
      now > session.assessment.endTime
    ) {
      throw new ValidationError('Assessment has ended');
    }

    if (session.assessmentId !== validatedData.assessmentId) {
      throw new ValidationError('Submission does not match the active session assessment');
    }

    const assessmentQuestion = await prisma.assessmentQuestion.findUnique({
      where: {
        assessmentId_questionId: {
          assessmentId: validatedData.assessmentId,
          questionId: validatedData.questionId,
        },
      },
      include: {
        question: {
          select: {
            timeLimit: true,
            memoryLimit: true,
          },
        },
      },
    });

    if (!assessmentQuestion) {
      throw new UnauthorizedError('Question is not part of this assessment');
    }

    // Get test cases
    const testCases = await prisma.testCase.findMany({
      where: { questionId: validatedData.questionId },
      select: {
        id: true,
        input: true,
        expectedOutput: true,
        isHidden: true,
      },
    });

    if (testCases.length === 0) {
      throw new ValidationError('No test cases found for this question');
    }

    // Create submission record
    const submission = await prisma.submission.create({
      data: {
        assessmentId: validatedData.assessmentId,
        questionId: validatedData.questionId,
        userId: user.id,
        sessionId: validatedData.sessionId,
        code: validatedData.code,
        language: validatedData.language,
        status: 'PENDING',
        totalTests: testCases.length,
      },
    });

    // Queue execution job
    const queued = await addExecutionJob({
      submissionId: submission.id,
      code: validatedData.code,
      language: validatedData.language,
      testCases: testCases.map((tc) => ({
        id: tc.id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
      })),
      timeLimit: Math.ceil((assessmentQuestion.question.timeLimit ?? 10000) / 1000),
      memoryLimit: assessmentQuestion.question.memoryLimit ?? 512,
    });

    if (!queued) {
      await prisma.submission.update({
        where: { id: submission.id },
        data: { status: 'INTERNAL_ERROR' },
      });
      throw new ValidationError('Submission could not be queued for execution');
    }

    // Revalidate paths
    revalidatePath(`/code/${validatedData.questionId}`);
    revalidatePath('/candidate/history');

    return {
      success: true,
      data: {
        submissionId: submission.id,
        status: submission.status,
      },
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid submission data',
          details: error.errors,
        },
      };
    }

    if (error instanceof UnauthorizedError || error instanceof ValidationError) {
      return {
        success: false,
        error: {
          code: error.code,
          message: error.message,
        },
      };
    }

    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to submit code',
      },
    };
  }
}

/**
 * Get submission status
 */
export async function getSubmissionStatusAction(submissionId: string) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new UnauthorizedError();
    }

    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        testResults: true,
      },
    });

    if (!submission) {
      throw new NotFoundError('Submission');
    }

    if (submission.userId !== user.id) {
      throw new UnauthorizedError('This is not your submission');
    }

    return {
      success: true,
      data: submission,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Failed to get submission status',
      },
    };
  }
}

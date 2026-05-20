import { NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth.middleware';
import { successResponse, errorResponse } from '@/lib/utils/response';
import prisma from '@/lib/prisma/client';
import { createError } from '@/lib/errors/app-error';
import { logger } from '@/lib/logger/logger';
import { rateLimiters } from '@/middleware/rate-limit.middleware';
import { assessmentService } from '@/services/assessments/assessment.service';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * GET /api/v1/assessments/[id]
 * Fetch a single assessment with its questions securely.
 */
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    const { id } = await context.params;

    // Fetch assessment with related questions and test cases
    const assessment = await prisma.assessment.findUnique({
      where: { id, deletedAt: null },
      include: {
        questions: {
          include: {
            question: {
              include: {
                testCases: true,
              },
            },
          },
          orderBy: {
            order: 'asc',
          },
        },
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!assessment) {
      return errorResponse(createError.notFound('Assessment not found'), 404);
    }

    const isRecruiterOrAdmin = 
      user.role === 'ADMIN' || 
      user.role === 'SUPER_ADMIN' || 
      user.role === 'RECRUITER' ||
      assessment.createdById === user.id;

    // Map questions and selectively hide sensitive fields for candidates
    const mappedQuestions = assessment.questions.map((aq) => {
      const q = aq.question;
      
      if (isRecruiterOrAdmin) {
        // Recruiter / Admin gets full access
        return {
          id: q.id,
          title: q.title,
          slug: q.slug,
          description: q.description,
          type: q.type,
          difficulty: q.difficulty,
          tags: q.tags,
          timeLimit: q.timeLimit,
          memoryLimit: q.memoryLimit,
          constraints: q.constraints,
          examples: q.examples,
          hints: q.hints,
          solution: q.solution,
          testCases: q.testCases,
          marks: aq.marks,
          order: aq.order,
        };
      } else {
        // Candidate is attempting the exam - strip sensitive items
        if (q.type === 'MCQ') {
          return {
            id: q.id,
            title: q.title,
            slug: q.slug,
            description: q.description,
            type: q.type,
            difficulty: q.difficulty,
            tags: q.tags,
            options: q.examples, // examples stores MCQ options A, B, C, D
            // Strip correct answer (solution) and detailed explanation (hints)
            marks: aq.marks,
            order: aq.order,
          };
        } else {
          // CODING question
          return {
            id: q.id,
            title: q.title,
            slug: q.slug,
            description: q.description,
            type: q.type,
            difficulty: q.difficulty,
            tags: q.tags,
            timeLimit: q.timeLimit,
            memoryLimit: q.memoryLimit,
            constraints: q.constraints,
            examples: q.examples,
            // Strip all hidden test cases, return only sample test cases
            testCases: q.testCases
              .filter((tc) => tc.isSample)
              .map((tc) => ({
                id: tc.id,
                input: tc.input,
                expectedOutput: tc.expectedOutput,
                isSample: true,
                explanation: tc.explanation,
              })),
            marks: aq.marks,
            order: aq.order,
          };
        }
      }
    });

    const secureAssessment = {
      id: assessment.id,
      title: assessment.title,
      description: assessment.description,
      type: assessment.type,
      status: assessment.status,
      difficulty: assessment.difficulty,
      duration: assessment.duration,
      totalMarks: assessment.totalMarks,
      passingMarks: assessment.passingMarks,
      instructions: assessment.instructions,
      tags: assessment.tags,
      isPublic: assessment.isPublic,
      allowedLanguages: assessment.allowedLanguages,
      createdAt: assessment.createdAt,
      createdBy: assessment.createdBy,
      questions: mappedQuestions,
    };

    return successResponse(secureAssessment);
  } catch (error) {
    logger.error('Error fetching single assessment:', error);
    return errorResponse(error as Error, 500);
  }
}

/**
 * DELETE /api/v1/assessments/[id]
 * Soft delete an assessment securely.
 */
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    // Rate limiting
    await rateLimiters.strict(req);

    // Authentication required
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    const { id } = await context.params;

    const deleted = await assessmentService.delete(id, user.id, user.role);

    return successResponse({
      id: deleted.id,
      message: 'Assessment deleted successfully',
    });
  } catch (error) {
    logger.error('Error deleting assessment:', error);
    return errorResponse(error as Error, 500);
  }
}

/**
 * Assessment Repository
 * Data access layer for assessments
 */

import { Prisma, Assessment, AssessmentStatus, AssessmentType } from '@prisma/client';
import { BaseRepository } from './base.repository';
import prisma from '@/lib/prisma/client';

export interface AssessmentFilters {
  type?: AssessmentType;
  status?: AssessmentStatus;
  createdById?: string;
  tags?: string[];
  search?: string;
  isPublic?: boolean;
}

export interface AssessmentWithRelations extends Assessment {
  createdBy?: any;
  questions?: any[];
  _count?: {
    sessions: number;
    submissions: number;
  };
}

export class AssessmentRepository extends BaseRepository<
  Assessment,
  Prisma.AssessmentCreateInput,
  Prisma.AssessmentUpdateInput
> {
  protected modelName = Prisma.ModelName.Assessment;

  /**
   * Find assessments with filters
   */
  async findWithFilters(
    filters: AssessmentFilters,
    page: number,
    limit: number,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc'
  ) {
    const where: Prisma.AssessmentWhereInput = {
      deletedAt: null,
    };

    if (filters.type) {
      where.type = filters.type;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    if (filters.createdById) {
      where.createdById = filters.createdById;
    }

    if (filters.isPublic !== undefined) {
      where.isPublic = filters.isPublic;
    }

    if (filters.tags && filters.tags.length > 0) {
      where.tags = {
        hasSome: filters.tags,
      };
    }

    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    return this.findPaginated(
      { page, limit },
      where,
      {
        createdBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            sessions: true,
            submissions: true,
          },
        },
      },
      { [sortBy]: sortOrder }
    );
  }

  /**
   * Find assessment with full details
   */
  async findByIdWithDetails(id: string): Promise<AssessmentWithRelations | null> {
    return this.findById(id, {
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
      questions: {
        include: {
          question: {
            include: {
              testCases: {
                where: { isHidden: false },
              },
            },
          },
        },
        orderBy: { order: 'asc' },
      },
      analytics: true,
      _count: {
        select: {
          sessions: true,
          submissions: true,
        },
      },
    });
  }

  /**
   * Find live assessments
   */
  async findLiveAssessments() {
    const now = new Date();
    
    return this.findAll(
      {
        status: AssessmentStatus.LIVE,
        startTime: { lte: now },
        endTime: { gte: now },
        deletedAt: null,
      },
      {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      }
    );
  }

  /**
   * Find upcoming assessments for a user
   */
  async findUpcomingForUser(userId: string, limit: number = 10) {
    const now = new Date();
    
    return prisma.assessment.findMany({
      where: {
        status: AssessmentStatus.SCHEDULED,
        startTime: { gte: now },
        deletedAt: null,
        OR: [
          { isPublic: true },
          {
            invitations: {
              some: {
                email: {
                  in: await this.getUserEmails(userId),
                },
              },
            },
          },
        ],
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: { startTime: 'asc' },
      take: limit,
    });
  }

  /**
   * Find assessments by creator
   */
  async findByCreator(creatorId: string, page: number, limit: number) {
    return this.findPaginated(
      { page, limit },
      {
        createdById: creatorId,
        deletedAt: null,
      },
      {
        _count: {
          select: {
            sessions: true,
            submissions: true,
          },
        },
      },
      { createdAt: 'desc' }
    );
  }

  /**
   * Update assessment status
   */
  async updateStatus(id: string, status: AssessmentStatus) {
    return this.update(id, { status });
  }

  /**
   * Publish assessment
   */
  async publish(id: string, startTime: Date, endTime: Date) {
    return this.update(id, {
      status: AssessmentStatus.SCHEDULED,
      startTime,
      endTime,
    });
  }

  /**
   * Archive assessment
   */
  async archive(id: string) {
    return this.update(id, {
      status: AssessmentStatus.ARCHIVED,
    });
  }

  /**
   * Add questions to assessment
   */
  async addQuestions(
    assessmentId: string,
    questions: Array<{ questionId: string; order: number; marks: number }>
  ) {
    return prisma.assessmentQuestion.createMany({
      data: questions.map((q) => ({
        assessmentId,
        ...q,
      })),
      skipDuplicates: true,
    });
  }

  /**
   * Remove question from assessment
   */
  async removeQuestion(assessmentId: string, questionId: string) {
    return prisma.assessmentQuestion.deleteMany({
      where: {
        assessmentId,
        questionId,
      },
    });
  }

  /**
   * Get assessment statistics
   */
  async getStatistics(assessmentId: string) {
    const [assessment, sessionStats, submissionStats] = await Promise.all([
      this.findById(assessmentId),
      prisma.examSession.groupBy({
        by: ['status'],
        where: { assessmentId },
        _count: true,
      }),
      prisma.submission.aggregate({
        where: { assessmentId },
        _count: true,
        _avg: { score: true },
        _max: { score: true },
        _min: { score: true },
      }),
    ]);

    return {
      assessment,
      sessions: sessionStats,
      submissions: submissionStats,
    };
  }

  /**
   * Helper: Get user emails
   */
  private async getUserEmails(userId: string): Promise<string[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true },
    });
    
    return user ? [user.email] : [];
  }

  /**
   * Check if user has access to assessment
   */
  async hasAccess(assessmentId: string, userId: string): Promise<boolean> {
    const assessment = await this.findById(assessmentId);
    
    if (!assessment) {
      return false;
    }

    // Public assessments are accessible to all
    if (assessment.isPublic) {
      return true;
    }

    // Check if user is creator
    if (assessment.createdById === userId) {
      return true;
    }

    // Check if user is invited
    const userEmails = await this.getUserEmails(userId);
    const invitation = await prisma.assessmentInvitation.findFirst({
      where: {
        assessmentId,
        email: { in: userEmails },
        expiresAt: { gte: new Date() },
      },
    });

    return !!invitation;
  }
}

// Export singleton instance
export const assessmentRepository = new AssessmentRepository();

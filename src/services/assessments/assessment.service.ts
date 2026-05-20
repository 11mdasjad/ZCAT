/**
 * Assessment Service
 * Business logic for assessments
 */

import { assessmentRepository, AssessmentFilters } from '@/repositories/assessment.repository';
import { Prisma } from '@prisma/client';

export class AssessmentService {
  /**
   * Find all assessments with filters and pagination
   */
  async findAll(filters: AssessmentFilters, page: number, limit: number) {
    return assessmentRepository.findWithFilters(filters, page, limit);
  }

  /**
   * Create a new assessment
   */
  async create(data: any, userId: string) {
    const createData: Prisma.AssessmentCreateInput = {
      title: data.title,
      description: data.description,
      type: data.type,
      status: data.status || 'LIVE',
      duration: data.duration,
      totalMarks: data.totalMarks,
      passingMarks: data.passingMarks,
      instructions: data.instructions,
      isPublic: data.isPublic || false,
      createdBy: {
        connect: { id: userId }
      }
    };

    if (data.allowedLanguages) {
      createData.allowedLanguages = data.allowedLanguages;
    }

    if (data.tags) {
      createData.tags = data.tags;
    }

    if (data.difficulty) {
      createData.difficulty = data.difficulty;
    }

    const assessment = await assessmentRepository.create(createData);

    if (data.questions && data.questions.length > 0) {
      await assessmentRepository.addQuestions(assessment.id, data.questions);
    }

    return assessment;
  }

  /**
   * Soft delete an assessment
   */
  async delete(id: string, userId: string, userRole: string) {
    const assessment = await assessmentRepository.findById(id);
    if (!assessment) {
      throw new Error('Assessment not found');
    }

    // Creator, recruiters, and admins can delete
    const isOwner = assessment.createdById === userId;
    const isAdminOrRecruiter = userRole === 'ADMIN' || userRole === 'SUPER_ADMIN' || userRole === 'RECRUITER';

    if (!isOwner && !isAdminOrRecruiter) {
      throw new Error('Unauthorized to delete this assessment');
    }

    return assessmentRepository.softDelete(id);
  }
}

export const assessmentService = new AssessmentService();

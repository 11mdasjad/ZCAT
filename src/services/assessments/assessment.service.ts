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

    return assessmentRepository.create(createData);
  }
}

export const assessmentService = new AssessmentService();

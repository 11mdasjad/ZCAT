/**
 * Assessment Validation Schemas
 */

import { z } from 'zod';
import {
  uuidSchema,
  paginationSchema,
  tagsSchema,
  difficultySchema,
  languageCodeSchema,
} from './common.validator';

// Assessment type enum
const assessmentTypeSchema = z.enum(['CODING', 'APTITUDE', 'INTERVIEW', 'MIXED']);

// Assessment status enum
const assessmentStatusSchema = z.enum([
  'DRAFT',
  'SCHEDULED',
  'LIVE',
  'COMPLETED',
  'ARCHIVED',
]);

// Base assessment object schema
export const assessmentBaseSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(2000),
  type: assessmentTypeSchema,
  difficulty: difficultySchema.optional(),
  duration: z.number().int().min(1).max(480), // Max 8 hours
  totalMarks: z.number().int().min(1).max(1000),
  passingMarks: z.number().int().min(0),
  startTime: z.coerce.date().optional(),
  endTime: z.coerce.date().optional(),
  instructions: z.string().max(5000).optional(),
  tags: tagsSchema.optional(),
  isPublic: z.boolean().default(false),
  allowedLanguages: z.array(languageCodeSchema).min(1).optional(),
  questions: z
    .array(
      z.object({
        questionId: uuidSchema,
        order: z.number().int().min(1),
        marks: z.number().int().min(1),
      })
    )
    .min(1)
    .optional(),
});

// Create assessment schema
export const createAssessmentSchema = assessmentBaseSchema.refine(
  (data) => {
    if (data.startTime && data.endTime) {
      return data.endTime > data.startTime;
    }
    return true;
  },
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
).refine(
  (data) => data.passingMarks <= data.totalMarks,
  {
    message: 'Passing marks cannot exceed total marks',
    path: ['passingMarks'],
  }
);

// Update assessment schema
export const updateAssessmentSchema = assessmentBaseSchema.partial();

// Publish assessment schema
export const publishAssessmentSchema = z.object({
  startTime: z.coerce.date(),
  endTime: z.coerce.date(),
}).refine(
  (data) => data.endTime > data.startTime,
  {
    message: 'End time must be after start time',
    path: ['endTime'],
  }
);

// Assessment query schema
export const assessmentQuerySchema = paginationSchema.extend({
  type: assessmentTypeSchema.optional(),
  status: assessmentStatusSchema.optional(),
  difficulty: difficultySchema.optional(),
  search: z.string().max(100).optional(),
  tags: z.string().optional(), // Comma-separated
  createdById: uuidSchema.optional(),
  sortBy: z.enum(['createdAt', 'startTime', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Assessment invitation schema
export const inviteToAssessmentSchema = z.object({
  emails: z.array(z.string().email()).min(1).max(100),
  expiresInDays: z.number().int().min(1).max(30).default(7),
});

// Assessment analytics query schema
export const assessmentAnalyticsSchema = z.object({
  assessmentId: uuidSchema,
  includeQuestionStats: z.boolean().default(false),
  includeTimeDistribution: z.boolean().default(false),
  includeScoreDistribution: z.boolean().default(false),
});

export type CreateAssessmentInput = z.infer<typeof createAssessmentSchema>;
export type UpdateAssessmentInput = z.infer<typeof updateAssessmentSchema>;
export type PublishAssessmentInput = z.infer<typeof publishAssessmentSchema>;
export type AssessmentQuery = z.infer<typeof assessmentQuerySchema>;
export type InviteToAssessmentInput = z.infer<typeof inviteToAssessmentSchema>;
export type AssessmentAnalyticsQuery = z.infer<typeof assessmentAnalyticsSchema>;

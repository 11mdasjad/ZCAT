/**
 * Submission Validation Schemas
 */

import { z } from 'zod';
import { uuidSchema, languageCodeSchema, paginationSchema } from './common.validator';

// Submission status enum
const submissionStatusSchema = z.enum([
  'PENDING',
  'RUNNING',
  'ACCEPTED',
  'WRONG_ANSWER',
  'TIME_LIMIT_EXCEEDED',
  'MEMORY_LIMIT_EXCEEDED',
  'RUNTIME_ERROR',
  'COMPILATION_ERROR',
  'INTERNAL_ERROR',
]);

// Create submission schema
export const createSubmissionSchema = z.object({
  assessmentId: uuidSchema,
  questionId: uuidSchema,
  sessionId: uuidSchema,
  code: z.string().min(1).max(50000), // Max 50KB of code
  language: languageCodeSchema,
});

// Execute code schema
export const executeCodeSchema = z.object({
  code: z.string().min(1).max(50000),
  language: languageCodeSchema,
  input: z.string().max(10000).optional(), // Custom input for testing
  timeLimit: z.number().int().min(1).max(30).default(10), // seconds
  memoryLimit: z.number().int().min(64).max(1024).default(512), // MB
});

// Submission query schema
export const submissionQuerySchema = paginationSchema.extend({
  assessmentId: uuidSchema.optional(),
  questionId: uuidSchema.optional(),
  userId: uuidSchema.optional(),
  status: submissionStatusSchema.optional(),
  language: languageCodeSchema.optional(),
  sortBy: z.enum(['submittedAt', 'score', 'executionTime']).default('submittedAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Batch submission evaluation schema
export const batchEvaluateSchema = z.object({
  submissionIds: z.array(uuidSchema).min(1).max(50),
});

export type CreateSubmissionInput = z.infer<typeof createSubmissionSchema>;
export type ExecuteCodeInput = z.infer<typeof executeCodeSchema>;
export type SubmissionQuery = z.infer<typeof submissionQuerySchema>;
export type BatchEvaluateInput = z.infer<typeof batchEvaluateSchema>;

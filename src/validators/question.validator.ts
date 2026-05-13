import { z } from 'zod';
import { Difficulty } from '@prisma/client';

/**
 * Query parameters for listing questions
 */
export const questionListQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  difficulty: z.nativeEnum(Difficulty).optional(),
  tags: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',').map((t) => t.trim()) : undefined)),
  search: z.string().optional(),
});

export type QuestionListQuery = z.infer<typeof questionListQuerySchema>;

/**
 * Question ID parameter
 */
export const questionIdParamSchema = z.object({
  id: z.string().uuid('Invalid question ID'),
});

export type QuestionIdParam = z.infer<typeof questionIdParamSchema>;

/**
 * Question slug parameter
 */
export const questionSlugParamSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
});

export type QuestionSlugParam = z.infer<typeof questionSlugParamSchema>;

/**
 * Random question query
 */
export const randomQuestionQuerySchema = z.object({
  difficulty: z.nativeEnum(Difficulty).optional(),
});

export type RandomQuestionQuery = z.infer<typeof randomQuestionQuerySchema>;

/**
 * Questions by tags query
 */
export const questionsByTagsQuerySchema = z.object({
  tags: z
    .string()
    .min(1, 'At least one tag is required')
    .transform((val) => val.split(',').map((t) => t.trim())),
  limit: z.coerce.number().int().positive().max(50).default(10),
});

export type QuestionsByTagsQuery = z.infer<typeof questionsByTagsQuerySchema>;

/**
 * Update question status (admin)
 */
export const updateQuestionStatusSchema = z.object({
  isActive: z.boolean(),
});

export type UpdateQuestionStatus = z.infer<typeof updateQuestionStatusSchema>;

/**
 * Create question (admin)
 */
export const createQuestionSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(200)
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  difficulty: z.nativeEnum(Difficulty),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  examples: z.array(z.string()).default([]),
  constraints: z.array(z.string()).default([]),
  tags: z.array(z.string()).min(1, 'At least one tag is required'),
  timeLimit: z.number().int().positive().default(2000),
  memoryLimit: z.number().int().positive().default(256),
  starterCode: z
    .object({
      python: z.string().optional(),
      javascript: z.string().optional(),
      java: z.string().optional(),
      cpp: z.string().optional(),
      c: z.string().optional(),
    })
    .optional(),
});

export type CreateQuestion = z.infer<typeof createQuestionSchema>;

/**
 * Update question (admin)
 */
export const updateQuestionSchema = createQuestionSchema.partial();

export type UpdateQuestion = z.infer<typeof updateQuestionSchema>;

/**
 * Create test case (admin)
 */
export const createTestCaseSchema = z.object({
  questionId: z.string().uuid('Invalid question ID'),
  input: z.string().min(1, 'Input is required'),
  expectedOutput: z.string().min(1, 'Expected output is required'),
  isHidden: z.boolean().default(false),
  explanation: z.string().optional(),
  orderIndex: z.number().int().nonnegative().default(0),
});

export type CreateTestCase = z.infer<typeof createTestCaseSchema>;

/**
 * Update test case (admin)
 */
export const updateTestCaseSchema = createTestCaseSchema
  .omit({ questionId: true })
  .partial();

export type UpdateTestCase = z.infer<typeof updateTestCaseSchema>;

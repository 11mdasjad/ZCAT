/**
 * Common Validation Schemas
 * Reusable Zod schemas for common patterns
 */

import { z } from 'zod';

// UUID validation
export const uuidSchema = z.string().uuid('Invalid UUID format');

// Email validation
export const emailSchema = z.string().email('Invalid email format');

// Password validation
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(100, 'Password must not exceed 100 characters')
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
    'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  );

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
});

// Sort schema
export const sortSchema = z.object({
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Date range schema
export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// Search schema
export const searchSchema = z.object({
  query: z.string().min(1).max(100).optional(),
});

// ID param schema
export const idParamSchema = z.object({
  id: uuidSchema,
});

// Bulk IDs schema
export const bulkIdsSchema = z.object({
  ids: z.array(uuidSchema).min(1).max(100),
});

// File upload schema
export const fileUploadSchema = z.object({
  filename: z.string().min(1).max(255),
  mimetype: z.string(),
  size: z.number().max(10 * 1024 * 1024), // 10MB max
});

// URL schema
export const urlSchema = z.string().url('Invalid URL format');

// Phone number schema (international format)
export const phoneSchema = z
  .string()
  .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number format');

// Tags schema
export const tagsSchema = z.array(z.string().min(1).max(50)).max(10);

// Metadata schema
export const metadataSchema = z.record(z.any()).optional();

// Status schema
export const statusSchema = z.enum(['active', 'inactive', 'pending', 'archived']);

// Language code schema
export const languageCodeSchema = z.enum([
  'PYTHON',
  'JAVASCRIPT',
  'JAVA',
  'CPP',
  'C',
  'GO',
  'RUST',
]);

// Difficulty schema
export const difficultySchema = z.enum(['EASY', 'MEDIUM', 'HARD']);

// Role schema
export const roleSchema = z.enum(['SUPER_ADMIN', 'ADMIN', 'RECRUITER', 'CANDIDATE']);

/**
 * Validation helper functions
 */

// Validate and parse request body
export async function validateBody<T>(
  schema: z.ZodSchema<T>,
  body: unknown
): Promise<T> {
  return schema.parseAsync(body);
}

// Validate and parse query parameters
export function validateQuery<T>(
  schema: z.ZodSchema<T>,
  query: unknown
): T {
  return schema.parse(query);
}

// Validate and parse path parameters
export function validateParams<T>(
  schema: z.ZodSchema<T>,
  params: unknown
): T {
  return schema.parse(params);
}

// Safe parse with error formatting
export function safeParse<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  }
  
  const errors = result.error.errors.map(
    (err) => `${err.path.join('.')}: ${err.message}`
  );
  
  return { success: false, errors };
}

// Transform Zod errors to user-friendly format
export function formatZodErrors(error: z.ZodError): Record<string, string[]> {
  const formatted: Record<string, string[]> = {};
  
  error.errors.forEach((err) => {
    const path = err.path.join('.');
    if (!formatted[path]) {
      formatted[path] = [];
    }
    formatted[path].push(err.message);
  });
  
  return formatted;
}

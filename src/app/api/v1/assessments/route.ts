/**
 * Assessments API Route
 * GET /api/v1/assessments - List assessments
 * POST /api/v1/assessments - Create assessment
 */

import { NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth.middleware';
import { requireRecruiterOrAdmin } from '@/middleware/rbac.middleware';
import { rateLimiters } from '@/middleware/rate-limit.middleware';
import { assessmentService } from '@/services/assessments/assessment.service';
import {
  successResponse,
  errorResponse,
  paginatedResponse,
  createdResponse,
  parsePagination,
  parseQuery,
} from '@/lib/utils/response';
import {
  createAssessmentSchema,
  assessmentQuerySchema,
} from '@/validators/assessment.validator';
import { ValidationError } from '@/lib/errors/app-error';
import { z } from 'zod';

/**
 * GET /api/v1/assessments
 * List all assessments with filters
 */
export async function GET(req: NextRequest) {
  try {
    // Rate limiting
    await rateLimiters.standard(req);

    // Optional authentication
    const { user } = await authMiddleware(req);

    // Parse query parameters
    const query = parseQuery(req.url);
    const { page, limit } = parsePagination(req.url);

    // Validate query
    const validatedQuery = assessmentQuerySchema.parse({
      ...query,
      page,
      limit,
    });

    // Build filters
    const filters = {
      type: validatedQuery.type,
      status: validatedQuery.status,
      difficulty: validatedQuery.difficulty,
      search: validatedQuery.search,
      tags: validatedQuery.tags?.split(','),
      createdById: validatedQuery.createdById,
    };

    // Fetch assessments
    const result = await assessmentService.findAll(
      filters,
      validatedQuery.page,
      validatedQuery.limit
    );

    return paginatedResponse(
      result.data,
      result.meta.page,
      result.meta.limit,
      result.meta.total
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(
        new ValidationError('Invalid query parameters', error.errors)
      );
    }
    return errorResponse(error as Error);
  }
}

/**
 * POST /api/v1/assessments
 * Create new assessment
 */
export async function POST(req: NextRequest) {
  try {
    // Rate limiting
    await rateLimiters.strict(req);

    // Authentication required
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    // Authorization - only recruiters and admins
    const authError = requireRecruiterOrAdmin(user);
    if (authError) return authError;

    // Parse and validate body
    const body = await req.json();
    const validatedData = await createAssessmentSchema.parseAsync(body);

    // Create assessment
    const assessment = await assessmentService.create(
      validatedData,
      user.id
    );

    return createdResponse(assessment);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return errorResponse(
        new ValidationError('Invalid request body', error.errors)
      );
    }
    return errorResponse(error as Error);
  }
}

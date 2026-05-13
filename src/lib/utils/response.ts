/**
 * Standardized API Response Utilities
 * Consistent response format across all endpoints
 */

import { NextResponse } from 'next/server';
import { AppError } from '../errors/app-error';
import { logger } from '../logger/logger';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  timestamp: string;
}

/**
 * Success response
 */
export function successResponse<T>(
  data: T,
  status = 200,
  meta?: ApiResponse['meta']
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      meta,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

/**
 * Error response
 */
export function errorResponse(
  error: AppError | Error,
  status?: number
): NextResponse<ApiResponse> {
  const isAppError = error instanceof AppError;
  
  const statusCode = status || (isAppError ? error.statusCode : 500);
  const errorCode = isAppError ? error.code : 'INTERNAL_SERVER_ERROR';
  const message = error.message || 'An unexpected error occurred';
  const details = isAppError ? error.details : undefined;

  // Log error
  if (!isAppError || !error.isOperational) {
    logger.error('Unhandled error:', {
      message: error.message,
      stack: error.stack,
      details,
    });
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: errorCode,
        message,
        details,
      },
      timestamp: new Date().toISOString(),
    },
    { status: statusCode }
  );
}

/**
 * Paginated response
 */
export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse<ApiResponse<T[]>> {
  const totalPages = Math.ceil(total / limit);

  return successResponse(data, 200, {
    page,
    limit,
    total,
    totalPages,
  });
}

/**
 * Created response (201)
 */
export function createdResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return successResponse(data, 201);
}

/**
 * No content response (204)
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 });
}

/**
 * Accepted response (202) - for async operations
 */
export function acceptedResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return successResponse(data, 202);
}

/**
 * Handle async route with error catching
 */
export function asyncHandler(
  handler: (req: Request, context?: any) => Promise<NextResponse>
) {
  return async (req: Request, context?: any) => {
    try {
      return await handler(req, context);
    } catch (error) {
      return errorResponse(error as Error);
    }
  };
}

/**
 * Parse request body with validation
 */
export async function parseBody<T>(req: Request): Promise<T> {
  try {
    return await req.json();
  } catch (error) {
    throw new Error('Invalid JSON body');
  }
}

/**
 * Parse query parameters
 */
export function parseQuery(url: string): Record<string, string> {
  const { searchParams } = new URL(url);
  const params: Record<string, string> = {};
  
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
}

/**
 * Parse pagination parameters
 */
export function parsePagination(url: string): { page: number; limit: number } {
  const params = parseQuery(url);
  
  const page = Math.max(1, parseInt(params.page || '1', 10));
  const limit = Math.min(100, Math.max(1, parseInt(params.limit || '10', 10)));
  
  return { page, limit };
}

/**
 * Calculate pagination offset
 */
export function getPaginationOffset(page: number, limit: number): number {
  return (page - 1) * limit;
}

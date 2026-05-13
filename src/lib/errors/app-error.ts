/**
 * Custom Application Errors
 * Centralized error handling with proper HTTP status codes
 */

export enum ErrorCode {
  // Authentication & Authorization
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Validation
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  
  // Resources
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  
  // Business Logic
  ASSESSMENT_NOT_STARTED = 'ASSESSMENT_NOT_STARTED',
  ASSESSMENT_ENDED = 'ASSESSMENT_ENDED',
  SUBMISSION_LIMIT_EXCEEDED = 'SUBMISSION_LIMIT_EXCEEDED',
  TIME_LIMIT_EXCEEDED = 'TIME_LIMIT_EXCEEDED',
  INVALID_ASSESSMENT_STATUS = 'INVALID_ASSESSMENT_STATUS',
  
  // Code Execution
  COMPILATION_ERROR = 'COMPILATION_ERROR',
  RUNTIME_ERROR = 'RUNTIME_ERROR',
  EXECUTION_TIMEOUT = 'EXECUTION_TIMEOUT',
  MEMORY_LIMIT_EXCEEDED = 'MEMORY_LIMIT_EXCEEDED',
  UNSUPPORTED_LANGUAGE = 'UNSUPPORTED_LANGUAGE',
  
  // Rate Limiting
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  TOO_MANY_REQUESTS = 'TOO_MANY_REQUESTS',
  
  // Server Errors
  INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR',
  
  // File Operations
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  UPLOAD_FAILED = 'UPLOAD_FAILED',
}

export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: ErrorCode;
  public readonly isOperational: boolean;
  public readonly details?: any;

  constructor(
    message: string,
    statusCode: number,
    code: ErrorCode,
    isOperational = true,
    details?: any
  ) {
    super(message);
    
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Specific error classes
export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access', details?: any) {
    super(message, 401, ErrorCode.UNAUTHORIZED, true, details);
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden', details?: any) {
    super(message, 403, ErrorCode.FORBIDDEN, true, details);
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string, details?: any) {
    super(`${resource} not found`, 404, ErrorCode.NOT_FOUND, true, details);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 400, ErrorCode.VALIDATION_ERROR, true, details);
  }
}

export class ConflictError extends AppError {
  constructor(message: string, details?: any) {
    super(message, 409, ErrorCode.CONFLICT, true, details);
  }
}

export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded', details?: any) {
    super(message, 429, ErrorCode.RATE_LIMIT_EXCEEDED, true, details);
  }
}

export class InternalServerError extends AppError {
  constructor(message = 'Internal server error', details?: any) {
    super(message, 500, ErrorCode.INTERNAL_SERVER_ERROR, false, details);
  }
}

export class DatabaseError extends AppError {
  constructor(message = 'Database operation failed', details?: any) {
    super(message, 500, ErrorCode.DATABASE_ERROR, false, details);
  }
}

export class ExecutionError extends AppError {
  constructor(message: string, code: ErrorCode, details?: any) {
    super(message, 400, code, true, details);
  }
}

// Error factory
export const createError = {
  unauthorized: (message?: string, details?: any) => 
    new UnauthorizedError(message, details),
  
  forbidden: (message?: string, details?: any) => 
    new ForbiddenError(message, details),
  
  notFound: (resource: string, details?: any) => 
    new NotFoundError(resource, details),
  
  validation: (message: string, details?: any) => 
    new ValidationError(message, details),
  
  conflict: (message: string, details?: any) => 
    new ConflictError(message, details),
  
  rateLimit: (message?: string, details?: any) => 
    new RateLimitError(message, details),
  
  internal: (message?: string, details?: any) => 
    new InternalServerError(message, details),
  
  database: (message?: string, details?: any) => 
    new DatabaseError(message, details),
  
  execution: (message: string, code: ErrorCode, details?: any) => 
    new ExecutionError(message, code, details),
};

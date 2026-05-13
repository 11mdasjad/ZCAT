/**
 * Rate Limiting Middleware
 * Prevents abuse using Redis-based sliding window
 */

import { NextRequest } from 'next/server';
import { CacheService } from '@/lib/redis/client';
import { RateLimitError } from '@/lib/errors/app-error';
import { env } from '@/lib/config/env';

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  max: number; // Max requests per window
  keyPrefix?: string; // Redis key prefix
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

/**
 * Default rate limit configurations
 */
export const RateLimitPresets = {
  // Strict - for sensitive operations
  STRICT: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
  },
  
  // Standard - for general API endpoints
  STANDARD: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
  },
  
  // Relaxed - for read-only operations
  RELAXED: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
  },
  
  // Code execution - special limits
  CODE_EXECUTION: {
    windowMs: 60 * 1000, // 1 minute
    max: 10,
  },
  
  // Authentication - prevent brute force
  AUTH: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
  },
};

/**
 * Get client identifier from request
 */
function getClientIdentifier(req: NextRequest, userId?: string): string {
  // Prefer user ID if authenticated
  if (userId) {
    return `user:${userId}`;
  }
  
  // Fall back to IP address
  const forwarded = req.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : req.headers.get('x-real-ip') || 'unknown';
  
  return `ip:${ip}`;
}

/**
 * Rate limit check using sliding window algorithm
 */
export async function checkRateLimit(
  req: NextRequest,
  config: RateLimitConfig,
  userId?: string
): Promise<{
  allowed: boolean;
  remaining: number;
  resetTime: number;
}> {
  const identifier = getClientIdentifier(req, userId);
  const key = `${config.keyPrefix || 'ratelimit'}:${identifier}`;
  
  const now = Date.now();
  const windowStart = now - config.windowMs;
  
  // Get current count
  const currentCount = await CacheService.get<number>(key) || 0;
  
  if (currentCount >= config.max) {
    // Rate limit exceeded
    const ttl = await CacheService.ttl(key);
    const resetTime = now + (ttl * 1000);
    
    return {
      allowed: false,
      remaining: 0,
      resetTime,
    };
  }
  
  // Increment counter
  const newCount = await CacheService.incr(key);
  
  // Set expiry on first request
  if (newCount === 1) {
    await CacheService.expire(key, Math.ceil(config.windowMs / 1000));
  }
  
  return {
    allowed: true,
    remaining: Math.max(0, config.max - newCount),
    resetTime: now + config.windowMs,
  };
}

/**
 * Rate limit middleware factory
 */
export function rateLimitMiddleware(config: RateLimitConfig) {
  return async (req: NextRequest, userId?: string) => {
    const result = await checkRateLimit(req, config, userId);
    
    if (!result.allowed) {
      const resetDate = new Date(result.resetTime);
      throw new RateLimitError(
        `Rate limit exceeded. Try again after ${resetDate.toISOString()}`,
        {
          resetTime: result.resetTime,
          limit: config.max,
          window: config.windowMs,
        }
      );
    }
    
    return result;
  };
}

/**
 * Pre-configured rate limiters
 */
export const rateLimiters = {
  strict: rateLimitMiddleware({
    ...RateLimitPresets.STRICT,
    keyPrefix: 'rl:strict',
  }),
  
  standard: rateLimitMiddleware({
    ...RateLimitPresets.STANDARD,
    keyPrefix: 'rl:standard',
  }),
  
  relaxed: rateLimitMiddleware({
    ...RateLimitPresets.RELAXED,
    keyPrefix: 'rl:relaxed',
  }),
  
  codeExecution: rateLimitMiddleware({
    ...RateLimitPresets.CODE_EXECUTION,
    keyPrefix: 'rl:code',
  }),
  
  auth: rateLimitMiddleware({
    ...RateLimitPresets.AUTH,
    keyPrefix: 'rl:auth',
  }),
};

/**
 * Reset rate limit for a user (admin function)
 */
export async function resetRateLimit(
  identifier: string,
  keyPrefix = 'ratelimit'
): Promise<boolean> {
  const key = `${keyPrefix}:${identifier}`;
  return await CacheService.del(key);
}

/**
 * Get rate limit status
 */
export async function getRateLimitStatus(
  req: NextRequest,
  config: RateLimitConfig,
  userId?: string
): Promise<{
  limit: number;
  remaining: number;
  resetTime: number;
}> {
  const identifier = getClientIdentifier(req, userId);
  const key = `${config.keyPrefix || 'ratelimit'}:${identifier}`;
  
  const currentCount = await CacheService.get<number>(key) || 0;
  const ttl = await CacheService.ttl(key);
  const resetTime = Date.now() + (ttl * 1000);
  
  return {
    limit: config.max,
    remaining: Math.max(0, config.max - currentCount),
    resetTime,
  };
}

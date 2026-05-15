/**
 * Redis Client (Upstash)
 * Serverless-friendly Redis client for caching and rate limiting
 */

import { Redis } from '@upstash/redis';
import { env } from '../config/env';
import { logger } from '../logger/logger';

// Initialize Upstash Redis client
export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// Cache utilities
export class CacheService {
  /**
   * Get cached value
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const value = await redis.get<T>(key);
      return value;
    } catch (error) {
      logger.error(`Redis GET error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * Set cached value with TTL
   */
  static async set(
    key: string,
    value: any,
    ttlSeconds?: number
  ): Promise<boolean> {
    try {
      if (ttlSeconds) {
        await redis.setex(key, ttlSeconds, JSON.stringify(value));
      } else {
        await redis.set(key, JSON.stringify(value));
      }
      return true;
    } catch (error) {
      logger.error(`Redis SET error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete cached value
   */
  static async del(key: string): Promise<boolean> {
    try {
      await redis.del(key);
      return true;
    } catch (error) {
      logger.error(`Redis DEL error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  static async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await redis.keys(pattern);
      if (keys.length === 0) return 0;
      
      const deleted = await redis.del(...keys);
      return deleted;
    } catch (error) {
      logger.error(`Redis DEL pattern error for ${pattern}:`, error);
      return 0;
    }
  }

  /**
   * Check if key exists
   */
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key);
      return result === 1;
    } catch (error) {
      logger.error(`Redis EXISTS error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Increment counter
   */
  static async incr(key: string): Promise<number> {
    try {
      return await redis.incr(key);
    } catch (error) {
      logger.error(`Redis INCR error for key ${key}:`, error);
      return 0;
    }
  }

  /**
   * Set expiration on key
   */
  static async expire(key: string, seconds: number): Promise<boolean> {
    try {
      await redis.expire(key, seconds);
      return true;
    } catch (error) {
      logger.error(`Redis EXPIRE error for key ${key}:`, error);
      return false;
    }
  }

  /**
   * Get TTL of key
   */
  static async ttl(key: string): Promise<number> {
    try {
      return await redis.ttl(key);
    } catch (error) {
      logger.error(`Redis TTL error for key ${key}:`, error);
      return -1;
    }
  }

  /**
   * Hash operations
   */
  static async hset(key: string, field: string, value: any): Promise<boolean> {
    try {
      await redis.hset(key, { [field]: JSON.stringify(value) });
      return true;
    } catch (error) {
      logger.error(`Redis HSET error for key ${key}:`, error);
      return false;
    }
  }

  static async hget<T>(key: string, field: string): Promise<T | null> {
    try {
      const value = await redis.hget<string>(key, field);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      logger.error(`Redis HGET error for key ${key}:`, error);
      return null;
    }
  }

  static async hgetall<T>(key: string): Promise<Record<string, T> | null> {
    try {
      const value = await redis.hgetall<Record<string, string>>(key);
      if (!value) return null;
      
      const parsed: Record<string, T> = {};
      for (const [k, v] of Object.entries(value)) {
        parsed[k] = JSON.parse(v);
      }
      return parsed;
    } catch (error) {
      logger.error(`Redis HGETALL error for key ${key}:`, error);
      return null;
    }
  }

  /**
   * List operations
   */
  static async lpush(key: string, ...values: any[]): Promise<number> {
    try {
      return await redis.lpush(key, ...values.map(v => JSON.stringify(v)));
    } catch (error) {
      logger.error(`Redis LPUSH error for key ${key}:`, error);
      return 0;
    }
  }

  static async lrange<T>(key: string, start: number, stop: number): Promise<T[]> {
    try {
      const values = await redis.lrange<string>(key, start, stop);
      return values.map(v => JSON.parse(v));
    } catch (error) {
      logger.error(`Redis LRANGE error for key ${key}:`, error);
      return [];
    }
  }

  /**
   * Sorted set operations (for leaderboards)
   */
  static async zadd(key: string, score: number, member: string): Promise<number> {
    try {
      const result = await redis.zadd(key, { score, member });
      return result ?? 0;
    } catch (error) {
      logger.error(`Redis ZADD error for key ${key}:`, error);
      return 0;
    }
  }

  static async zrange(
    key: string,
    start: number,
    stop: number,
    withScores = false
  ): Promise<any[]> {
    try {
      if (withScores) {
        return await redis.zrange(key, start, stop, { withScores: true });
      }
      return await redis.zrange(key, start, stop);
    } catch (error) {
      logger.error(`Redis ZRANGE error for key ${key}:`, error);
      return [];
    }
  }

  static async zrevrange(
    key: string,
    start: number,
    stop: number,
    withScores = false
  ): Promise<any[]> {
    try {
      if (withScores) {
        return await redis.zrange(key, start, stop, { rev: true, withScores: true });
      }
      return await redis.zrange(key, start, stop, { rev: true });
    } catch (error) {
      logger.error(`Redis ZREVRANGE error for key ${key}:`, error);
      return [];
    }
  }

  static async zrank(key: string, member: string): Promise<number | null> {
    try {
      return await redis.zrank(key, member);
    } catch (error) {
      logger.error(`Redis ZRANK error for key ${key}:`, error);
      return null;
    }
  }

  static async zscore(key: string, member: string): Promise<number | null> {
    try {
      return await redis.zscore(key, member);
    } catch (error) {
      logger.error(`Redis ZSCORE error for key ${key}:`, error);
      return null;
    }
  }
}

// Cache key builders
export const CacheKeys = {
  user: (id: string) => `user:${id}`,
  userProfile: (id: string) => `user:${id}:profile`,
  assessment: (id: string) => `assessment:${id}`,
  assessmentList: (page: number, limit: number) => `assessments:${page}:${limit}`,
  question: (id: string) => `question:${id}`,
  submission: (id: string) => `submission:${id}`,
  leaderboard: (assessmentId: string) => `leaderboard:${assessmentId}`,
  analytics: (assessmentId: string) => `analytics:${assessmentId}`,
  session: (sessionId: string) => `session:${sessionId}`,
  rateLimit: (identifier: string) => `ratelimit:${identifier}`,
};

// Cache TTL constants (in seconds)
export const CacheTTL = {
  SHORT: 60, // 1 minute
  MEDIUM: 300, // 5 minutes
  LONG: 3600, // 1 hour
  DAY: 86400, // 24 hours
  WEEK: 604800, // 7 days
};

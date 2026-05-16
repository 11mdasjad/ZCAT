/**
 * Environment Configuration
 * Centralized environment variable management with validation
 */

import { z } from 'zod';

// Auto-detect the app URL: explicit env var > Vercel URL > localhost fallback
const getDefaultAppUrl = (): string => {
  if (typeof process !== 'undefined') {
    if (process.env.NEXT_PUBLIC_APP_URL) return process.env.NEXT_PUBLIC_APP_URL;
    if (process.env.NEXT_PUBLIC_VERCEL_URL) return `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`;
    if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  }
  return 'http://localhost:3000';
};

const envSchema = z.object({
  // Node Environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  // App
  NEXT_PUBLIC_APP_URL: z.string().url().default(getDefaultAppUrl()),
  NEXT_PUBLIC_API_URL: z.string().url().default(`${getDefaultAppUrl()}/api/v1`),
  
  // Database
  DATABASE_URL: z.string().optional(),
  DIRECT_URL: z.string().optional(),
  
  // Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  SUPABASE_JWT_SECRET: z.string().optional(),
  
  // Redis (Optional)
  UPSTASH_REDIS_REST_URL: z.string().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  REDIS_URL: z.string().optional(),
  
  // Code Execution (Optional)
  EXECUTION_WORKER_URL: z.string().optional(),
  
  // Security (Optional)
  JWT_SECRET: z.string().optional(),
  ENCRYPTION_KEY: z.string().optional(),
  
  // Monitoring
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

// Parse and validate environment variables
const parseEnv = () => {
  try {
    return envSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('❌ Invalid environment variables:');
      console.error(JSON.stringify(error.errors, null, 2));
    }
    // Don't crash — return defaults
    return envSchema.parse({});
  }
};

export const env = parseEnv();

// Type-safe environment variables
export type Env = z.infer<typeof envSchema>;

// Helper functions
export const isDevelopment = env.NODE_ENV === 'development';
export const isProduction = env.NODE_ENV === 'production';
export const isTest = env.NODE_ENV === 'test';

/**
 * Authentication Middleware
 * Validates JWT tokens and attaches user to request
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UnauthorizedError } from '@/lib/errors/app-error';
import { errorResponse } from '@/lib/utils/response';

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

/**
 * Verify authentication token
 */
export async function authMiddleware(
  req: NextRequest
): Promise<{ user: any; error: null } | { user: null; error: NextResponse }> {
  try {
    const supabase = await createClient();
    
    // Get session from Supabase
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    if (error || !session) {
      return {
        user: null,
        error: errorResponse(
          new UnauthorizedError('Authentication required')
        ),
      };
    }

    // Get user profile with role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile) {
      return {
        user: null,
        error: errorResponse(
          new UnauthorizedError('User profile not found')
        ),
      };
    }

    return {
      user: {
        id: profile.id,
        email: profile.email,
        role: profile.role,
      },
      error: null,
    };
  } catch (error) {
    return {
      user: null,
      error: errorResponse(error as Error),
    };
  }
}

/**
 * Optional authentication - doesn't fail if no token
 */
export async function optionalAuthMiddleware(
  req: NextRequest
): Promise<{ user: any | null }> {
  try {
    const supabase = await createClient();
    
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return { user: null };
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('id, email, role')
      .eq('id', session.user.id)
      .single();

    return {
      user: profile || null,
    };
  } catch (error) {
    return { user: null };
  }
}

/**
 * Extract bearer token from header
 */
export function extractBearerToken(req: NextRequest): string | null {
  const authHeader = req.headers.get('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  
  return authHeader.substring(7);
}

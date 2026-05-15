/**
 * Authentication Middleware
 * Validates JWT tokens and attaches user to request
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { UnauthorizedError } from '@/lib/errors/app-error';
import { errorResponse } from '@/lib/utils/response';
import prisma from '@/lib/prisma/client';

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
  _req: NextRequest
): Promise<{ user: any; error: null } | { user: null; error: NextResponse }> {
  try {
    const supabase = await createClient();
    
    const {
      data: { user: authUser },
      error,
    } = await supabase.auth.getUser();

    if (error || !authUser) {
      return {
        user: null,
        error: errorResponse(
          new UnauthorizedError('Authentication required')
        ),
      };
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, email: true, role: true },
    });

    if (!user) {
      return {
        user: null,
        error: errorResponse(
          new UnauthorizedError('User record not found')
        ),
      };
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
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
  _req: NextRequest
): Promise<{ user: any | null }> {
  try {
    const supabase = await createClient();
    
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return { user: null };
    }

    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, email: true, role: true },
    });

    return {
      user: user || null,
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

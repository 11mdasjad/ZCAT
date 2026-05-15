/**
 * Admin Role Promotion API
 * Only SUPER_ADMIN can change user roles
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma/client';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger/logger';

const VALID_ROLES = ['CANDIDATE', 'RECRUITER', 'ADMIN', 'SUPER_ADMIN'];

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) return errorResponse(new Error('Authentication required'), 401);

    const body = await req.json();
    const { userId, role } = body;

    if (!userId || !role) return errorResponse(new Error('userId and role are required'), 400);
    if (!VALID_ROLES.includes(role)) return errorResponse(new Error(`Invalid role. Valid: ${VALID_ROLES.join(', ')}`), 400);

    // Check caller is SUPER_ADMIN or ADMIN
    let callerRole: string | null = null;
    try {
      const caller = await prisma.user.findUnique({ where: { id: authUser.id }, select: { role: true } });
      callerRole = caller?.role || null;
    } catch {
      // DB unavailable — check user_metadata
      callerRole = (authUser.user_metadata?.role as string) || null;
    }

    if (!callerRole || !['SUPER_ADMIN', 'ADMIN'].includes(callerRole)) {
      return errorResponse(new Error('Only SUPER_ADMIN or ADMIN can promote users'), 403);
    }

    // Only SUPER_ADMIN can create other admins
    if (['ADMIN', 'SUPER_ADMIN'].includes(role) && callerRole !== 'SUPER_ADMIN') {
      return errorResponse(new Error('Only SUPER_ADMIN can assign admin roles'), 403);
    }

    // Prevent self-demotion
    if (userId === authUser.id) {
      return errorResponse(new Error('Cannot change your own role'), 400);
    }

    // Update in Prisma DB
    try {
      const updated = await prisma.user.update({
        where: { id: userId },
        data: { role: role as any },
        select: { id: true, email: true, name: true, role: true },
      });
      logger.info('User role updated via DB', { adminId: authUser.id, targetUserId: userId, newRole: role });
      return successResponse(updated);
    } catch (dbErr) {
      // DB unavailable — update via Supabase
      logger.warn('DB unavailable for role update, using Supabase user_metadata');

      // We can't directly update another user's metadata with anon key
      // Return instructions for manual SQL update
      return errorResponse(new Error(
        `Database is currently unavailable. To change the role manually, run this SQL in your Supabase SQL Editor:\n\nUPDATE users SET role = '${role}' WHERE id = '${userId}';`
      ), 503);
    }
  } catch (error) {
    logger.error('Error promoting user:', error);
    return errorResponse(error as Error);
  }
}

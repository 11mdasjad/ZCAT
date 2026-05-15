/**
 * Admin User Detail API
 * Fetch detailed information about a specific user
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma/client';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: targetUserId } = await params;

    // Authenticate
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return errorResponse(new Error('Authentication required'), 401);
    }

    // Check admin role
    const admin = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { role: true },
    });

    if (!admin || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      return errorResponse(new Error('Admin access required'), 403);
    }

    // Fetch target user with all details
    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        emailVerified: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            bio: true,
            phone: true,
            location: true,
            timezone: true,
          },
        },
        candidateProfile: {
          select: {
            university: true,
            graduationYear: true,
            resumeUrl: true,
            skills: true,
            githubUrl: true,
            linkedinUrl: true,
            portfolioUrl: true,
          },
        },
        recruiterProfile: {
          select: {
            companyName: true,
            jobTitle: true,
            companySize: true,
            industry: true,
            website: true,
            verified: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse(new Error('User not found'), 404);
    }

    logger.info(`Admin viewed user detail`, { adminId: authUser.id, targetUserId });

    return successResponse(user);
  } catch (error) {
    logger.error('Error fetching user detail:', error);
    return errorResponse(error as Error);
  }
}

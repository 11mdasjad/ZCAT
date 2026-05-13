/**
 * Admin Users API
 * Secure endpoint for fetching user data - Admin only
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma/client';
import { successResponse, errorResponse, paginatedResponse, parsePagination } from '@/lib/utils/response';
import { requireAdmin } from '@/middleware/rbac.middleware';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger/logger';

/**
 * GET /api/v1/admin/users
 * Fetch all users with pagination and filters
 * @access Admin only
 */
export async function GET(req: NextRequest) {
  try {
    // Get authenticated user from Supabase
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return errorResponse(new Error('Authentication required'), 401);
    }

    // Get user from database to check role
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { id: true, role: true, email: true },
    });

    if (!user) {
      return errorResponse(new Error('User not found'), 404);
    }

    // Check RBAC - Admin only
    const rbacError = requireAdmin(user);
    if (rbacError) {
      return rbacError;
    }

    // Parse query parameters
    const { searchParams } = new URL(req.url);
    const { page, limit } = parsePagination(req.url);
    const role = searchParams.get('role');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    // Build where clause
    const where: any = {
      deletedAt: null, // Only active users
    };

    if (role) {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Build orderBy
    const orderBy: any = {};
    orderBy[sortBy] = sortOrder;

    // Fetch users with pagination
    const skip = (page - 1) * limit;
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
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
          candidateProfile: {
            select: {
              university: true,
              graduationYear: true,
              skills: true,
            },
          },
          recruiterProfile: {
            select: {
              companyName: true,
              jobTitle: true,
              verified: true,
            },
          },
        },
        orderBy,
        skip,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);

    logger.info(`Admin fetched ${users.length} users`, {
      adminId: user.id,
      page,
      limit,
      total,
    });

    return paginatedResponse(users, page, limit, total);
  } catch (error) {
    logger.error('Error fetching users:', error);
    return errorResponse(error as Error);
  }
}

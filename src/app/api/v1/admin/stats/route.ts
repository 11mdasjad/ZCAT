/**
 * Admin Statistics API
 * Secure endpoint for fetching dashboard statistics - Admin only
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma/client';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { requireAdmin } from '@/middleware/rbac.middleware';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger/logger';

/**
 * GET /api/v1/admin/stats
 * Fetch dashboard statistics
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

    // Calculate date ranges
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // Fetch all statistics in parallel
    const [
      totalCandidates,
      candidatesThisWeek,
      totalAssessments,
      liveAssessments,
      assessmentsStartingToday,
      totalViolations,
      violationsLastWeek,
      topScoreData,
      recentUsers,
      assessmentActivity,
      skillDistribution,
      recentAssessments,
    ] = await Promise.all([
      // Total candidates
      prisma.user.count({
        where: { role: 'CANDIDATE', deletedAt: null },
      }),

      // Candidates this week
      prisma.user.count({
        where: {
          role: 'CANDIDATE',
          createdAt: { gte: oneWeekAgo },
          deletedAt: null,
        },
      }),

      // Total assessments
      prisma.assessment.count({
        where: { deletedAt: null },
      }),

      // Live assessments
      prisma.assessment.count({
        where: {
          status: 'LIVE',
          deletedAt: null,
        },
      }),

      // Assessments starting today
      prisma.assessment.count({
        where: {
          startTime: {
            gte: new Date(now.setHours(0, 0, 0, 0)),
            lt: new Date(now.setHours(23, 59, 59, 999)),
          },
          deletedAt: null,
        },
      }),

      // Total violations
      prisma.violation.count(),

      // Violations last week
      prisma.violation.count({
        where: {
          timestamp: { gte: oneWeekAgo },
        },
      }),

      // Top score
      prisma.submission.findFirst({
        where: {
          status: 'ACCEPTED',
          score: { not: null },
        },
        orderBy: { score: 'desc' },
        select: {
          score: true,
          user: {
            select: { name: true },
          },
        },
      }),

      // Recent users (last 10)
      prisma.user.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          emailVerified: true,
        },
        orderBy: { createdAt: 'desc' },
        take: 10,
      }),

      // Assessment activity (last 7 days)
      prisma.$queryRaw`
        SELECT 
          DATE(started_at) as date,
          COUNT(*) as count
        FROM exam_sessions
        WHERE started_at >= ${oneWeekAgo}
        GROUP BY DATE(started_at)
        ORDER BY date ASC
      `,

      // Skill distribution from candidate profiles
      prisma.candidateProfile.findMany({
        select: { skills: true },
        where: {
          skills: { isEmpty: false },
        },
      }),

      // Recent assessments
      prisma.assessment.findMany({
        where: { deletedAt: null },
        select: {
          id: true,
          title: true,
          status: true,
          createdAt: true,
          _count: {
            select: {
              sessions: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 5,
      }),
    ]);

    // Calculate violations change percentage
    const violationsThisWeek = totalViolations - violationsLastWeek;
    const violationsChange = violationsLastWeek > 0
      ? ((violationsThisWeek - violationsLastWeek) / violationsLastWeek) * 100
      : 0;

    // Process skill distribution
    const skillCounts: Record<string, number> = {};
    skillDistribution.forEach((profile) => {
      profile.skills.forEach((skill: string) => {
        const normalizedSkill = skill.toLowerCase().trim();
        skillCounts[normalizedSkill] = (skillCounts[normalizedSkill] || 0) + 1;
      });
    });

    // Get top 5 skills
    const topSkills = Object.entries(skillCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([skill, count]) => ({
        name: skill.charAt(0).toUpperCase() + skill.slice(1),
        value: count,
      }));

    // Build response
    const stats = {
      kpis: {
        totalCandidates: {
          value: totalCandidates,
          change: `+${candidatesThisWeek} this week`,
        },
        activeExams: {
          value: liveAssessments,
          change: `${assessmentsStartingToday} starting today`,
        },
        violations: {
          value: totalViolations,
          change: `${violationsChange >= 0 ? '+' : ''}${violationsChange.toFixed(1)}% vs last week`,
        },
        topScore: {
          value: topScoreData?.score ? `${topScoreData.score}%` : 'N/A',
          change: topScoreData?.user?.name || 'No submissions yet',
        },
      },
      recentUsers,
      assessmentActivity,
      skillDistribution: topSkills,
      recentAssessments: recentAssessments.map((assessment) => ({
        id: assessment.id,
        name: assessment.title,
        status: assessment.status.toLowerCase(),
        candidates: assessment._count.sessions,
        progress: assessment.status === 'COMPLETED' ? 100 : assessment.status === 'LIVE' ? 50 : 0,
      })),
    };

    logger.info('Admin fetched dashboard statistics', {
      adminId: user.id,
    });

    return successResponse(stats);
  } catch (error) {
    logger.error('Error fetching admin statistics:', error);
    return errorResponse(error as Error);
  }
}

/**
 * Admin Live Monitoring API Route
 * GET /api/v1/admin/monitoring - Retrieve list of currently ACTIVE exam sessions
 */

import { NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth.middleware';
import { requireRecruiterOrAdmin } from '@/middleware/rbac.middleware';
import prisma from '@/lib/prisma/client';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate user
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    // 2. Authorize - must be Recruiter or Admin
    const authError = requireRecruiterOrAdmin(user);
    if (authError) return authError;

    // 3. Query ONLY currently ACTIVE exam sessions from the database
    const sessions = await prisma.examSession.findMany({
      where: {
        status: 'ACTIVE',
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            avatarUrl: true,
          },
        },
        assessment: {
          select: {
            title: true,
            duration: true,
          },
        },
        violations: true,
        snapshots: {
          orderBy: { capturedAt: 'desc' },
          take: 1,
        },
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    // 4. Map DB records to UI-compliant properties
    const formattedSessions = sessions.map((s) => {
      // Calculate remaining clock format MM:SS
      let displayTime = '00:00';
      if (s.timeRemaining !== null && s.timeRemaining !== undefined) {
        const mins = Math.floor(s.timeRemaining / 60);
        const secs = s.timeRemaining % 60;
        displayTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      } else {
        // Fallback: estimate from startedAt duration
        const elapsedSeconds = Math.floor((Date.now() - new Date(s.startedAt).getTime()) / 1000);
        const totalDurationSeconds = s.assessment.duration * 60;
        const remainingSeconds = Math.max(0, totalDurationSeconds - elapsedSeconds);
        const mins = Math.floor(remainingSeconds / 60);
        const secs = remainingSeconds % 60;
        displayTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
      }

      // Determine status: flagged (5+ violations or any CRITICAL), warning (2-4), active (0-1)
      const hasCritical = s.violations.some((v) => v.severity === 'CRITICAL');
      let activeStatus = 'active';
      if (s.violations.length >= 5 || hasCritical) {
        activeStatus = 'flagged';
      } else if (s.violations.length >= 2) {
        activeStatus = 'warning';
      }

      return {
        id: s.id,
        name: s.assessment.title,
        candidate: s.user?.name || 'Anonymous Candidate',
        status: activeStatus,
        violations: s.violations.length,
        timeLeft: displayTime,
        integrity: s.integrityScore,
        imageUrl: s.snapshots[0]?.imageUrl || null,
        // For client-side live countdown
        startedAt: s.startedAt.toISOString(),
        assessmentDuration: s.assessment.duration,
      };
    });

    return successResponse(formattedSessions);
  } catch (err: any) {
    return errorResponse(err);
  }
}

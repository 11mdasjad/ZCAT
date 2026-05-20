import { NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth.middleware';
import { successResponse, errorResponse } from '@/lib/utils/response';
import prisma from '@/lib/prisma/client';
import { logger } from '@/lib/logger/logger';
import { ViolationType, ViolationSeverity } from '@prisma/client';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

const SCORE_DEDUCTIONS: Record<ViolationType, number> = {
  [ViolationType.TAB_SWITCH]: 10,
  [ViolationType.COPY_PASTE]: 15,
  [ViolationType.SUSPICIOUS_ACTIVITY]: 20,
  [ViolationType.MULTIPLE_FACES]: 15,
  [ViolationType.NO_FACE]: 5,
  [ViolationType.AUDIO_ANOMALY]: 5,
  [ViolationType.UNAUTHORIZED_DEVICE]: 25,
};

const SEVERITIES: Record<ViolationType, ViolationSeverity> = {
  [ViolationType.TAB_SWITCH]: ViolationSeverity.WARNING,
  [ViolationType.COPY_PASTE]: ViolationSeverity.CRITICAL,
  [ViolationType.SUSPICIOUS_ACTIVITY]: ViolationSeverity.CRITICAL,
  [ViolationType.MULTIPLE_FACES]: ViolationSeverity.CRITICAL,
  [ViolationType.NO_FACE]: ViolationSeverity.WARNING,
  [ViolationType.AUDIO_ANOMALY]: ViolationSeverity.WARNING,
  [ViolationType.UNAUTHORIZED_DEVICE]: ViolationSeverity.CRITICAL,
};

/**
 * POST /api/v1/assessments/[id]/violation
 * Record a proctoring violation and update session integrity score.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    const { id: assessmentId } = await context.params;

    // Parse the request body
    const body = await req.json();
    const { type, description, metadata } = body;

    if (!type || !Object.values(ViolationType).includes(type)) {
      return errorResponse(new Error(`Invalid or missing violation type. Valid options: ${Object.keys(ViolationType).join(', ')}`), 400);
    }

    const violationType = type as ViolationType;
    const severity = SEVERITIES[violationType] || ViolationSeverity.WARNING;
    const deduction = SCORE_DEDUCTIONS[violationType] || 10;
    const violationDesc = description || `Proctoring violation of type ${type} detected.`;

    // Perform transaction to ensure atomic score decrease and record log
    const result = await prisma.$transaction(async (tx) => {
      // Find active exam session
      let session = await tx.examSession.findUnique({
        where: {
          assessmentId_userId: {
            assessmentId,
            userId: user.id,
          },
        },
      });

      if (!session) {
        // Fallback: Create dynamic session if not exists
        session = await tx.examSession.create({
          data: {
            assessmentId,
            userId: user.id,
            status: 'ACTIVE',
            ipAddress: req.headers.get('x-forwarded-for') || '127.0.0.1',
            userAgent: req.headers.get('user-agent') || 'Unknown',
            integrityScore: 100,
          },
        });
      }

      const updatedScore = Math.max(0, session.integrityScore - deduction);

      // Update integrity score
      const updatedSession = await tx.examSession.update({
        where: { id: session.id },
        data: {
          integrityScore: updatedScore,
        },
      });

      // Create Violation record
      const violation = await tx.violation.create({
        data: {
          sessionId: session.id,
          userId: user.id,
          type: violationType,
          severity,
          description: violationDesc,
          metadata: metadata ? (metadata as any) : undefined,
        },
      });

      return {
        violation,
        integrityScore: updatedScore,
      };
    });

    return successResponse({
      message: `Violation recorded successfully. Integrity score is now ${result.integrityScore}%.`,
      violation: result.violation,
      integrityScore: result.integrityScore,
    });
  } catch (err) {
    logger.error('Error logging proctoring violation:', err);
    return errorResponse(err as Error, 500);
  }
}

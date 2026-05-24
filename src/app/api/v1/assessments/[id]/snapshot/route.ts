import { NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth.middleware';
import { successResponse, errorResponse } from '@/lib/utils/response';
import prisma from '@/lib/prisma/client';
import { logger } from '@/lib/logger/logger';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/v1/assessments/[id]/snapshot
 * Save a real-time proctoring webcam snapshot from candidate video feed.
 * Optimized: Stores the base64 JPEG data URL directly in the database to guarantee 100% 
 * serverless (Vercel) compatibility and eliminate external file-system or Supabase Storage dependencies.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    // 1. Authenticate candidate
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    const { id: assessmentId } = await context.params;

    // 2. Parse request body
    const body = await req.json();
    const { image } = body; // Base64 dataURL: data:image/jpeg;base64,...

    if (!image) {
      return errorResponse(new Error('No image snapshot data provided'), 400);
    }

    // 3. Connect/find ExamSession
    let session = await prisma.examSession.findUnique({
      where: {
        assessmentId_userId: {
          assessmentId,
          userId: user.id,
        },
      },
    });

    if (!session) {
      session = await prisma.examSession.create({
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

    // 4. Create ProctoringSnapshot entry with direct base64 data URL
    const snapshot = await prisma.proctoringSnapshot.create({
      data: {
        sessionId: session.id,
        imageUrl: image, // Store base64 data URL directly
        faceCount: 1,
        confidence: 0.95,
        metadata: {},
      },
    });

    logger.info('Proctoring snapshot logged directly to database', {
      userId: user.id,
      sessionId: session.id,
      snapshotId: snapshot.id
    });

    return successResponse({
      message: 'Proctoring snapshot captured successfully.',
      snapshot,
    });
  } catch (err) {
    logger.error('Error logging proctoring snapshot to database:', err);
    return errorResponse(err as Error, 500);
  }
}

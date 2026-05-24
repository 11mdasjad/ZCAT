import { NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth.middleware';
import { successResponse, errorResponse } from '@/lib/utils/response';
import prisma from '@/lib/prisma/client';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger/logger';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

/**
 * POST /api/v1/assessments/[id]/snapshot
 * Save a real-time proctoring webcam snapshot from candidate video feed.
 * Supabase Storage is prioritized for serverless environments (Vercel) with local filesystem fallback.
 */
export async function POST(req: NextRequest, context: RouteContext) {
  try {
    // 1. Authenticate candidate
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    const { id: assessmentId } = await context.params;

    // 2. Parse request body
    const body = await req.json();
    const { image } = body; // Base64 dataURL

    if (!image) {
      return errorResponse(new Error('No image snapshot data provided'), 400);
    }

    // 3. Process base64 image to binary buffer
    const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // 4. Determine save target
    const timestamp = Date.now();
    const fileName = `${user.id}_${timestamp}.jpg`;
    const bucketName = 'avatars';
    const filePath = `snapshots/${user.id}/${fileName}`;

    let publicUrl: string | null = null;

    // Try Supabase Storage first (for Vercel serverless support)
    try {
      const supabase = await createClient();
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, buffer, { contentType: 'image/jpeg', upsert: true });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
        logger.info('Proctoring snapshot uploaded to Supabase Storage', { userId: user.id, path: publicUrl });
      } else {
        logger.warn('Supabase Storage snapshot upload failed, trying local fallback:', uploadError?.message);
      }
    } catch (storageErr: any) {
      logger.warn('Supabase Storage unavailable for snapshot, trying local fallback:', storageErr.message);
    }

    // Fallback: save to local filesystem (for local development support)
    if (!publicUrl) {
      try {
        const uploadDir = join(process.cwd(), 'public', 'uploads', 'snapshots', user.id);
        await mkdir(uploadDir, { recursive: true });
        const localPath = join(uploadDir, fileName);
        await writeFile(localPath, buffer);
        publicUrl = `/uploads/snapshots/${user.id}/${fileName}`;
        logger.info('Proctoring snapshot saved locally', { userId: user.id, path: publicUrl });
      } catch (localErr) {
        logger.error('Local file save for snapshot failed:', localErr);
        return errorResponse(new Error('File upload failed on all storage layers.'), 500);
      }
    }

    // 5. Connect/find ExamSession
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

    // 6. Create ProctoringSnapshot entry in db
    const snapshot = await prisma.proctoringSnapshot.create({
      data: {
        sessionId: session.id,
        imageUrl: publicUrl,
        faceCount: 1,
        confidence: 0.95,
        metadata: {},
      },
    });

    return successResponse({
      message: 'Proctoring snapshot captured successfully.',
      snapshot,
    });
  } catch (err) {
    logger.error('Error logging proctoring snapshot:', err);
    return errorResponse(err as Error, 500);
  }
}

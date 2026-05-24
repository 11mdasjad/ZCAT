/**
 * Specific Interview API Route
 * GET /api/v1/interviews/[id] - Fetch detailed session results, transcript, and scores
 */

import { NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth.middleware';
import { interviewService } from '@/services/interview/interview.service';
import { successResponse, errorResponse } from '@/lib/utils/response';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    const { id } = await params;
    const sessionDetails = await interviewService.getSessionDetails(user.id, id);
    
    return successResponse(sessionDetails);
  } catch (err: any) {
    return errorResponse(err);
  }
}

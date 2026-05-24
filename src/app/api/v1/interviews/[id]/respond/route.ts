/**
 * Respond to AI Interview Question API Route
 * POST /api/v1/interviews/[id]/respond - Submit response, receive semantic score/feedback, and fetch next question
 */

import { NextRequest } from 'next/server';
import { authMiddleware } from '@/middleware/auth.middleware';
import { interviewService } from '@/services/interview/interview.service';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { z } from 'zod';
import { ValidationError } from '@/lib/errors/app-error';

const responseSchema = z.object({
  questionId: z.string().min(1, 'Question ID is required'),
  response: z.string().min(1, 'Response text is required'),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user, error } = await authMiddleware(req);
    if (error) return error;

    const { id: sessionId } = await params;
    const body = await req.json();
    const validatedData = responseSchema.parse(body);

    const result = await interviewService.submitResponse(
      user.id,
      sessionId,
      validatedData.questionId,
      validatedData.response
    );

    return successResponse(result);
  } catch (err: any) {
    if (err instanceof z.ZodError) {
      return errorResponse(new ValidationError('Invalid response submission fields', err.errors));
    }
    return errorResponse(err);
  }
}

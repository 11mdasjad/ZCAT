/**
 * File Upload API
 * Handles avatar and resume uploads to Supabase Storage
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger/logger';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_RESUME_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

/**
 * POST /api/v1/upload
 * Upload file to Supabase Storage
 */
export async function POST(req: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return errorResponse(new Error('Authentication required'), 401);
    }

    // Parse form data
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string; // 'avatar' or 'resume'

    if (!file) {
      return errorResponse(new Error('No file provided'), 400);
    }

    if (!type || !['avatar', 'resume'].includes(type)) {
      return errorResponse(new Error('Invalid upload type. Must be "avatar" or "resume"'), 400);
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse(new Error('File size exceeds 5MB limit'), 400);
    }

    // Validate file type
    if (type === 'avatar' && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return errorResponse(
        new Error('Invalid image format. Allowed: JPEG, PNG, WebP, GIF'),
        400
      );
    }

    if (type === 'resume' && !ALLOWED_RESUME_TYPES.includes(file.type)) {
      return errorResponse(
        new Error('Invalid resume format. Allowed: PDF, DOC, DOCX'),
        400
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${authUser.id}_${timestamp}.${fileExt}`;
    const bucketName = type === 'avatar' ? 'avatars' : 'resumes';
    const filePath = `${authUser.id}/${fileName}`;

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: true,
      });

    if (uploadError) {
      logger.error('Supabase upload error:', uploadError);
      return errorResponse(new Error(`Upload failed: ${uploadError.message}`), 500);
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    const publicUrl = urlData.publicUrl;

    logger.info('File uploaded successfully', {
      userId: authUser.id,
      type,
      fileName,
      size: file.size,
    });

    return successResponse({
      url: publicUrl,
      fileName,
      size: file.size,
      type: file.type,
    });
  } catch (error) {
    logger.error('Error uploading file:', error);
    return errorResponse(error as Error);
  }
}

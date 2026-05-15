/**
 * File Upload API
 * Handles avatar and resume uploads
 * Strategy: Try Supabase Storage first, fallback to local filesystem
 */

import { NextRequest } from 'next/server';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger/logger';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_RESUME_TYPES = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !authUser) return errorResponse(new Error('Authentication required'), 401);

    const formData = await req.formData();
    const file = formData.get('file') as File;
    const type = formData.get('type') as string;

    if (!file) return errorResponse(new Error('No file provided'), 400);
    if (!type || !['avatar', 'resume'].includes(type)) return errorResponse(new Error('Invalid upload type'), 400);
    if (file.size > MAX_FILE_SIZE) return errorResponse(new Error('File size exceeds 5MB limit'), 400);

    if (type === 'avatar' && !ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return errorResponse(new Error('Invalid image format. Allowed: JPEG, PNG, WebP, GIF'), 400);
    }
    if (type === 'resume' && !ALLOWED_RESUME_TYPES.includes(file.type)) {
      return errorResponse(new Error('Invalid resume format. Allowed: PDF, DOC, DOCX'), 400);
    }

    const timestamp = Date.now();
    const fileExt = file.name.split('.').pop();
    const fileName = `${authUser.id}_${timestamp}.${fileExt}`;
    const bucketName = type === 'avatar' ? 'avatars' : 'resumes';
    const filePath = `${authUser.id}/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Try Supabase Storage first
    let publicUrl: string | null = null;
    try {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(filePath, buffer, { contentType: file.type, upsert: true });

      if (!uploadError && uploadData) {
        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath);
        publicUrl = urlData.publicUrl;
        logger.info('File uploaded to Supabase Storage', { userId: authUser.id, type, fileName });
      } else {
        logger.warn('Supabase Storage upload failed, using local fallback:', uploadError?.message);
      }
    } catch (storageErr) {
      logger.warn('Supabase Storage unavailable, using local fallback:', storageErr);
    }

    // Fallback: save to local filesystem
    if (!publicUrl) {
      try {
        const uploadDir = join(process.cwd(), 'public', 'uploads', type === 'avatar' ? 'avatars' : 'resumes', authUser.id);
        await mkdir(uploadDir, { recursive: true });
        const localPath = join(uploadDir, fileName);
        await writeFile(localPath, buffer);
        publicUrl = `/uploads/${type === 'avatar' ? 'avatars' : 'resumes'}/${authUser.id}/${fileName}`;
        logger.info('File saved locally', { userId: authUser.id, type, path: publicUrl });
      } catch (localErr) {
        logger.error('Local file save also failed:', localErr);
        return errorResponse(new Error('File upload failed. Please try again.'), 500);
      }
    }

    // Also save the URL to Supabase user_metadata for persistence
    if (type === 'resume') {
      await supabase.auth.updateUser({ data: { resume_url: publicUrl } });
    } else if (type === 'avatar') {
      await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });
    }

    return successResponse({ url: publicUrl, fileName, size: file.size, type: file.type });
  } catch (error) {
    logger.error('Error uploading file:', error);
    return errorResponse(error as Error);
  }
}

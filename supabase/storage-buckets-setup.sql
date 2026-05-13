-- ============================================
-- ZCAT Platform - Supabase Storage Buckets Setup
-- ============================================
-- This script creates storage buckets for avatars and resumes
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. Create Avatars Bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true, -- Public bucket
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

-- ============================================
-- 2. Create Resumes Bucket
-- ============================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'resumes',
  'resumes',
  false, -- Private bucket (only accessible by authenticated users)
  5242880, -- 5MB limit
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];

-- ============================================
-- 3. Set up Storage Policies for Avatars
-- ============================================

-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'avatars' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to avatars
CREATE POLICY "Anyone can view avatars"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'avatars');

-- ============================================
-- 4. Set up Storage Policies for Resumes
-- ============================================

-- Allow authenticated users to upload their own resumes
CREATE POLICY "Users can upload their own resume"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to update their own resumes
CREATE POLICY "Users can update their own resume"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow authenticated users to delete their own resumes
CREATE POLICY "Users can delete their own resume"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view only their own resumes
CREATE POLICY "Users can view their own resume"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'resumes' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to view all resumes (will work after users table is created)
-- Uncomment this after running Prisma migrations:
-- CREATE POLICY "Admins can view all resumes"
-- ON storage.objects FOR SELECT
-- TO authenticated
-- USING (
--   bucket_id = 'resumes' AND
--   EXISTS (
--     SELECT 1 FROM public.users
--     WHERE users.id = auth.uid()
--     AND users.role IN ('ADMIN', 'SUPER_ADMIN')
--   )
-- );

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify the buckets were created:

-- Check buckets
-- SELECT * FROM storage.buckets WHERE id IN ('avatars', 'resumes');

-- Check policies
-- SELECT * FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- ============================================
-- NOTES
-- ============================================
-- 1. Avatars bucket is PUBLIC - anyone can view avatar images
-- 2. Resumes bucket is PRIVATE - only the owner and admins can access
-- 3. Files are organized by user ID: {bucket}/{userId}/{filename}
-- 4. File size limit: 5MB for both buckets
-- 5. Allowed formats:
--    - Avatars: JPEG, PNG, WebP, GIF
--    - Resumes: PDF, DOC, DOCX

-- ============================================
-- TROUBLESHOOTING
-- ============================================
-- If policies already exist, drop them first:
-- DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
-- DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can upload their own resume" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update their own resume" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete their own resume" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can view their own resume" ON storage.objects;
-- DROP POLICY IF EXISTS "Admins can view all resumes" ON storage.objects;

-- Then run this script again.

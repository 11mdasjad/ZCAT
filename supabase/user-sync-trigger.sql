-- ============================================
-- ZCAT Platform - Supabase User Sync Trigger
-- ============================================
-- This trigger automatically syncs Supabase Auth users to Prisma tables
-- Run this in your Supabase SQL Editor

-- ============================================
-- 1. Create function to handle new user registration
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role TEXT;
  user_name TEXT;
  user_university TEXT;
  user_grad_year INTEGER;
  user_resume_url TEXT;
  user_skills TEXT[];
BEGIN
  -- Extract metadata from auth.users
  user_role := COALESCE((NEW.raw_user_meta_data->>'role')::TEXT, 'CANDIDATE');
  user_name := COALESCE((NEW.raw_user_meta_data->>'full_name')::TEXT, split_part(NEW.email, '@', 1));
  user_university := (NEW.raw_user_meta_data->>'university')::TEXT;
  user_grad_year := (NEW.raw_user_meta_data->>'graduation_year')::INTEGER;
  user_resume_url := (NEW.raw_user_meta_data->>'resume_url')::TEXT;
  user_skills := COALESCE(
    ARRAY(SELECT jsonb_array_elements_text(NEW.raw_user_meta_data->'skills')),
    ARRAY[]::TEXT[]
  );

  -- Insert into users table
  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    email_verified,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    NEW.email,
    user_name,
    user_role::public."UserRole",
    NEW.email_confirmed_at IS NOT NULL,
    true,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    email_verified = EXCLUDED.email_verified,
    updated_at = NOW();

  -- Insert into profiles table
  INSERT INTO public.profiles (
    id,
    user_id,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    NEW.id,
    NOW(),
    NOW()
  )
  ON CONFLICT (user_id) DO NOTHING;

  -- If candidate, insert into candidate_profiles
  IF user_role = 'CANDIDATE' THEN
    INSERT INTO public.candidate_profiles (
      id,
      user_id,
      university,
      graduation_year,
      resume_url,
      skills,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      NEW.id,
      user_university,
      user_grad_year,
      user_resume_url,
      user_skills,
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      university = COALESCE(EXCLUDED.university, candidate_profiles.university),
      graduation_year = COALESCE(EXCLUDED.graduation_year, candidate_profiles.graduation_year),
      resume_url = COALESCE(EXCLUDED.resume_url, candidate_profiles.resume_url),
      skills = COALESCE(EXCLUDED.skills, candidate_profiles.skills),
      updated_at = NOW();
  END IF;

  -- If recruiter, insert into recruiter_profiles
  IF user_role = 'RECRUITER' THEN
    INSERT INTO public.recruiter_profiles (
      id,
      user_id,
      company_name,
      job_title,
      verified,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      NEW.id,
      COALESCE((NEW.raw_user_meta_data->>'company_name')::TEXT, 'Unknown Company'),
      COALESCE((NEW.raw_user_meta_data->>'job_title')::TEXT, 'Recruiter'),
      false, -- Recruiters need admin approval
      NOW(),
      NOW()
    )
    ON CONFLICT (user_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 2. Create trigger on auth.users
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 3. Create function to handle user updates
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_user_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Update email verification status
  UPDATE public.users
  SET 
    email_verified = NEW.email_confirmed_at IS NOT NULL,
    updated_at = NOW()
  WHERE id = NEW.id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 4. Create trigger for user updates
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;

CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  WHEN (OLD.email_confirmed_at IS DISTINCT FROM NEW.email_confirmed_at)
  EXECUTE FUNCTION public.handle_user_update();

-- ============================================
-- 5. Grant necessary permissions
-- ============================================
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO authenticated;

-- ============================================
-- 6. Create audit log function (optional)
-- ============================================
CREATE OR REPLACE FUNCTION public.log_user_creation()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.audit_logs (
    id,
    user_id,
    action,
    entity,
    entity_id,
    ip_address,
    user_agent,
    timestamp
  ) VALUES (
    gen_random_uuid(),
    NEW.id,
    'USER_REGISTERED',
    'User',
    NEW.id,
    '0.0.0.0', -- Will be updated by application
    'Supabase Auth',
    NOW()
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. Create audit trigger
-- ============================================
DROP TRIGGER IF EXISTS on_user_created_audit ON public.users;

CREATE TRIGGER on_user_created_audit
  AFTER INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.log_user_creation();

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these after creating a test user to verify the trigger works:

-- Check if user was created in users table
-- SELECT * FROM public.users ORDER BY created_at DESC LIMIT 5;

-- Check if profile was created
-- SELECT * FROM public.profiles ORDER BY created_at DESC LIMIT 5;

-- Check if candidate_profile was created
-- SELECT * FROM public.candidate_profiles ORDER BY created_at DESC LIMIT 5;

-- Check audit logs
-- SELECT * FROM public.audit_logs ORDER BY timestamp DESC LIMIT 10;

-- ============================================
-- NOTES
-- ============================================
-- 1. This trigger runs automatically when a user signs up via Supabase Auth
-- 2. It extracts metadata from raw_user_meta_data and populates Prisma tables
-- 3. Candidates get a candidate_profile, recruiters get a recruiter_profile
-- 4. All operations are logged in audit_logs for tracking
-- 5. The trigger is SECURITY DEFINER so it runs with elevated privileges
-- 6. Email verification status is synced automatically

-- ============================================
-- TROUBLESHOOTING
-- ============================================
-- If the trigger doesn't fire:
-- 1. Check if the trigger exists: SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
-- 2. Check function exists: SELECT * FROM pg_proc WHERE proname = 'handle_new_user';
-- 3. Check for errors in Supabase logs
-- 4. Verify table names match your Prisma schema (users, profiles, candidate_profiles)
-- 5. Ensure enum types exist: SELECT * FROM pg_type WHERE typname = 'UserRole';

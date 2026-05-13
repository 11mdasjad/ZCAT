/**
 * Profile API
 * Endpoints for fetching and updating user profile
 */

import { NextRequest } from 'next/server';
import prisma from '@/lib/prisma/client';
import { successResponse, errorResponse } from '@/lib/utils/response';
import { createClient } from '@/lib/supabase/server';
import { logger } from '@/lib/logger/logger';

/**
 * Map a role string (any casing) to the Prisma UserRole enum value.
 * Supabase may store lowercase ('candidate') while Prisma expects uppercase ('CANDIDATE').
 */
function normalizeRole(role: string | undefined | null): 'CANDIDATE' | 'ADMIN' | 'RECRUITER' | 'SUPER_ADMIN' {
  if (!role) return 'CANDIDATE';
  const upper = role.toUpperCase();
  if (upper === 'ADMIN' || upper === 'SUPER_ADMIN' || upper === 'RECRUITER') {
    return upper as 'ADMIN' | 'SUPER_ADMIN' | 'RECRUITER';
  }
  return 'CANDIDATE';
}

/**
 * Ensure the authenticated Supabase user has a corresponding record in the
 * Prisma `users` table (and associated profile / candidate_profile).
 * This handles the case where the DB trigger failed or was not installed.
 */
async function ensurePrismaUser(authUser: { id: string; email?: string; user_metadata?: Record<string, any> }) {
  const existing = await prisma.user.findUnique({ where: { id: authUser.id } });
  if (existing) return existing;

  const meta = authUser.user_metadata || {};
  const role = normalizeRole(meta.role);
  const name = meta.full_name || meta.name || authUser.email?.split('@')[0] || 'User';

  logger.info('Auto-creating Prisma user from Supabase auth', { userId: authUser.id, role });

  // Create user + profile + role-specific profile in a transaction
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: {
        id: authUser.id,
        email: authUser.email || '',
        name,
        role: role as any,
        emailVerified: true,
        isActive: true,
      },
    });

    // Create base profile
    await tx.profile.create({
      data: { userId: authUser.id },
    });

    // Create role-specific profile
    if (role === 'CANDIDATE') {
      await tx.candidateProfile.create({
        data: {
          userId: authUser.id,
          university: meta.university || null,
          graduationYear: meta.graduation_year ? parseInt(meta.graduation_year) : null,
          resumeUrl: meta.resume_url || null,
          skills: Array.isArray(meta.skills) ? meta.skills : [],
        },
      });
    } else if (role === 'RECRUITER') {
      await tx.recruiterProfile.create({
        data: {
          userId: authUser.id,
          companyName: meta.company_name || 'Unknown Company',
          jobTitle: meta.job_title || 'Recruiter',
        },
      });
    }

    return newUser;
  });

  return user;
}

/**
 * GET /api/v1/profile
 * Fetch current user's profile
 */
export async function GET(req: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return errorResponse(new Error('Authentication required'), 401);
    }

    // Ensure user exists in Prisma (auto-create if missing)
    await ensurePrismaUser(authUser);

    // Fetch user with profile data
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        isActive: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            bio: true,
            phone: true,
            location: true,
            timezone: true,
          },
        },
        candidateProfile: {
          select: {
            university: true,
            graduationYear: true,
            resumeUrl: true,
            skills: true,
            githubUrl: true,
            linkedinUrl: true,
            portfolioUrl: true,
          },
        },
        recruiterProfile: {
          select: {
            companyName: true,
            jobTitle: true,
            companySize: true,
            industry: true,
            website: true,
            verified: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse(new Error('User not found'), 404);
    }

    return successResponse(user);
  } catch (error) {
    logger.error('Error fetching profile:', error);
    return errorResponse(error as Error);
  }
}

/**
 * PATCH /api/v1/profile
 * Update current user's profile
 */
export async function PATCH(req: NextRequest) {
  try {
    // Get authenticated user
    const supabase = await createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return errorResponse(new Error('Authentication required'), 401);
    }

    // Ensure user exists in Prisma (auto-create if missing)
    await ensurePrismaUser(authUser);

    const body = await req.json();
    const {
      name,
      avatarUrl,
      bio,
      phone,
      location,
      timezone,
      university,
      graduationYear,
      skills,
      githubUrl,
      linkedinUrl,
      portfolioUrl,
      resumeUrl,
      companyName,
      jobTitle,
      companySize,
      industry,
      website,
    } = body;

    // Update user table
    const updateUserData: any = {};
    if (name !== undefined) updateUserData.name = name;
    if (avatarUrl !== undefined) updateUserData.avatarUrl = avatarUrl;

    let updatedUser;
    if (Object.keys(updateUserData).length > 0) {
      updatedUser = await prisma.user.update({
        where: { id: authUser.id },
        data: updateUserData,
      });
    }

    // Update profile table
    const updateProfileData: any = {};
    if (bio !== undefined) updateProfileData.bio = bio;
    if (phone !== undefined) updateProfileData.phone = phone;
    if (location !== undefined) updateProfileData.location = location;
    if (timezone !== undefined) updateProfileData.timezone = timezone;

    if (Object.keys(updateProfileData).length > 0) {
      await prisma.profile.upsert({
        where: { userId: authUser.id },
        update: updateProfileData,
        create: {
          userId: authUser.id,
          ...updateProfileData,
        },
      });
    }

    // Get user role to determine which profile to update
    const user = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: { role: true },
    });

    // Update candidate profile
    if (user?.role === 'CANDIDATE') {
      const updateCandidateData: any = {};
      if (university !== undefined) updateCandidateData.university = university;
      if (graduationYear !== undefined) updateCandidateData.graduationYear = graduationYear;
      if (skills !== undefined) updateCandidateData.skills = skills;
      if (githubUrl !== undefined) updateCandidateData.githubUrl = githubUrl;
      if (linkedinUrl !== undefined) updateCandidateData.linkedinUrl = linkedinUrl;
      if (portfolioUrl !== undefined) updateCandidateData.portfolioUrl = portfolioUrl;
      if (resumeUrl !== undefined) updateCandidateData.resumeUrl = resumeUrl;

      if (Object.keys(updateCandidateData).length > 0) {
        await prisma.candidateProfile.upsert({
          where: { userId: authUser.id },
          update: updateCandidateData,
          create: {
            userId: authUser.id,
            ...updateCandidateData,
          },
        });
      }
    }

    // Update recruiter profile
    if (user?.role === 'RECRUITER') {
      const updateRecruiterData: any = {};
      if (companyName !== undefined) updateRecruiterData.companyName = companyName;
      if (jobTitle !== undefined) updateRecruiterData.jobTitle = jobTitle;
      if (companySize !== undefined) updateRecruiterData.companySize = companySize;
      if (industry !== undefined) updateRecruiterData.industry = industry;
      if (website !== undefined) updateRecruiterData.website = website;

      if (Object.keys(updateRecruiterData).length > 0) {
        await prisma.recruiterProfile.upsert({
          where: { userId: authUser.id },
          update: updateRecruiterData,
          create: {
            userId: authUser.id,
            companyName: companyName || 'Unknown',
            jobTitle: jobTitle || 'Recruiter',
            ...updateRecruiterData,
          },
        });
      }
    }

    // Fetch updated profile
    const updatedProfile = await prisma.user.findUnique({
      where: { id: authUser.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        avatarUrl: true,
        profile: true,
        candidateProfile: true,
        recruiterProfile: true,
      },
    });

    logger.info('Profile updated', {
      userId: authUser.id,
      fields: Object.keys(body),
    });

    return successResponse(updatedProfile);
  } catch (error) {
    logger.error('Error updating profile:', error);
    return errorResponse(error as Error);
  }
}

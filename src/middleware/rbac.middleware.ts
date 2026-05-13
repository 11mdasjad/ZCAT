/**
 * Role-Based Access Control (RBAC) Middleware
 * Enforces permission-based access to resources
 */

import { NextRequest, NextResponse } from 'next/server';
import { ForbiddenError } from '@/lib/errors/app-error';
import { errorResponse } from '@/lib/utils/response';

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  RECRUITER = 'RECRUITER',
  CANDIDATE = 'CANDIDATE',
}

export enum Permission {
  // User Management
  USER_CREATE = 'user:create',
  USER_READ = 'user:read',
  USER_UPDATE = 'user:update',
  USER_DELETE = 'user:delete',
  
  // Assessment Management
  ASSESSMENT_CREATE = 'assessment:create',
  ASSESSMENT_READ = 'assessment:read',
  ASSESSMENT_UPDATE = 'assessment:update',
  ASSESSMENT_DELETE = 'assessment:delete',
  ASSESSMENT_PUBLISH = 'assessment:publish',
  
  // Question Management
  QUESTION_CREATE = 'question:create',
  QUESTION_READ = 'question:read',
  QUESTION_UPDATE = 'question:update',
  QUESTION_DELETE = 'question:delete',
  
  // Submission Management
  SUBMISSION_CREATE = 'submission:create',
  SUBMISSION_READ = 'submission:read',
  SUBMISSION_READ_ALL = 'submission:read:all',
  
  // Monitoring
  MONITORING_VIEW = 'monitoring:view',
  MONITORING_INTERVENE = 'monitoring:intervene',
  
  // Analytics
  ANALYTICS_VIEW = 'analytics:view',
  ANALYTICS_EXPORT = 'analytics:export',
  
  // System
  SYSTEM_CONFIG = 'system:config',
}

// Role-Permission mapping
const rolePermissions: Record<Role, Permission[]> = {
  [Role.SUPER_ADMIN]: Object.values(Permission), // All permissions
  
  [Role.ADMIN]: [
    Permission.USER_READ,
    Permission.USER_UPDATE,
    Permission.ASSESSMENT_CREATE,
    Permission.ASSESSMENT_READ,
    Permission.ASSESSMENT_UPDATE,
    Permission.ASSESSMENT_DELETE,
    Permission.ASSESSMENT_PUBLISH,
    Permission.QUESTION_CREATE,
    Permission.QUESTION_READ,
    Permission.QUESTION_UPDATE,
    Permission.QUESTION_DELETE,
    Permission.SUBMISSION_READ_ALL,
    Permission.MONITORING_VIEW,
    Permission.MONITORING_INTERVENE,
    Permission.ANALYTICS_VIEW,
    Permission.ANALYTICS_EXPORT,
  ],
  
  [Role.RECRUITER]: [
    Permission.ASSESSMENT_CREATE,
    Permission.ASSESSMENT_READ,
    Permission.ASSESSMENT_UPDATE,
    Permission.QUESTION_READ,
    Permission.SUBMISSION_READ_ALL,
    Permission.MONITORING_VIEW,
    Permission.ANALYTICS_VIEW,
  ],
  
  [Role.CANDIDATE]: [
    Permission.ASSESSMENT_READ,
    Permission.QUESTION_READ,
    Permission.SUBMISSION_CREATE,
    Permission.SUBMISSION_READ,
  ],
};

/**
 * Check if user has required role
 */
export function hasRole(userRole: string, requiredRoles: Role[]): boolean {
  return requiredRoles.includes(userRole as Role);
}

/**
 * Check if user has required permission
 */
export function hasPermission(userRole: string, requiredPermission: Permission): boolean {
  const role = userRole as Role;
  const permissions = rolePermissions[role] || [];
  return permissions.includes(requiredPermission);
}

/**
 * Check if user has any of the required permissions
 */
export function hasAnyPermission(userRole: string, requiredPermissions: Permission[]): boolean {
  return requiredPermissions.some(permission => hasPermission(userRole, permission));
}

/**
 * Check if user has all required permissions
 */
export function hasAllPermissions(userRole: string, requiredPermissions: Permission[]): boolean {
  return requiredPermissions.every(permission => hasPermission(userRole, permission));
}

/**
 * RBAC middleware factory - requires specific roles
 */
export function requireRoles(...roles: Role[]) {
  return (user: any): NextResponse | null => {
    if (!user) {
      return errorResponse(new ForbiddenError('Authentication required'));
    }

    if (!hasRole(user.role, roles)) {
      return errorResponse(
        new ForbiddenError(
          `Access denied. Required roles: ${roles.join(', ')}`
        )
      );
    }

    return null; // No error, access granted
  };
}

/**
 * RBAC middleware factory - requires specific permission
 */
export function requirePermission(permission: Permission) {
  return (user: any): NextResponse | null => {
    if (!user) {
      return errorResponse(new ForbiddenError('Authentication required'));
    }

    if (!hasPermission(user.role, permission)) {
      return errorResponse(
        new ForbiddenError(
          `Access denied. Required permission: ${permission}`
        )
      );
    }

    return null; // No error, access granted
  };
}

/**
 * RBAC middleware factory - requires any of the permissions
 */
export function requireAnyPermission(...permissions: Permission[]) {
  return (user: any): NextResponse | null => {
    if (!user) {
      return errorResponse(new ForbiddenError('Authentication required'));
    }

    if (!hasAnyPermission(user.role, permissions)) {
      return errorResponse(
        new ForbiddenError(
          `Access denied. Required permissions: ${permissions.join(' OR ')}`
        )
      );
    }

    return null; // No error, access granted
  };
}

/**
 * Check if user owns resource
 */
export function isResourceOwner(userId: string, resourceOwnerId: string): boolean {
  return userId === resourceOwnerId;
}

/**
 * Require resource ownership or admin role
 */
export function requireOwnershipOrAdmin(user: any, resourceOwnerId: string): NextResponse | null {
  if (!user) {
    return errorResponse(new ForbiddenError('Authentication required'));
  }

  const isOwner = isResourceOwner(user.id, resourceOwnerId);
  const isAdmin = hasRole(user.role, [Role.ADMIN, Role.SUPER_ADMIN]);

  if (!isOwner && !isAdmin) {
    return errorResponse(
      new ForbiddenError('You do not have permission to access this resource')
    );
  }

  return null;
}

/**
 * Admin-only middleware
 */
export const requireAdmin = requireRoles(Role.ADMIN, Role.SUPER_ADMIN);

/**
 * Recruiter or Admin middleware
 */
export const requireRecruiterOrAdmin = requireRoles(
  Role.RECRUITER,
  Role.ADMIN,
  Role.SUPER_ADMIN
);

/**
 * Candidate-only middleware
 */
export const requireCandidate = requireRoles(Role.CANDIDATE);

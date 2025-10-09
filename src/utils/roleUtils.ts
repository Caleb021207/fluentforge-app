/**
 * Role Management Utilities
 * 
 * SECURITY CRITICAL: This file provides utilities for role-based access control.
 * 
 * ⚠️ IMPORTANT: Always use these utilities instead of directly querying profiles.role
 * 
 * Architecture:
 * - Authorization: user_roles table + has_role() function (SECURE)
 * - Display: profiles.role field (READ-ONLY, cosmetic only)
 */

import { supabase } from "@/integrations/supabase/client";

/**
 * App roles available in the system
 * Matches the app_role enum in the database
 * Note: The RPC function types may show legacy role names until types refresh
 */
export type AppRole = 'admin' | 'moderator' | 'user';

/**
 * Legacy role types from profiles.role (display only)
 * @deprecated Use AppRole for authorization checks
 */
export type LegacyRole = 'student' | 'teacher' | 'admin' | 'district';

/**
 * Check if a user has a specific role (SECURE METHOD)
 * 
 * This function calls the database's has_role() security definer function,
 * which checks the user_roles table for authorization.
 * 
 * ✅ USE THIS for all authorization decisions
 * 
 * @param userId - The user's UUID
 * @param role - The role to check
 * @returns Promise<boolean> - True if user has the role
 * 
 * @example
 * ```typescript
 * const isAdmin = await hasRole(user.id, 'admin');
 * if (isAdmin) {
 *   // Grant admin access
 * }
 * ```
 */
export const hasRole = async (userId: string, role: AppRole): Promise<boolean> => {
  try {
    const { data, error } = await supabase.rpc('has_role', {
      _user_id: userId,
      _role: role as any // Type assertion needed until Supabase types refresh
    });

    if (error) {
      console.error('Error checking user role:', error);
      return false;
    }

    return data === true;
  } catch (error) {
    console.error('Error in hasRole:', error);
    return false;
  }
};

/**
 * Check if current authenticated user has a specific role
 * 
 * @param role - The role to check
 * @returns Promise<boolean> - True if current user has the role
 * 
 * @example
 * ```typescript
 * const canAccessAdmin = await currentUserHasRole('admin');
 * ```
 */
export const currentUserHasRole = async (role: AppRole): Promise<boolean> => {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  return hasRole(user.id, role);
};

/**
 * Get display role from profiles table (DISPLAY ONLY)
 * 
 * ⚠️ WARNING: DO NOT use this for authorization!
 * This is for UI display purposes only (e.g., showing "Teacher" badge)
 * 
 * @param userId - The user's UUID
 * @returns Promise<string | null> - Display role or null
 * 
 * @example
 * ```typescript
 * const displayRole = await getDisplayRole(user.id);
 * return <Badge>{displayRole}</Badge>; // UI display only
 * ```
 */
export const getDisplayRole = async (userId: string): Promise<LegacyRole | null> => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    if (error || !data) {
      return null;
    }

    return data.role as LegacyRole;
  } catch (error) {
    console.error('Error fetching display role:', error);
    return null;
  }
};

/**
 * Check multiple roles at once
 * 
 * @param userId - The user's UUID
 * @param roles - Array of roles to check
 * @returns Promise<boolean> - True if user has ANY of the roles
 * 
 * @example
 * ```typescript
 * const canModerate = await hasAnyRole(user.id, ['admin', 'moderator']);
 * ```
 */
export const hasAnyRole = async (userId: string, roles: AppRole[]): Promise<boolean> => {
  const checks = await Promise.all(
    roles.map(role => hasRole(userId, role))
  );
  
  return checks.some(hasRole => hasRole === true);
};

/**
 * Check if user has all specified roles
 * 
 * @param userId - The user's UUID
 * @param roles - Array of roles to check
 * @returns Promise<boolean> - True if user has ALL of the roles
 * 
 * @example
 * ```typescript
 * const isSuperUser = await hasAllRoles(user.id, ['admin', 'moderator']);
 * ```
 */
export const hasAllRoles = async (userId: string, roles: AppRole[]): Promise<boolean> => {
  const checks = await Promise.all(
    roles.map(role => hasRole(userId, role))
  );
  
  return checks.every(hasRole => hasRole === true);
};

/**
 * Role check hook for React components
 * 
 * @deprecated Use the useUserRole hook from @/hooks/useUserRole instead
 * This is kept for reference only
 */
export const roleCheckExample = `
// Example: Use in React component
import { useEffect, useState } from 'react';
import { currentUserHasRole } from '@/utils/roleUtils';

function AdminPanel() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkRole = async () => {
      const hasAdminRole = await currentUserHasRole('admin');
      setIsAdmin(hasAdminRole);
      setLoading(false);
    };
    
    checkRole();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (!isAdmin) return <div>Access Denied</div>;
  
  return <div>Admin Panel Content</div>;
}
`;

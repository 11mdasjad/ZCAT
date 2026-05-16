import { create } from 'zustand';
import { User } from '@/types/user';
import { createClient } from '@/lib/supabase/client';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setUser: (user: User | null) => void;
  setLoading: (isLoading: boolean) => void;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
}

/**
 * Build a User object from a Prisma `users` table row.
 * Falls back to Supabase auth metadata if the Prisma row is missing fields.
 */
function buildUserFromRow(
  row: Record<string, any>,
  authUser?: { id: string; email?: string; user_metadata?: Record<string, any> }
): User {
  const meta = authUser?.user_metadata || {};
  // Aggressively prioritize Google/OAuth metadata over the database row
  const rawName = meta.full_name || meta.name || (row.name && row.name !== 'User' ? row.name : null) || authUser?.email?.split('@')[0] || 'User';
  const finalAvatar = meta.avatar_url || meta.picture || row.avatar_url || undefined;
  
  return {
    id: row.id || authUser?.id || '',
    name: rawName,
    email: row.email || authUser?.email || '',
    role: (row.role || meta.role || 'candidate').toLowerCase() as User['role'],
    avatar: finalAvatar,
    company: row.company_name || undefined,
    college: row.university || undefined,
    skills: row.skills || undefined,
    bio: row.bio || undefined,
    joinedAt: row.created_at || new Date().toISOString(),
  };
}

async function fetchUserData(
  supabase: ReturnType<typeof createClient>,
  authUser: { id: string; email?: string; user_metadata?: Record<string, any> }
): Promise<User | null> {
  try {
    // 1. Try to fetch from our secure backend API (bypasses RLS issues)
    const response = await fetch('/api/v1/profile');
    if (response.ok) {
      const data = await response.json();
      const profile = data.data;
      if (profile) {
        return {
          id: profile.id,
          name: profile.name && profile.name !== 'User' ? profile.name : (authUser.user_metadata?.full_name || authUser.email?.split('@')[0] || 'User'),
          email: profile.email,
          role: profile.role.toLowerCase() as User['role'],
          avatar: profile.avatarUrl || authUser.user_metadata?.avatar_url || authUser.user_metadata?.picture || undefined,
          company: profile.recruiterProfile?.companyName,
          college: profile.candidateProfile?.university,
          skills: profile.candidateProfile?.skills,
          bio: profile.profile?.bio,
          joinedAt: profile.createdAt,
        };
      }
    }
  } catch (err) {
    console.error('Failed to fetch from profile API:', err);
  }

  // 2. Fallback if API fails (e.g. network error)
  return buildUserFromRow({}, authUser);
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  setUser: (user) => set({ user, isAuthenticated: !!user, isLoading: false }),
  setLoading: (isLoading) => set({ isLoading }),
  logout: async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },
  initialize: async () => {
    const supabase = createClient();
    
    // Check active session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (session?.user) {
      const user = await fetchUserData(supabase, session.user);
      if (user) {
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ user: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }

    // Set up listener for auth changes (e.g., login in another tab)
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_OUT') {
        set({ user: null, isAuthenticated: false });
      } else if (event === 'SIGNED_IN' && session?.user) {
        const user = await fetchUserData(supabase, session.user);
        if (user) {
          set({ user, isAuthenticated: true, isLoading: false });
        }
      }
    });
  }
}));

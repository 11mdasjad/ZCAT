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
  return {
    id: row.id ?? authUser?.id ?? '',
    name: row.name ?? meta.full_name ?? meta.name ?? authUser?.email?.split('@')[0] ?? 'User',
    email: row.email ?? authUser?.email ?? '',
    role: (row.role ?? meta.role ?? 'candidate').toLowerCase() as User['role'],
    avatar: row.avatar_url ?? undefined,
    company: row.company_name ?? undefined,
    college: row.university ?? undefined,
    skills: row.skills ?? undefined,
    bio: row.bio ?? undefined,
    joinedAt: row.created_at ?? new Date().toISOString(),
  };
}

/**
 * Try fetching the user from the Prisma `users` table first.
 * If not found (e.g. trigger didn't fire), fall back to Supabase auth metadata.
 */
async function fetchUserData(
  supabase: ReturnType<typeof createClient>,
  authUser: { id: string; email?: string; user_metadata?: Record<string, any> }
): Promise<User | null> {
  // Try the Prisma `users` table first (mapped as "users" in the DB)
  const { data: userRow, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (userRow && !error) {
    return buildUserFromRow(userRow, authUser);
  }

  // Fallback: build from Supabase auth metadata directly
  // This covers the case where the DB trigger hasn't created the user yet
  const meta = authUser.user_metadata || {};
  return {
    id: authUser.id,
    name: meta.full_name || meta.name || authUser.email?.split('@')[0] || 'User',
    email: authUser.email || '',
    role: ((meta.role || 'candidate') as string).toLowerCase() as User['role'],
    avatar: meta.avatar_url,
    company: meta.company_name,
    college: meta.university,
    skills: meta.skills,
    bio: meta.bio,
    joinedAt: new Date().toISOString(),
  };
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

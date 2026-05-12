import { create } from 'zustand';
import { User, Role } from '@/types/user';

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, role: Role) => void;
  logout: () => void;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  login: (email: string, _password: string, role: Role) => {
    set({ isLoading: true });
    // Simulate login
    setTimeout(() => {
      set({
        user: {
          id: '1',
          name: role === 'admin' ? 'Admin User' : 'Asjad Ahmed',
          email,
          role,
          skills: ['React', 'TypeScript', 'Python'],
          bio: 'Full-stack developer',
          joinedAt: new Date().toISOString(),
        },
        isAuthenticated: true,
        isLoading: false,
      });
    }, 800);
  },
  logout: () => set({ user: null, isAuthenticated: false }),
  setUser: (user) => set({ user, isAuthenticated: true }),
}));

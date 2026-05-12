export type Role = 'candidate' | 'admin' | 'recruiter' | 'college';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  company?: string;
  college?: string;
  skills?: string[];
  bio?: string;
  joinedAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

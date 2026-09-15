import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  profileName?: string;
  childrenAges?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => void;
}

export const useAuthStore = create<AuthState>((set, _get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isLoading: true,
  isAuthenticated: false,

  login: (user, accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    localStorage.setItem('user', JSON.stringify(user));
    set({
      user,
      accessToken,
      refreshToken,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  setLoading: (loading) => {
    set({ isLoading: loading });
  },

  hydrate: () => {
    if (typeof window !== 'undefined') {
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      const userStr = localStorage.getItem('user');

      if (accessToken && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({
            accessToken,
            refreshToken,
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch {
          set({ isLoading: false });
        }
      } else {
        // Auto-login with demo user for testing
        const demoUser: User = {
          id: 'demo-user-001',
          email: 'demo@withdkis.com',
          profileName: '데모 사용자',
          childrenAges: [5, 8, 10],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const demoToken = 'demo-token-' + Math.random().toString(36).substring(7);
        localStorage.setItem('accessToken', demoToken);
        localStorage.setItem('refreshToken', demoToken);
        localStorage.setItem('user', JSON.stringify(demoUser));
        set({
          user: demoUser,
          accessToken: demoToken,
          refreshToken: demoToken,
          isAuthenticated: true,
          isLoading: false,
        });
      }
    }
  },
}));

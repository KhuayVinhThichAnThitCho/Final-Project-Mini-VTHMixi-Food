import { create } from 'zustand';

interface UserState {
  id: string;
  name: string;
  email: string;
  role: string;
  points?: number;
  phone?: string;
  avatar?: string;
}

interface AuthStore {
  user: UserState | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  showAuthModal: boolean;
  authModalRedirectPath: string | null;
  setUser: (user: UserState | null) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  clearAuth: () => void;
  setShowAuthModal: (show: boolean, redirectPath?: string | null) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  accessToken: localStorage.getItem('accessToken'),
  refreshToken: localStorage.getItem('refreshToken'),
  isAuthenticated: !!localStorage.getItem('accessToken'),
  showAuthModal: false,
  authModalRedirectPath: null,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  
  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ accessToken, refreshToken, isAuthenticated: true });
  },

  clearAuth: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },

  setShowAuthModal: (show, redirectPath = null) => set({ 
    showAuthModal: show, 
    authModalRedirectPath: redirectPath 
  }),
}));
export default useAuthStore;

import { create } from 'zustand';

export interface DashboardProfile {
  id: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

interface AuthState {
  currentUser: DashboardProfile | null;
  isInitialized: boolean;
  isLoading: boolean; // 1. Added property type here
  setAuth: (user: DashboardProfile | null) => void;
  clearAuth: () => void;
  setLoading: (isLoading: boolean) => void; 
}

export const useAuthStore = create<AuthState>((set) => ({
  currentUser: null,
  isInitialized: false,
  isLoading: false, // 2. Added initial state value here
  setAuth: (user) => set({ currentUser: user, isInitialized: true }),
  clearAuth: () => set({ currentUser: null, isInitialized: true }),
  setLoading: (isLoading) => set({ isLoading }), // This is now perfectly valid!
}));
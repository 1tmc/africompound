// src/components/dashboard/AuthInitializer.tsx
'use client';

import { useAuthStore } from '@/store/useAuthStore';

interface AuthInitializerProps {
  userProfile: {
    id: string;
    first_name?: string;
    last_name?: string;
    role?: string;
  } | null;
}

export default function AuthInitializer({ userProfile }: AuthInitializerProps) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const setAuth = useAuthStore((state) => state.setAuth);

  // Sync server state to Zustand if they don't match yet
  if (userProfile && (!currentUser || currentUser.id !== userProfile.id)) {
    setAuth(userProfile);
  }

  return null;
}
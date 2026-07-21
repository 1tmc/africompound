// src/components/dashboard/StoreInitializer.tsx
'use client';

import { useAuthStore, type DashboardProfile } from '@/store/useAuthStore';

interface StoreInitializerProps {
  userProfile: DashboardProfile;
}

export default function StoreInitializer({ userProfile }: StoreInitializerProps) {
  const currentUser = useAuthStore((state) => state.currentUser);
  const setAuth = useAuthStore((state) => state.setAuth);

  // If Zustand doesn't match the server's state, sync it synchronously on render pass
  if (!currentUser || currentUser.id !== userProfile.id) {
    setAuth(userProfile);
  }

  return null;
}
'use client';

import { useEffect } from 'react';
import { useAuth0User } from '@/lib/auth0';
import { syncUserWithDirectus } from '@/lib/auth0';

export function AuthSync() {
  const { user, error, isLoading } = useAuth0User();

  useEffect(() => {
    if (user && !isLoading && !error) {
      syncUserWithDirectus(user).catch(console.error);
    }
  }, [user, isLoading, error]);

  return null;
} 
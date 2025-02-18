'use client';

import { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import type { Auth0Role } from '@/lib/services/Auth0ManagementService';

interface SyncResponse {
  isNew?: boolean;
  userId?: string | null;
  auth0Roles?: Auth0Role[];
  directusRoleId?: string | null;
  stripeCustomerId?: string | null;
  error?: string;
  details?: string;
}

export function AuthSync() {
  const { user, error, isLoading } = useUser();

  useEffect(() => {
    if (user && !isLoading && !error) {
      fetch('/api/auth/sync')
        .then(response => response.json())
        .then((data: SyncResponse) => {
          if (data.error) {
            console.error('Sync error:', data.error, data.details);
          } else {
            console.log('User synced:', {
              isNew: data.isNew,
              hasUserId: !!data.userId,
              hasStripeId: !!data.stripeCustomerId,
              roles: data.auth0Roles?.map(r => r.name)
            });
          }
        })
        .catch(console.error);
    }
  }, [user, isLoading, error]);

  return null;
} 
/**
 * AuthSync Component
 * 
 * This component handles the client-side synchronization between Auth0 and Directus users.
 * It ensures that authenticated users have corresponding Directus accounts.
 * 
 * Flow:
 * 1. Monitors Auth0 session state using useUser hook
 * 2. When a user is authenticated and has an email:
 *    - Calls the /api/auth/sync endpoint
 *    - Creates Directus user if doesn't exist
 *    - Logs the synchronization status
 * 3. Runs only when user state or loading state changes
 * 
 * Note: This component is mounted in the root layout to ensure
 * user synchronization happens on every page load if needed.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import type { Auth0Role } from '@/lib/services/Auth0ManagementService';
import { useUserSyncStore } from '@/lib/stores/userSyncStore';
import { useToast } from '@/hooks/use-toast';

interface SyncResponse {
  isNew?: boolean;
  userId?: string | null;
  auth0Roles?: Auth0Role[];
  directusRoleId?: string | null;
  stripeCustomerId?: string | null;
  error?: string;
  details?: string;
}

interface SyncState {
  isLoading: boolean;
  error: string | null;
  lastSynced: number | null;
}

export function AuthSync() {
  const { user, error: auth0Error, isLoading: auth0Loading } = useUser();
  const [syncState, setSyncState] = useState<SyncState>({
    isLoading: false,
    error: null,
    lastSynced: null
  });
  const { shouldSync, setLastSyncTime } = useUserSyncStore();
  const { toast } = useToast();

  const handleSyncError = useCallback((error: string) => {
    if (syncState.error !== error) {
      toast({
        title: "Sync Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [toast, syncState.error]);

  useEffect(() => {
    const performSync = async () => {
      if (!user?.email || auth0Loading || auth0Error) return;

      // Check if we need to sync based on the user's Directus ID
      const directusUserId = user.directusUserId as string | undefined;
      if (directusUserId && !shouldSync(directusUserId)) {
        console.log('Skipping sync - within cache period:', {
          email: user.email,
          directusUserId,
          stripeCustomerId: user.app_metadata?.stripe_customer_id
        });
        return;
      }

      setSyncState(prev => ({ ...prev, isLoading: true, error: null }));

      try {
        const response = await fetch('/api/auth/sync');
        const data: SyncResponse = await response.json();

        if (data.error) {
          throw new Error(data.error);
        }

        if (data.userId) {
          setLastSyncTime(data.userId);
          setSyncState(prev => ({
            ...prev,
            lastSynced: Date.now(),
            error: null
          }));

          // Show success toast for new users
          if (data.isNew) {
            toast({
              title: "Account Created",
              description: "Your account has been successfully set up.",
            });
          }

          console.log('User synced successfully:', {
            isNew: data.isNew,
            hasUserId: !!data.userId,
            hasStripeId: !!data.stripeCustomerId,
            roles: data.auth0Roles?.map(r => r.name)
          });
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error during sync';
        console.error('Sync error:', errorMessage);
        setSyncState(prev => ({
          ...prev,
          error: errorMessage
        }));
        handleSyncError(errorMessage);
      } finally {
        setSyncState(prev => ({ ...prev, isLoading: false }));
      }
    };

    performSync();
  }, [user, auth0Loading, auth0Error, shouldSync, setLastSyncTime, handleSyncError, toast]);

  // Don't render anything - this is a background process
  return null;
} 
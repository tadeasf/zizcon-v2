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

import { useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0';

export function AuthSync() {
  const { user, isLoading } = useUser();

  useEffect(() => {
    // Only try to sync if we have a user and they have an email
    if (!isLoading && user?.email) {
      fetch('/api/auth/sync')
        .then(response => response.json())
        .then(data => {
          if (data.isNew) {
          } else if (data.userId) {
          }
        })
        .catch(error => {
          console.error('AuthSync: Error syncing user:', error);
        });
    }
  }, [user, isLoading]); // Only run when user or loading state changes

  return null;
} 
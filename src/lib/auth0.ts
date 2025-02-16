/**
 * Auth0 to Directus User Synchronization Flow
 * 
 * This module handles the synchronization of users between Auth0 and Directus.
 * The flow works as follows:
 * 
 * 1. User Authentication:
 *    - User logs in through Auth0
 *    - Auth0 handles the OAuth flow and creates a session
 * 
 * 2. Initial Sync (handleAuth0AfterCallback):
 *    - Triggered automatically after successful Auth0 login
 *    - Calls syncUserWithDirectus to ensure user exists in Directus
 *    - Updates the session with Directus user ID
 * 
 * 3. Subsequent Visits:
 *    - AuthSync component checks for existing session
 *    - If user exists but isn't in Directus, creates new Directus user
 *    - Maintains the link between Auth0 and Directus users
 */

import { Auth0Client } from '@auth0/nextjs-auth0/server';
import { directus } from './directus';
import { createUser, readUsers } from '@directus/sdk';
import type { SessionData as Session } from '@auth0/nextjs-auth0/types';

const getAuth0Config = () => {
  return {
    domain: process.env.AUTH0_DOMAIN!,
    clientId: process.env.AUTH0_CLIENT_ID!,
    clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    appBaseUrl: process.env.NEXT_PUBLIC_APP_URL!,
    routes: {
      callback: '/auth/callback',
      login: '/auth/login',
      logout: '/auth/logout',
    },
    authorizationParameters: {
      response_type: 'code',
      scope: 'openid profile email',
      audience: process.env.AUTH0_MGMT_IDENTIFIER!,
    },
    session: {
      absoluteDuration: 24 * 60 * 60, // 24 hours
      rolling: true,
      rollingDuration: 3 * 60 * 60, // 3 hours
    },
    httpTimeout: 60000, // 60 seconds
  };
};

export const auth0 = new Auth0Client(getAuth0Config());

// Export a function to get the Auth0 client instance
export const getAuth0Client = () => auth0;

interface DirectusError {
  message: string;
  errors?: Array<{ message: string; extensions?: unknown }>;
  response?: {
    data?: unknown;
    status?: number;
  };
}

/**
 * Synchronizes an Auth0 user with Directus
 * 
 * @param session - The Auth0 session data containing user information
 * @returns Object containing the Directus user ID and whether it's a new user
 * 
 * This function:
 * 1. Checks if user exists in Directus using their email
 * 2. If found, returns existing user ID
 * 3. If not found, creates new Directus user with Auth0 data
 * 4. Handles errors and provides detailed logging
 */
export async function syncUserWithDirectus(session: Session | null): Promise<{ userId: string | null; isNew: boolean }> {
  if (!session?.user?.email) {
    console.log('No email in session');
    return { userId: null, isNew: false };
  }

  try {
    // Set the static token for authentication
    directus.setToken(process.env.DIRECTUS_STATIC_TOKEN!);

    // Check if user already exists
    const existingUsers = await directus.request(
      readUsers({
        filter: { email: { _eq: session.user.email } },
        fields: ['id', 'role']
      })
    );

    if (existingUsers && existingUsers.length > 0) {
      return {
        userId: existingUsers[0].id,
        isNew: false
      };
    }

    // Create new user with minimal required fields
    const newUser = await directus.request(
      createUser({
        email: session.user.email,
        password: crypto.randomUUID(), // Random password since we're using Auth0
        role: "ecd5f898-308d-4cb2-b6e2-f15b6c0d6089", // regular role ID
        status: "active",
        provider: "auth0",
        external_identifier: session.user.sub,
        first_name: session.user.given_name || "",
        last_name: session.user.family_name || "",
      })
    );

    return {
      userId: newUser?.id || null,
      isNew: true
    };
  } catch (error) {
    const directusError = error as DirectusError;
    console.error("Directus error details:", {
      message: directusError.message,
      errors: directusError.errors,
      response: directusError.response?.data,
      status: directusError.response?.status
    });
    throw error;
  }
}

/**
 * Handles the Auth0 callback after successful authentication
 * 
 * @param session - The Auth0 session data
 * @returns Updated session with Directus user ID
 * 
 * This function:
 * 1. Syncs the authenticated user with Directus
 * 2. Adds the Directus user ID to the session
 * 3. Ensures the connection between Auth0 and Directus users
 */
export const handleAuth0AfterCallback = async (session: Session): Promise<Session> => {
  try {
    const { userId } = await syncUserWithDirectus(session);
    
    if (userId) {
      return {
        ...session,
        directusUserId: userId,
        user: {
          ...session.user,
          directusUserId: userId,
        }
      };
    }
    
    return session;
  } catch (error) {
    console.error('Error in handleAuth0AfterCallback:', error);
    return session;
  }
};

export interface Auth0User {
  email?: string;
  given_name?: string;
  family_name?: string;
  sub?: string;
}

export const getUserInfo = async (accessToken: string): Promise<Auth0User | null> => {
  try {
    const response = await fetch(`https://${process.env.AUTH0_DOMAIN}/userinfo`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    const userInfo = await response.json();
    return userInfo as Auth0User;
  } catch (error) {
    console.error('Error fetching user info:', error);
    return null;
  }
};

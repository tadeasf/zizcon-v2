import { NextResponse } from 'next/server';
import { Auth0ManagementService } from '@/lib/services/Auth0ManagementService';
import { UserSyncService } from '@/lib/services/UserSyncService';
import { getAuth0Client } from '@/lib/auth0';

// Initialize the Auth0 Management Service
const auth0ManagementService = new Auth0ManagementService(
  process.env.AUTH0_DOMAIN!,
  process.env.AUTH0_CLIENT_ID!,
  process.env.AUTH0_CLIENT_SECRET!,
  process.env.AUTH0_MGMT_IDENTIFIER!
);

// Initialize the User Sync Service
const userSyncService = new UserSyncService(auth0ManagementService);

export async function GET() {
  try {
    const auth0Client = getAuth0Client();
    const user = await auth0Client.getUser();
    
    if (!user?.email) {
      return NextResponse.json(
        { error: 'No authenticated user found' },
        { status: 401 }
      );
    }

    console.log('User:', {
      email: user.email,
      hasUser: !!user
    });

    // Get full user details including roles
    const userDetails = await auth0ManagementService.getFullUserDetails(user.email);

    // If we have a Directus user ID in the session, sync the roles
    if (user.directusUserId) {
      await userSyncService.syncUserRoles(user.email, user.directusUserId);
    }

    return NextResponse.json({
      user: userDetails.auth0User,
      roles: userDetails.auth0Roles,
      directusRoleId: userDetails.directusRoleId
    });
  } catch (error) {
    console.error('Management API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch user details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

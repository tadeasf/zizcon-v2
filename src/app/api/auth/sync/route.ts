/**
 * Auth Sync API Endpoint
 * 
 * This endpoint handles the synchronization of Auth0 users with Directus.
 * It's called by the client-side AuthSync component to ensure users exist in both systems
 * and their roles are synchronized.
 * 
 * Flow:
 * 1. Gets the current Auth0 session
 * 2. Uses syncUserWithDirectus to:
 *    - Check if user exists in Directus
 *    - Create new user if needed
 * 3. Uses UserSyncService to:
 *    - Sync roles between Auth0 and Directus
 * 4. Returns the sync result with user ID and sync status
 * 
 * Error Handling:
 * - Returns 401 if sync fails or no user found
 * - Returns 500 for other errors with details
 * - Logs all errors for debugging
 */

import { NextResponse } from "next/server";
import { auth0, syncUserWithDirectus } from "@/lib/auth0";
import { Auth0ManagementService } from "@/lib/services/Auth0ManagementService";
import { UserSyncService } from "@/lib/services/UserSyncService";
import { ApiTrackingService, ApiSource } from "@/lib/services/ApiTrackingService";

export const dynamic = "force-dynamic";

// Initialize services
const auth0ManagementService = new Auth0ManagementService(
  process.env.AUTH0_DOMAIN!,
  process.env.AUTH0_CLIENT_ID!,
  process.env.AUTH0_CLIENT_SECRET!,
  process.env.AUTH0_MGMT_IDENTIFIER!
);

const userSyncService = new UserSyncService(auth0ManagementService);

export async function GET() {
  let apiTracker: ApiTrackingService | null = null;
  
  try {
    // Initialize API tracker
    apiTracker = await ApiTrackingService.getInstance();
    await apiTracker.trackApiCall(ApiSource.NEXTJS_API);

    const session = await auth0.getSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "No authenticated user found" },
        { status: 401 }
      );
    }

    // First ensure user exists in Directus
    const result = await syncUserWithDirectus(session);
    
    if (!result.userId) {
      return NextResponse.json(
        { error: "Failed to sync user" },
        { status: 401 }
      );
    }

    // Then sync roles regardless of whether the user is new or existing
    await userSyncService.syncUserRoles(session.user.email, result.userId);

    // Get the latest user details after sync
    const userDetails = await auth0ManagementService.getFullUserDetails(session.user.email);

    return NextResponse.json({
      ...result,
      auth0Roles: userDetails.auth0Roles,
      directusRoleId: userDetails.directusRoleId
    });
  } catch (error) {
    console.error("Error in sync endpoint:", error);
    return NextResponse.json(
      { 
        error: "An error occurred while syncing user",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
} 
/**
 * Auth Sync API Endpoint
 * 
 * This endpoint handles the synchronization of Auth0 users with Directus.
 * It's called by the client-side AuthSync component to ensure users exist in both systems.
 * 
 * Flow:
 * 1. Gets the current Auth0 session
 * 2. Uses syncUserWithDirectus to:
 *    - Check if user exists in Directus
 *    - Create new user if needed
 * 3. Returns the sync result with user ID and creation status
 * 
 * Error Handling:
 * - Returns 401 if sync fails or no user found
 * - Returns 500 for other errors with details
 * - Logs all errors for debugging
 */

import { NextResponse } from "next/server";
import { auth0, syncUserWithDirectus } from "@/lib/auth0";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await auth0.getSession();
    const result = await syncUserWithDirectus(session);
    
    if (!result.userId) {
      return NextResponse.json(
        { error: "Failed to sync user" },
        { status: 401 }
      );
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in sync endpoint:", error);
    return NextResponse.json(
      { error: "An error occurred while syncing user" },
      { status: 500 }
    );
  }
} 
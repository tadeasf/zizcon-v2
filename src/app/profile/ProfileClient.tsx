'use client';

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import type { SessionData as Session } from "@auth0/nextjs-auth0/types";

interface ProfileClientProps {
  session: Session;
}

export function ProfileClient({ session }: ProfileClientProps) {
  const [userDetails, setUserDetails] = useState('');
  const [syncDetails, setSyncDetails] = useState('');

  const testManagementApi = async () => {
    try {
      const response = await fetch('/api/auth/mgmt');
      const data = await response.json();
      setUserDetails(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error fetching management API data:', error);
      setUserDetails('Error fetching user details. Check console for errors.');
    }
  };

  const testRoleSync = async () => {
    try {
      const response = await fetch('/api/auth/sync');
      const data = await response.json();
      setSyncDetails(JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error syncing roles:', error);
      setSyncDetails('Error syncing roles. Check console for errors.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">User Profile</h1>
        
        <div className="grid gap-6">
          {/* User Profile Card */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Your basic profile information and settings</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              {session.user.picture && (
                <div className="relative h-32 w-32">
                  <Image
                    src={session.user.picture}
                    alt={session.user.name || "Profile"}
                    fill
                    className="rounded-full object-cover"
                  />
                </div>
              )}
              <div className="text-center text-lg">
                {session.user.email}
              </div>
              <Button
                variant="outline"
                asChild
                className="w-full max-w-sm"
              >
                <a href={`https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/dbconnections/change_password?client_id=${process.env.AUTH0_CLIENT_ID}&email=${encodeURIComponent(session.user.email || '')}&connection=Username-Password-Authentication`}>
                  Change Password
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Management API Test Card */}
          <Card>
            <CardHeader>
              <CardTitle>Auth0 Management API Test</CardTitle>
              <CardDescription>View your complete user details and roles from Auth0</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testManagementApi}>
                Fetch User Details
              </Button>
              <Textarea
                value={userDetails}
                readOnly
                className="font-mono h-[200px]"
                placeholder="Click 'Fetch User Details' to view your Auth0 information..."
              />
            </CardContent>
          </Card>

          {/* Role Sync Test Card */}
          <Card>
            <CardHeader>
              <CardTitle>Role Synchronization Test</CardTitle>
              <CardDescription>Test the synchronization of roles between Auth0 and Directus</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button onClick={testRoleSync}>
                Test Role Sync
              </Button>
              <Textarea
                value={syncDetails}
                readOnly
                className="font-mono h-[200px]"
                placeholder="Click 'Test Role Sync' to check role synchronization..."
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 
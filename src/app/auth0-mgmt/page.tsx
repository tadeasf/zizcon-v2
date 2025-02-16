import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ManagementApiTest } from "./ManagementApiTest";

export default async function Auth0ManagementPage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Auth0 Management API Test</h1>
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Session User</CardTitle>
            <CardDescription>Information from your current Auth0 session</CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded overflow-auto">
              {JSON.stringify(session.user, null, 2)}
            </pre>
          </CardContent>
        </Card>

        <ManagementApiTest />
      </div>
    </div>
  );
}

import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import Image from "next/image";

export default async function ProfilePage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/api/auth/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-bold">Profile</h1>
      <div className="rounded-lg border p-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">User Information</h2>
            <div className="grid gap-2">
              <div>
                <span className="font-medium">Name:</span> {session.user.name}
              </div>
              <div>
                <span className="font-medium">Email:</span> {session.user.email}
              </div>
              {session.user.picture && (
                <div>
                  <span className="font-medium">Picture:</span>
                  <div className="mt-2 relative h-20 w-20">
                    <Image
                      src={session.user.picture}
                      alt={session.user.name || "Profile"}
                      fill
                      className="rounded-full object-cover"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">Session Information</h2>
            <div className="grid gap-2">
              <div>
                <span className="font-medium">Last Updated:</span>{" "}
                {session.updatedAt ? new Date(session.updatedAt as string).toLocaleString() : "N/A"}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 
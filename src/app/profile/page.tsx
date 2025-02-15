import { auth0 } from "@/lib/auth0";
import { redirect } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default async function ProfilePage() {
  const session = await auth0.getSession();

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="flex flex-col items-center gap-6 max-w-md mx-auto">
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
        className="w-full"
      >
        <a href={`https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/dbconnections/change_password?client_id=${process.env.AUTH0_CLIENT_ID}&email=${encodeURIComponent(session.user.email || '')}&connection=Username-Password-Authentication`}>
          Change Password
        </a>
      </Button>
    </div>
  );
} 
import { auth0 } from "@/lib/auth0";

export default async function Home() {
  const session = await auth0.getSession();

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      {session ? (
        <>
          <h1 className="text-4xl font-bold">Welcome, {session.user.name}!</h1>
          <p className="text-lg text-muted-foreground">
            You are logged in to Zizcon
          </p>
        </>
      ) : (
        <>
          <h1 className="text-4xl font-bold">Welcome to Zizcon</h1>
          <p className="text-lg text-muted-foreground">
            Your next-generation application platform
          </p>
          <div className="flex gap-4">
            <a
              href="/api/auth/login?screen_hint=signup"
              className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Sign up
            </a>
            <a
              href="/api/auth/login"
              className="rounded-md bg-secondary px-4 py-2 text-secondary-foreground hover:bg-secondary/90"
            >
              Log in
            </a>
          </div>
        </>
      )}
    </div>
  );
}

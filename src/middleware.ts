import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { auth0 } from "./lib/auth0";

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 5000; // 5 seconds
const MAX_RETRY_DELAY = 10000; // 10 seconds

async function retryWithDelay<T extends NextResponse>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES,
  currentDelay: number = INITIAL_RETRY_DELAY
): Promise<T | NextResponse> {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      console.warn(`Auth0 request failed, retrying in ${currentDelay}ms... (${retries} attempts remaining)`);
      await new Promise(resolve => setTimeout(resolve, currentDelay));
      // Exponential backoff with max delay
      const nextDelay = Math.min(currentDelay * 2, MAX_RETRY_DELAY);
      return retryWithDelay(fn, retries - 1, nextDelay);
    }
    // If all retries failed, redirect to home
    console.error('Auth0 middleware error after retries:', error);
    return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_APP_URL!));
  }
}

export async function middleware(request: NextRequest) {
  // Don't retry static assets or API routes
  if (
    request.nextUrl.pathname.startsWith('/_next') ||
    request.nextUrl.pathname.startsWith('/api')
  ) {
    return NextResponse.next();
  }

  return await retryWithDelay(() => auth0.middleware(request));
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
}; 
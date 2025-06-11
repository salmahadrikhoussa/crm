// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  // Only run this middleware on /dashboard and its sub-paths
  if (pathname.startsWith("/dashboard")) {
    // If there's no token or it's invalid, redirect to login
    if (!token || !verifyJwt(token) === null) {
      const loginUrl = req.nextUrl.clone();
      loginUrl.pathname = "/login";
      return NextResponse.redirect(loginUrl);
    }
  }

  // Otherwise let the request through
  return NextResponse.next();
}

// Apply middleware only to /dashboard routes
export const config = {
  matcher: ["/dashboard/:path*"],
};

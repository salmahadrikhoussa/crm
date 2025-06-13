import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/jwt";

interface JwtPayload {
  role: string;
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const payload = (await verifyJwt(token)) as JwtPayload | null;

  if (!payload) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { role } = payload;
  const pathname = req.nextUrl.pathname;

  const roleAccessMap: Record<string, string[]> = {
    admin: [
      "/dashboard",
      "/dashboard/clients",
      "/dashboard/prospects",
      "/dashboard/tasks",
      "/dashboard/projects",
      "/dashboard/users",
    ],
    bizdev: [
      "/dashboard",
      "/dashboard/clients",
      "/dashboard/prospects",
      "/dashboard/tasks",
      "/dashboard/projects",
    ],
    developer: [
      "/dashboard",
      "/dashboard/projects",
      "/dashboard/tasks",
      "/dashboard/prospects",
    ],
  };

  const allowedPaths = roleAccessMap[role] || [];

  const hasAccess = allowedPaths.some((path: string) => pathname.startsWith(path));

  if (!hasAccess) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/clients/:path*",
    "/prospects/:path*",
    "/tasks/:path*",
    "/projects/:path*",
    "/users/:path*",
  ],
};
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/jwt";

interface JwtPayload {
  role: string;
}

export async function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    console.log("[Middleware] Pas de token, redirection vers /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const payload = (await verifyJwt(token)) as JwtPayload | null;

  if (!payload) {
    console.log("[Middleware] Token invalide, redirection vers /login");
    return NextResponse.redirect(new URL("/login", req.url));
  }

  const { role } = payload;
  const pathname = req.nextUrl.pathname;

  console.log(`[Middleware] Role utilisateur: ${role}`);
  console.log(`[Middleware] Chemin demandé: ${pathname}`);

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

  console.log(`[Middleware] Accès autorisé: ${hasAccess}`);

  if (!hasAccess) {
    console.log(
      `[Middleware] Accès refusé pour le rôle ${role} sur ${pathname}, redirection vers /dashboard`
    );
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
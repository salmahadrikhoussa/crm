import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "./auth";
import { canViewPage, canEdit } from "./permissions";

export async function checkAuth(
  req: NextRequest,
  action: "view" | "edit",
  resource: string
) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const payload = await verifyJwt(token);
  if (!payload) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  const role = payload.role as "admin" | "bizdev" | "developer";

  if (action === "view" && !canViewPage(role, resource)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (action === "edit" && !canEdit(role, resource)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return { role, payload };
}
// app/api/auth/me/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/auth";
import { readDb } from "@/lib/db";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  try {
    // verifyJwt returns JwtPayload | null
    const payload = verifyJwt(token);
    if (!payload) {
      throw new Error("Invalid token payload");
    }

    // extract userId: either a custom claim or the standard 'sub' field
    const userId =
      typeof payload === "object" && "userId" in payload
        ? (payload as any).userId
        : typeof payload.sub === "string"
        ? payload.sub
        : null;

    if (!userId) {
      throw new Error("No userId in token");
    }

    // lookup in DB
    const db = await readDb();
    const user = (db.users || []).find((u: any) => u.id === userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // return safe fields
    const { id, name, email } = user;
    return NextResponse.json({ id, name, email });
  } catch (err) {
    console.error("❌ /api/auth/me error:", err);
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }
}

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/jwt";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyJwt(token);
  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = typeof payload.sub === "string" ? payload.sub : null;
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("suzali_crm");

    let user = null;
    if (ObjectId.isValid(userId)) {
      user = await db.collection("users").findOne({ _id: new ObjectId(userId) });
    } else {
      // Optional: if your DB uses string _id, uncomment below
      // user = await db.collection("users").findOne({ _id: userId });
    }

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { _id, name, email, role } = user;
    return NextResponse.json({ id: _id.toString(), name, email, role });
  } catch (err) {
    console.error("Error fetching user:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import bcrypt from "bcrypt";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db("suzali_crm");
    const userData = await db.collection("users").findOne({ _id: new ObjectId(params.id) });

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const { _id, name, email, role, avatar } = userData;
    return NextResponse.json({ id: _id.toString(), name, email, role, avatar: avatar || null });
  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await req.json();

    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    const client = await clientPromise;
    const db = client.db("suzali_crm");
    await db.collection("users").updateOne({ _id: new ObjectId(params.id) }, { $set: updates });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db("suzali_crm");
    await db.collection("users").deleteOne({ _id: new ObjectId(params.id) });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
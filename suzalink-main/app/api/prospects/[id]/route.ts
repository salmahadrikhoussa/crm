import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db("suzali_crm");
    const prospectData = await db.collection("prospects").findOne({ _id: new ObjectId(params.id) });

    if (!prospectData) {
      return NextResponse.json({ error: "Prospect not found" }, { status: 404 });
    }

    return NextResponse.json(prospectData);
  } catch (error) {
    console.error("Error fetching prospect:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await req.json();
    const client = await clientPromise;
    const db = client.db("suzali_crm");
    await db.collection("prospects").updateOne({ _id: new ObjectId(params.id) }, { $set: updates });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error updating prospect:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db("suzali_crm");
    await db.collection("prospects").deleteOne({ _id: new ObjectId(params.id) });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting prospect:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
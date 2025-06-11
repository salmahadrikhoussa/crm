// app/api/prospects/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  // Connect to MongoDB
  const client = await clientPromise;
  const db = client.db();                       // uses the database from your URI
  const col = db.collection("prospects");

  // Try to find by ObjectId
  let doc;
  try {
    doc = await col.findOne({ _id: new ObjectId(params.id) });
  } catch {
    // invalid ObjectId format
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Convert _id to id
  const prospect = {
    id: (doc._id as ObjectId).toHexString(),
    name: doc.name,
    email: doc.email,
    phone: doc.phone,
    status: doc.status,
    assignedTo: doc.assignedTo,
  };

  return NextResponse.json(prospect);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const updates = await req.json();
  const client = await clientPromise;
  const db = client.db();
  const col = db.collection("prospects");

  let res;
  try {
    res = await col.findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updates },
      { returnDocument: "after" }
    );
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!res.value) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = {
    id: res.value._id.toHexString(),
    name: res.value.name,
    email: res.value.email,
    phone: res.value.phone,
    status: res.value.status,
    assignedTo: res.value.assignedTo,
  };

  return NextResponse.json(updated);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await clientPromise;
  const db = client.db();
  const col = db.collection("prospects");

  let result;
  try {
    result = await col.deleteOne({ _id: new ObjectId(params.id) });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}

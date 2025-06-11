// app/api/users/[id]/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await clientPromise;
  const col = client.db().collection("users");
  let doc;
  try {
    doc = await col.findOne({ _id: new ObjectId(params.id) });
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!doc) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({
    id: doc._id.toHexString(),
    name: doc.name,
    email: doc.email,
    role: doc.role,
    avatar: doc.avatar,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const updates = await req.json();
  const client = await clientPromise;
  const col = client.db().collection("users");

  let value;
  try {
    ({ value } = await col.findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updates },
      { returnDocument: "after" }
    ));
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!value) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: value._id.toHexString(),
    name: value.name,
    email: value.email,
    role: value.role,
    avatar: value.avatar,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await clientPromise;
  const col = client.db().collection("users");
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

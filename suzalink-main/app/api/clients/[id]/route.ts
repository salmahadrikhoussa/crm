// app/api/clients/[id]/route.ts
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
  const col = client.db().collection("clients");
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
    type: doc.type,
    contactInfo: doc.contactInfo,
    portalAccess: doc.portalAccess,
    assignedBizDev: doc.assignedBizDev,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const updates = await req.json();
  const client = await clientPromise;
  const col = client.db().collection("clients");

  let result;
  try {
    result = await col.findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      { $set: updates },
      { returnDocument: "after" }
    );
  } catch {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const value = result?.value;
  if (!value) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: value._id.toHexString(),
    name: value.name,
    type: value.type,
    contactInfo: value.contactInfo,
    portalAccess: value.portalAccess,
    assignedBizDev: value.assignedBizDev,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await clientPromise;
  const col = client.db().collection("clients");
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

// app/api/tasks/[id]/route.ts
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
  const col = client.db().collection("tasks");
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
    projectId: doc.projectId,
    title: doc.title,
    description: doc.description,
    assignedTo: doc.assignedTo,
    dueDate: doc.dueDate,
    priority: doc.priority,
    status: doc.status,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const updates = await req.json();
  const client = await clientPromise;
  const col = client.db().collection("tasks");

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
    projectId: value.projectId,
    title: value.title,
    description: value.description,
    assignedTo: value.assignedTo,
    dueDate: value.dueDate,
    priority: value.priority,
    status: value.status,
  });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const client = await clientPromise;
  const col = client.db().collection("tasks");
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

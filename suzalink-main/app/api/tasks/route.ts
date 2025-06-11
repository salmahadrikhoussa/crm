// app/api/tasks/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { TaskSchema } from "@/lib/schemas";
import { ObjectId } from "mongodb";

export async function GET() {
  const client = await clientPromise;
  const docs = await client.db().collection("tasks").find().toArray();
  const tasks = docs.map(doc => ({
    id: (doc._id as ObjectId).toHexString(),
    ...doc,
  }));
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  let input;
  try {
    input = TaskSchema.parse(await req.json());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 422 });
  }
  const client = await clientPromise;
  const col = client.db().collection("tasks");
  const res = await col.insertOne(input);
  const created = { id: res.insertedId.toHexString(), ...input };
  return NextResponse.json(created, { status: 201 });
}

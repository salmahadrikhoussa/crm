// app/api/projects/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ProjectSchema } from "../../../lib/schemas";
import { ObjectId } from "mongodb";

export async function GET() {
  const client = await clientPromise;
  const docs = await client.db().collection("projects").find().toArray();
  const projects = docs.map(doc => ({
    id: (doc._id as ObjectId).toHexString(),
    ...doc,
  }));
  return NextResponse.json(projects);
}

export async function POST(req: NextRequest) {
  let input;
  try {
    input = ProjectSchema.parse(await req.json());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 422 });
  }
  const client = await clientPromise;
  const col = client.db().collection("projects");
  const res = await col.insertOne(input);
  const created = { id: res.insertedId.toHexString(), ...input };
  return NextResponse.json(created, { status: 201 });
}

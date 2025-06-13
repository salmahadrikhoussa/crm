import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { TaskSchema } from "@/lib/schemas";
import { ObjectId } from "mongodb";
import { verifyJwt } from "@/lib/jwt";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = (await verifyJwt(token)) as { role: string } | null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role } = payload;
  if (role !== "admin" && role !== "bizdev" && role !== "developer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const client = await clientPromise;
  const docs = await client.db().collection("tasks").find().toArray();
  const tasks = docs.map(doc => ({
    id: (doc._id as ObjectId).toHexString(),
    ...doc,
  }));
  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const payload = (await verifyJwt(token)) as { role: string } | null;
  if (!payload) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { role } = payload;
  if (role !== "admin" && role !== "bizdev" && role !== "developer") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
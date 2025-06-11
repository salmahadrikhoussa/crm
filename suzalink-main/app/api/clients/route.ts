// app/api/clients/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ClientSchema } from "../../../lib/schemas";
import { ObjectId } from "mongodb";

export async function GET() {
  const client = await clientPromise;
  const col = client.db().collection("clients");
  const docs = await col.find().toArray();
  const clients = docs.map(doc => ({
    id: (doc._id as ObjectId).toHexString(),
    name: doc.name,
    type: doc.type,
    contactInfo: doc.contactInfo,
    portalAccess: doc.portalAccess,
    assignedBizDev: doc.assignedBizDev,
  }));
  return NextResponse.json(clients);
}

export async function POST(req: NextRequest) {
  let input;
  try {
    input = ClientSchema.parse(await req.json());
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 422 });
  }
  const client = await clientPromise;
  const col = client.db().collection("clients");
  const res = await col.insertOne(input);
  const created = { id: res.insertedId.toHexString(), ...input };
  return NextResponse.json(created, { status: 201 });
}

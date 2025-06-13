export const runtime = "nodejs";

import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET: List all prospects
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const col = db.collection("prospects");
    const docs = await col.find().toArray();

    // Map _id to id for frontend
    const prospects = docs.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      status: doc.status,
      assignedTo: doc.assignedTo,
    }));

    return NextResponse.json(prospects); // Always return an array!
  } catch (err) {
    console.error("Error fetching prospects:", err);
    return NextResponse.json([], { status: 500 }); // Return empty array on error
  }
}

// POST: Create a new prospect (optional, if you want to support creation here)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const client = await clientPromise;
    const db = client.db();
    const col = db.collection("prospects");

    const result = await col.insertOne(body);

    return NextResponse.json({
      id: result.insertedId.toString(),
      ...body,
    }, { status: 201 });
  } catch (err) {
    console.error("Error creating prospect:", err);
    return NextResponse.json({ error: "Failed to create prospect" }, { status: 500 });
  }
}
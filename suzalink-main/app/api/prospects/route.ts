// app/api/prospects/route.ts
export const runtime = "nodejs";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

// GET: liste tous les prospects
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db();
    const col = db.collection("prospects");
    const docs = await col.find().toArray();

    const prospects = docs.map((doc) => ({
      id: doc._id.toString(),
      name: doc.name,
      email: doc.email,
      phone: doc.phone,
      status: doc.status,
      assignedTo: doc.assignedTo,
    }));

    return NextResponse.json(prospects);
  } catch (err) {
    console.error("Error fetching prospects:", err);
    return NextResponse.json([], { status: 500 });
  }
}

// POST: ajoute un nouveau prospect
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, status, assignedTo } = body;

    if (!name || !email || !phone || !status || !assignedTo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();
    const col = db.collection("prospects");

    const result = await col.insertOne({ name, email, phone, status, assignedTo });

    return NextResponse.json({
      id: result.insertedId.toString(),
      name,
      email,
      phone,
      status,
      assignedTo,
    });
  } catch (err) {
    console.error("Error creating prospect:", err);
    return NextResponse.json({ error: "Failed to create prospect" }, { status: 500 });
  }
}
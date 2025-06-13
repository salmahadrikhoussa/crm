import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db("suzali_crm");
    const taskData = await db.collection("tasks").findOne({ _id: new ObjectId(params.id) });

    if (!taskData) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(taskData);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const updates = await req.json();
    const client = await clientPromise;
    const db = client.db("suzali_crm");
    await db.collection("tasks").updateOne({ _id: new ObjectId(params.id) }, { $set: updates });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db("suzali_crm");
    await db.collection("tasks").deleteOne({ _id: new ObjectId(params.id) });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db("suzali_crm");
    const clientData = await db.collection("clients").findOne({ _id: new ObjectId(params.id) });

    if (!clientData) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    return NextResponse.json(clientData);
  } catch (error) {
    console.error("Error fetching client:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const updates = await req.json();
    const client = await clientPromise;
    const db = client.db("suzali_crm");
    await db.collection("clients").updateOne({ _id: new ObjectId(params.id) }, { $set: updates });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error updating client:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db("suzali_crm");
    await db.collection("clients").deleteOne({ _id: new ObjectId(params.id) });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error deleting client:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

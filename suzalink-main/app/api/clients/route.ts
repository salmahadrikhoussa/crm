import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyJwt } from "@/lib/jwt";
import clientPromise from "@/lib/mongodb";

export async function GET(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyJwt(token);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = payload;

  if (role !== "admin" && role !== "bizdev") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("suzali_crm");

    const clients = await db.collection("clients").find().toArray();

    // Map _id to id as string for frontend
    const mappedClients = clients.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      type: c.type,
      contactInfo: c.contactInfo,
      portalAccess: c.portalAccess,
      assignedBizDev: c.assignedBizDev,
    }));

    return NextResponse.json(mappedClients);
  } catch (error) {
    console.error("Error fetching clients:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const token = req.cookies.get("token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await verifyJwt(token);

  if (!payload) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { role } = payload;

  if (role !== "admin" && role !== "bizdev") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const client = await clientPromise;
    const db = client.db("suzali_crm");

    const data = await req.json();

    const newClient = {
      ...data,
    };

    const result = await db.collection("clients").insertOne(newClient);

    const createdClient = await db.collection("clients").findOne({
      _id: result.insertedId,
    });

    // Map _id to id as string for frontend
    const mappedClient = {
      id: createdClient?._id.toString(),
      name: createdClient?.name,
      type: createdClient?.type,
      contactInfo: createdClient?.contactInfo,
      portalAccess: createdClient?.portalAccess,
      assignedBizDev: createdClient?.assignedBizDev,
    };

    return NextResponse.json(mappedClient);
  } catch (error) {
    console.error("Error creating client:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
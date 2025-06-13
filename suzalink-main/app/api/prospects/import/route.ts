// app/api/prospects/import/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";

interface ProspectInput {
  name: string;
  email: string;
  phone: string;
  status: string;
  assignedTo: string;
}

export async function POST(req: NextRequest) {
  try {
    const rows = (await req.json()) as ProspectInput[];
    console.log("Données reçues dans l'API :", rows); // Pour debug

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { error: "No valid data provided" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db();
    const col = db.collection("prospects");

    // Insérer tous les prospects en une fois
    const result = await col.insertMany(rows);

    return NextResponse.json({ 
      success: true, 
      count: result.insertedCount 
    });
  } catch (err) {
    console.error("❌ /api/prospects/import error:", err);
    return NextResponse.json(
      { error: "Failed to import prospects" },
      { status: 500 }
    );
  }
}
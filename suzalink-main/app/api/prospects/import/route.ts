// app/api/prospects/import/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { readDb, writeDb } from "@/lib/db";

interface Prospect {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  assignedTo: string;
}

export async function POST(req: NextRequest) {
  try {
    // Expect an array of partial Prospect objects
    const rows = (await req.json()) as Array<
      Omit<Prospect, "id">
    >;

    const db = await readDb();
    db.prospects = Array.isArray(db.prospects) ? db.prospects : [];

    for (const row of rows) {
      const newItem: Prospect = {
        id: Date.now().toString() + Math.random().toString(36).slice(2, 6),
        ...row,
      };
      db.prospects.push(newItem);
    }

    await writeDb(db);
    return NextResponse.json({ success: true, count: rows.length });
  } catch (err) {
    console.error("❌ /api/prospects/import error:", err);
    return NextResponse.json(
      { error: "Failed to import prospects" },
      { status: 500 }
    );
  }
}

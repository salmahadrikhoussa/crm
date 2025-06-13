import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import clientPromise from "@/lib/mongodb";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
  try {
    const { name, email, role, password, avatar } = await req.json();

    if (!name || !email || !role || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("suzali_crm");

    // Check if user with email already exists
    const existingUser = await db.collection("users").findOne({ email });
    if (existingUser) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    // Hash password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
      name,
      email,
      role,
      password: hashedPassword,
      avatar: avatar || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await db.collection("users").insertOne(newUser);

    return NextResponse.json({
      id: result.insertedId.toString(),
      name,
      email,
      role,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("suzali_crm");
    const users = await db.collection("users").find().toArray();

    // Return safe user info (exclude password)
    const safeUsers = users.map(({ _id, name, email, role }) => ({
      id: _id.toString(),
      name,
      email,
      role,
    }));

    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
// lib/auth.ts
import { sign, verify as jwtVerify, JwtPayload } from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) throw new Error("Missing JWT_SECRET");

// Only JWT code here—safe for Edge
export function verifyJwt(token: string): JwtPayload | null {
  try {
    return jwtVerify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

// Dynamic import of db so Edge bundles don’t pull in fs/path
export async function verifyUser(email: string, password: string) {
  const { readDb } = await import("./db");
  const db = await readDb();

  const users = Array.isArray(db.users) ? db.users : [];
  const record = users.find((u: any) => u.email === email);
  if (!record || record.password !== password) {
    console.log(`Auth failed for ${email}`);
    return null;
  }

  return {
    id: record.id,
    email: record.email,
    role: record.role,
    signToken: () =>
      sign({ sub: record.id, email: record.email, role: record.role }, JWT_SECRET, { expiresIn: "1d" }),
  };
}

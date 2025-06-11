// lib/db.ts
import fs from "fs/promises";
import path from "path";

const DB_PATH = path.join(process.cwd(), "db.json");

/**
 * Reads and parses your db.json file.
 */
export async function readDb(): Promise<any> {
  const raw = await fs.readFile(DB_PATH, "utf-8");
  return JSON.parse(raw);
}

/**
 * Persists the given object back to db.json.
 */
export async function writeDb(data: any): Promise<void> {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

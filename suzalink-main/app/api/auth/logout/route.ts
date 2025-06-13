import { NextResponse } from 'next/server';

export async function POST() {
  const res = NextResponse.json({ ok: true });
  // Delete the 'token' cookie on the root path
  res.cookies.delete({ name: 'token', path: '/' });
  return res;
}
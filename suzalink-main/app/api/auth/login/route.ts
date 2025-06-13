export const runtime = 'nodejs';

import { NextResponse, type NextRequest } from 'next/server';
import { verifyUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    console.log('Login attempt for:', email);
    
    const user = await verifyUser(email, password);
    console.log('User verification result:', user ? 'SUCCESS' : 'FAILED');
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = await user.signToken();
    console.log('Token generated successfully');

    const res = NextResponse.json({ ok: true });
    res.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });
    return res;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
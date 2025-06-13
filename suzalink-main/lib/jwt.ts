// lib/jwt.ts  – ONLY JWT helpers, NO MongoDB imports here
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('Missing JWT_SECRET');

const secret = new TextEncoder().encode(JWT_SECRET);

/**
 * Sign a payload and return a JWT (HS256, 24 h expiry)
 */
export async function signJwt(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(secret);
}

/**
 * Verify a JWT. Returns payload or null.
 */
export async function verifyJwt(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}
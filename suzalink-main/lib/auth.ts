// lib/auth.ts   – NODE.JS RUNTIME ONLY (API routes, server components)
import clientPromise from './mongodb';
import { LoginSchema } from './schemas';
import { signJwt, verifyJwt } from './jwt';
import bcrypt from 'bcrypt';

export { verifyJwt }; // re-export so old imports keep working

/**
 * Verify user in DB, return user object with signToken() helper
 */
export async function verifyUser(email: string, password: string) {
  try {
    console.log("Attempting to verify user:", email);

    // Validate input
    const { email: e, password: p } = LoginSchema.parse({ email, password });
    console.log("Parsed email:", e);

    // Connect to DB and find user
    const client = await clientPromise;
    const db = client.db('suzali_crm');
    const users = db.collection('users');

    const user = await users.findOne({ email: e });
    console.log("User found:", user ? "YES" : "NO");

    if (!user) {
      console.log(`No user found for ${email}`);
      return null;
    }

    // Secure password check with bcrypt
    const passwordMatch = await bcrypt.compare(p, user.password);
    console.log("Password match:", passwordMatch);

    if (!passwordMatch) {
      console.log(`Password mismatch for ${email}`);
      return null;
    }

    console.log(`Auth successful for ${email}`);
    return {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
      role: user.role,
      /** Async helper for issuing JWTs */
      signToken: async () =>
        await signJwt({
          sub: user._id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        }),
    };
  } catch (err) {
    console.error('Database connection error:', err);
    return null;
  }
}
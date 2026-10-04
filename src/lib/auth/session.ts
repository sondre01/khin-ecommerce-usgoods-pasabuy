import { SignJWT, jwtVerify } from 'jose';
import { UserRole } from '@/types';

const SECRET_KEY = new TextEncoder().encode(
  process.env.JWT_SECRET || 'pasabuy-super-secret-production-jwt-key-2026'
);

export interface UserSession {
  userId: string;
  email: string;
  fullName: string;
  role: UserRole;
}

/**
 * Creates a signed JWT session token valid for 7 days
 */
export async function signJwtSession(payload: UserSession): Promise<string> {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET_KEY);
}

/**
 * Verifies and decodes a JWT session token in Edge or Node runtime
 */
export async function verifyJwtSession(token: string): Promise<UserSession | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      fullName: payload.fullName as string,
      role: payload.role as UserRole,
    };
  } catch (error) {
    return null;
  }
}

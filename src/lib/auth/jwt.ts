import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.AUTH_SECRET || 'super-secret-jwt-encryption-key-change-in-production-1234567890';

export interface TokenPayload {
  userId: string;
  email: string;
  role: 'READER' | 'AUTHOR' | 'ADMIN';
  username: string;
}

export function signToken(payload: TokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
}

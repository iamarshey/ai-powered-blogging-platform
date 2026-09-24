import { cookies } from 'next/headers';
import { verifyToken, TokenPayload } from './jwt';
import db from '../db';

export async function getCurrentUser(): Promise<TokenPayload | null> {
  const cookieStore = cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await db.user.findUnique({
    where: { id: payload.userId },
    select: { id: true, email: true, role: true, profile: { select: { username: true } } },
  });

  if (!user) return null;

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    username: user.profile?.username || user.email.split('@')[0],
  };
}

export async function requireAuth(allowedRoles?: ('READER' | 'AUTHOR' | 'ADMIN')[]) {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Unauthorized: Authentication required');
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient privileges');
  }

  return user;
}

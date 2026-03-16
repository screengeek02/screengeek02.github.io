import { Role } from '@prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

const SESSION_COOKIE = 'helio_session';
const SESSION_TTL_SECONDS = 60 * 60 * 8;

type SessionUser = {
  userId: string;
  role: Role;
  email: string;
  name: string;
};

export function createSessionToken(payload: SessionUser) {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error('AUTH_SECRET is not configured');
  return jwt.sign(payload, secret, { expiresIn: SESSION_TTL_SECONDS });
}

export function setSessionCookie(token: string) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  });
}

export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE, '', { maxAge: 0, path: '/' });
}

export function getSessionFromCookie(): SessionUser | null {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const secret = process.env.AUTH_SECRET;
  if (!secret) return null;
  try {
    return jwt.verify(token, secret) as SessionUser;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE, SESSION_TTL_SECONDS };
export type { SessionUser };

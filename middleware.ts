import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { Role } from '@prisma/client';
import { SESSION_COOKIE } from './lib/auth';

function parseSession(request: NextRequest): { role: Role } | null {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret) return null;
  try {
    return jwt.verify(token, secret) as { role: Role };
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = parseSession(request);

  if (pathname.startsWith('/admin')) {
    if (!session) return NextResponse.redirect(new URL('/login', request.url));
    if (session.role !== Role.ADMIN) return NextResponse.redirect(new URL('/worker/dashboard', request.url));
  }

  if (pathname.startsWith('/worker')) {
    if (!session) return NextResponse.redirect(new URL('/login', request.url));
    if (session.role !== Role.WORKER) return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL(session.role === Role.ADMIN ? '/admin/dashboard' : '/worker/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/worker/:path*', '/login'],
};

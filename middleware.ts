import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { SESSION_COOKIE } from './lib/auth';

type MiddlewareSession = {
  role: 'ADMIN' | 'WORKER';
};

function parseSession(request: NextRequest): MiddlewareSession | null {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret) return null;

  try {
    return jwt.verify(token, secret) as MiddlewareSession;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = parseSession(request);

  if (pathname.startsWith('/admin')) {
    if (!session) return NextResponse.redirect(new URL('/login', request.url));
    if (session.role !== 'ADMIN') return NextResponse.redirect(new URL('/worker/dashboard', request.url));
  }

  if (pathname.startsWith('/worker')) {
    if (!session) return NextResponse.redirect(new URL('/login', request.url));
    if (session.role !== 'WORKER') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
  }

  if (pathname === '/login' || pathname.startsWith('/login/')) {
    if (session) {
      return NextResponse.redirect(new URL(session.role === 'ADMIN' ? '/admin/dashboard' : '/worker/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/worker/:path*', '/login/:path*'],
};

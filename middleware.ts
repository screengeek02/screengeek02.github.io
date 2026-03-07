import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { SESSION_COOKIE } from './lib/auth';

type MiddlewareRole = 'ADMIN' | 'WORKER' | 'CUSTOMER';
type MiddlewareSession = {
  role: MiddlewareRole;
};

async function parseSession(request: NextRequest): Promise<MiddlewareSession | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const secret = process.env.AUTH_SECRET;
  if (!token || !secret) return null;

  try {
    const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
    if (payload.role === 'ADMIN' || payload.role === 'WORKER' || payload.role === 'CUSTOMER') {
      return { role: payload.role };
    }

    return null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const session = await parseSession(request);

  if (pathname.startsWith('/admin')) {
    if (!session) return NextResponse.redirect(new URL('/login', request.url));
    if (session.role !== 'ADMIN') {
      return NextResponse.redirect(new URL(session.role === 'WORKER' ? '/worker/dashboard' : '/dashboard', request.url));
    }
  }

  if (pathname.startsWith('/worker') && !pathname.startsWith('/worker/apply')) {
    if (!session) return NextResponse.redirect(new URL('/login', request.url));
    if (session.role !== 'WORKER') {
      return NextResponse.redirect(new URL(session.role === 'ADMIN' ? '/admin/dashboard' : '/dashboard', request.url));
    }
  }

  if (pathname.startsWith('/dashboard')) {
    if (!session) return NextResponse.redirect(new URL('/login', request.url));
    if (session.role !== 'CUSTOMER') {
      return NextResponse.redirect(new URL(session.role === 'ADMIN' ? '/admin/dashboard' : '/worker/dashboard', request.url));
    }
  }

  if (pathname === '/login' || pathname.startsWith('/login/') || pathname === '/signup' || pathname.startsWith('/signup/')) {
    if (session) {
      if (session.role === 'ADMIN') return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      if (session.role === 'WORKER') return NextResponse.redirect(new URL('/worker/dashboard', request.url));
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/worker/:path*', '/dashboard', '/dashboard/:path*', '/login', '/login/:path*', '/signup', '/signup/:path*'],
};

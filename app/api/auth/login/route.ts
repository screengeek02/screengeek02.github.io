import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createSessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS } from '@/lib/auth';
import { loginSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = loginSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid credentials input.' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (!user) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });

    const valid = await bcrypt.compare(parsed.data.password, user.passwordHash);
    if (!valid) return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });

    const token = createSessionToken({ userId: user.id, role: user.role, email: user.email, name: user.name });

    const response = NextResponse.json({ role: user.role });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    });

    return response;
  } catch {
    return NextResponse.json({ error: 'Unable to login at this time.' }, { status: 500 });
  }
}

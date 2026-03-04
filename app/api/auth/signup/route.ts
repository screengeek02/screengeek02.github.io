import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { createSessionToken, SESSION_COOKIE, SESSION_TTL_SECONDS } from '@/lib/auth';
import { db } from '@/lib/db';
import { customerSignupSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = customerSignupSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid signup details.' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const user = await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
        role: Role.CUSTOMER,
        phone: parsed.data.phone || null,
      },
    });

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
    return NextResponse.json({ error: 'Unable to create account.' }, { status: 500 });
  }
}

import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { workerApplySchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = workerApplySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid application details.' }, { status: 400 });
    }

    const existing = await db.user.findUnique({ where: { email: parsed.data.email } });
    if (existing) {
      return NextResponse.json({ error: 'Email already registered.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    await db.user.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone,
        city: parsed.data.city,
        experience: parsed.data.experience,
        passwordHash,
        role: Role.WORKER,
      },
    });

    return NextResponse.json({ success: true, message: 'Application submitted. Awaiting admin approval.' });
  } catch {
    return NextResponse.json({ error: 'Unable to submit worker application.' }, { status: 500 });
  }
}

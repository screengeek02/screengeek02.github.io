import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(_: Request, context: { params: { id: string } }) {
  const session = getSessionFromCookie();
  if (!session || session.role !== Role.ADMIN) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await db.user.update({
    where: { id: context.params.id },
    data: {},
  });

  return NextResponse.json({ success: true });
}

import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';
import { canTransitionStatus } from '@/lib/permissions';
import { updateStatusSchema } from '@/lib/validations';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const session = getSessionFromCookie();
  if (!session || session.role !== Role.ADMIN) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const parsed = updateStatusSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: 'Invalid status provided.' }, { status: 400 });

  const job = await db.job.findUnique({ where: { id: params.id } });
  if (!job) return NextResponse.json({ error: 'Job not found.' }, { status: 404 });

  if (!canTransitionStatus(job.status, parsed.data.status, session.role)) {
    return NextResponse.json({ error: `Invalid status transition from ${job.status} to ${parsed.data.status}.` }, { status: 400 });
  }

  const updated = await db.job.update({ where: { id: params.id }, data: { status: parsed.data.status } });
  return NextResponse.json(updated);
}

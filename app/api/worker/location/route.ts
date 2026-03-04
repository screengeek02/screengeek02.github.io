import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  const session = getSessionFromCookie();
  if (!session || session.role !== Role.WORKER) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const json = (await request.json()) as { latitude?: number; longitude?: number };
    if (typeof json.latitude !== 'number' || typeof json.longitude !== 'number') {
      return NextResponse.json({ error: 'Invalid coordinates.' }, { status: 400 });
    }

    await db.user.update({
      where: { id: session.userId },
      data: {
        lastLatitude: json.latitude,
        lastLongitude: json.longitude,
        lastUpdated: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Unable to update location.' }, { status: 500 });
  }
}

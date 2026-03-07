import { Role } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getSessionFromCookie } from '@/lib/auth';

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

    return NextResponse.json({
      success: true,
      message: 'Location received (tracking disabled)',
    });
  } catch {
    return NextResponse.json({ error: 'Invalid location payload' }, { status: 400 });
  }
}

import { JobStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookingSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bookingSchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid booking form data.' }, { status: 400 });
    }

    const job = await db.job.create({
      data: {
        customerName: parsed.data.customerName,
        customerPhone: parsed.data.customerPhone,
        customerEmail: parsed.data.customerEmail || null,
        address: parsed.data.address,
        serviceType: parsed.data.serviceType,
        scheduledDate: new Date(parsed.data.scheduledDate),
        status: JobStatus.PENDING,
        notes: parsed.data.notes
          ? {
              create: {
                content: parsed.data.notes,
              },
            }
          : undefined,
      },
    });

    return NextResponse.json({ id: job.id });
  } catch {
    return NextResponse.json({ error: 'Could not create booking.' }, { status: 500 });
  }
}

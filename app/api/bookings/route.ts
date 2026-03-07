import { JobStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { bookingSchema } from '@/lib/validations';

export async function POST(request: Request) {
  try {
    const json = await request.json();
    const parsed = bookingSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          type: 'validation',
          errors: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    const scheduledDate = new Date(parsed.data.scheduledDate);
    if (scheduledDate.getTime() < Date.now()) {
      return NextResponse.json(
        {
          success: false,
          type: 'validation',
          message: 'Cannot schedule a booking in the past.',
        },
        { status: 400 },
      );
    }

    const job = await db.job.create({
      data: {
        customerName: parsed.data.customerName,
        customerPhone: parsed.data.customerPhone,
        customerEmail: parsed.data.customerEmail || null,
        address: parsed.data.address,
        serviceType: parsed.data.serviceType,
        scheduledDate,
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

    return NextResponse.json({
      success: true,
      jobId: job.id,
      id: job.id,
      scheduledDate: job.scheduledDate.toISOString(),
      status: job.status,
    });
  } catch (error) {
    console.error('Booking creation failed:', error);
    return NextResponse.json(
      {
        success: false,
        type: 'server',
        message: 'Could not create booking.',
      },
      { status: 500 },
    );
  }
}

import { JobStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { calculateCommission } from '@/lib/commission';
import { db } from '@/lib/db';
import { autoAssignWorker } from '@/lib/dispatchEngine';
import { getBasePriceForService } from '@/lib/pricing';
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

    const basePrice = getBasePriceForService(parsed.data.serviceType);
    const pricingInfo = calculateCommission(basePrice);

    const job = await db.job.create({
      data: {
        customerName: parsed.data.customerName,
        customerPhone: parsed.data.customerPhone,
        customerEmail: parsed.data.customerEmail || null,
        address: parsed.data.address,
        serviceType: parsed.data.serviceType,
        scheduledDate,
        status: JobStatus.PENDING,
        customerPrice: pricingInfo.total,
        platformFee: pricingInfo.platformFee,
        cleanerPay: pricingInfo.cleanerPay,
        notes: parsed.data.notes
          ? {
              create: {
                content: parsed.data.notes,
              },
            }
          : undefined,
      },
    });

    const latitude = typeof json.latitude === 'number' ? json.latitude : null;
    const longitude = typeof json.longitude === 'number' ? json.longitude : null;
    await autoAssignWorker(job.id, latitude, longitude);

    return NextResponse.json({
      success: true,
      jobId: job.id,
      id: job.id,
      scheduledDate: job.scheduledDate.toISOString(),
      status: job.status,
      customerPrice: job.customerPrice,
      platformFee: job.platformFee,
      cleanerPay: job.cleanerPay,
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

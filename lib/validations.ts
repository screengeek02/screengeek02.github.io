import { JobStatus, ServiceType } from '@prisma/client';
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const customerSignupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  phone: z.string().min(7).optional().or(z.literal('')),
});

export const workerApplySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  password: z.string().min(8),
  city: z.string().min(2),
  experience: z.string().min(2),
});

export const bookingSchema = z.object({
  customerName: z.string().min(2),
  customerPhone: z.string().min(7),
  customerEmail: z.string().email().optional().or(z.literal('')),
  address: z.string().min(5),
  serviceType: z.nativeEnum(ServiceType),
  scheduledDate: z.string().datetime(),
  notes: z.string().max(500).optional().or(z.literal('')),
});

export const assignWorkerSchema = z.object({
  workerId: z.string().cuid(),
});

export const updateStatusSchema = z.object({
  status: z.nativeEnum(JobStatus),
});

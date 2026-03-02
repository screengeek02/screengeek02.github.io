import bcrypt from 'bcryptjs';
import { PrismaClient, JobStatus, Role, ServiceType } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.jobNote.deleteMany();
  await prisma.job.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('DemoPass123!', 10);

  const admin = await prisma.user.create({
    data: {
      name: 'Helio Admin',
      email: 'admin@heliocleaning.com',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const workerA = await prisma.user.create({
    data: {
      name: 'Maria Worker',
      email: 'worker1@heliocleaning.com',
      passwordHash,
      role: Role.WORKER,
    },
  });

  const workerB = await prisma.user.create({
    data: {
      name: 'Daniel Worker',
      email: 'worker2@heliocleaning.com',
      passwordHash,
      role: Role.WORKER,
    },
  });

  await prisma.job.createMany({
    data: [
      {
        customerName: 'Emma Johnson',
        customerPhone: '555-0101',
        customerEmail: 'emma@example.com',
        address: '123 Main St, Austin, TX',
        serviceType: ServiceType.STANDARD,
        scheduledDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
        status: JobStatus.PENDING,
      },
      {
        customerName: 'Noah Brown',
        customerPhone: '555-0102',
        address: '456 Oak Ave, Austin, TX',
        serviceType: ServiceType.DEEP,
        scheduledDate: new Date(Date.now() + 1000 * 60 * 60 * 48),
        status: JobStatus.ASSIGNED,
        assignedWorkerId: workerA.id,
      },
      {
        customerName: 'Olivia Smith',
        customerPhone: '555-0103',
        address: '789 Pine Rd, Austin, TX',
        serviceType: ServiceType.MOVE_OUT,
        scheduledDate: new Date(Date.now() - 1000 * 60 * 60 * 12),
        status: JobStatus.IN_PROGRESS,
        assignedWorkerId: workerB.id,
      },
    ],
  });

  const assignedJob = await prisma.job.findFirstOrThrow({ where: { status: JobStatus.ASSIGNED } });
  await prisma.jobNote.create({
    data: {
      jobId: assignedJob.id,
      content: `Assigned by ${admin.name}. Bring eco-friendly supplies.`,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

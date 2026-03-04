import bcrypt from 'bcryptjs';
import { PrismaClient, JobStatus, Role, ServiceType, WorkerStatus } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('DemoPass123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@heliocleaning.com' },
    update: { name: 'Helio Admin', passwordHash, role: Role.ADMIN },
    create: {
      name: 'Helio Admin',
      email: 'admin@heliocleaning.com',
      passwordHash,
      role: Role.ADMIN,
    },
  });

  const workerA = await prisma.user.upsert({
    where: { email: 'worker1@heliocleaning.com' },
    update: { name: 'Maria Worker', passwordHash, role: Role.WORKER, workerStatus: WorkerStatus.APPROVED, phone: '555-0104', city: 'Punta Cana', experience: '3 years residential cleaning' },
    create: {
      name: 'Maria Worker',
      email: 'worker1@heliocleaning.com',
      passwordHash,
      role: Role.WORKER,
      workerStatus: WorkerStatus.APPROVED,
      phone: '555-0104',
      city: 'Punta Cana',
      experience: '3 years residential cleaning',
    },
  });

  const workerB = await prisma.user.upsert({
    where: { email: 'worker2@heliocleaning.com' },
    update: { name: 'Daniel Worker', passwordHash, role: Role.WORKER, workerStatus: WorkerStatus.APPROVED, phone: '555-0105', city: 'Bavaro', experience: '5 years deep cleaning' },
    create: {
      name: 'Daniel Worker',
      email: 'worker2@heliocleaning.com',
      passwordHash,
      role: Role.WORKER,
      workerStatus: WorkerStatus.APPROVED,
      phone: '555-0105',
      city: 'Bavaro',
      experience: '5 years deep cleaning',
    },
  });

  await prisma.user.upsert({
    where: { email: 'customer@heliocleaning.com' },
    update: { name: 'Nora Customer', passwordHash, role: Role.CUSTOMER, phone: '555-0106' },
    create: {
      name: 'Nora Customer',
      email: 'customer@heliocleaning.com',
      passwordHash,
      role: Role.CUSTOMER,
      phone: '555-0106',
    },
  });

  const existingJobs = await prisma.job.count();
  if (existingJobs === 0) {
    await prisma.job.createMany({
      data: [
        {
          customerName: 'Emma Johnson',
          customerPhone: '555-0101',
          customerEmail: 'customer@heliocleaning.com',
          address: '123 Main St, Austin, TX',
          serviceType: ServiceType.STANDARD,
          scheduledDate: new Date(Date.now() + 1000 * 60 * 60 * 24),
          status: JobStatus.PENDING,
        },
        {
          customerName: 'Noah Brown',
          customerPhone: '555-0102',
          customerEmail: 'customer@heliocleaning.com',
          address: '456 Oak Ave, Austin, TX',
          serviceType: ServiceType.DEEP,
          scheduledDate: new Date(Date.now() + 1000 * 60 * 60 * 48),
          status: JobStatus.ASSIGNED,
          assignedWorkerId: workerA.id,
        },
        {
          customerName: 'Olivia Smith',
          customerPhone: '555-0103',
          customerEmail: 'customer@heliocleaning.com',
          address: '789 Pine Rd, Austin, TX',
          serviceType: ServiceType.MOVE_OUT,
          scheduledDate: new Date(Date.now() - 1000 * 60 * 60 * 12),
          status: JobStatus.IN_PROGRESS,
          assignedWorkerId: workerB.id,
        },
      ],
    });
  }

  const assignedJob = await prisma.job.findFirst({ where: { status: JobStatus.ASSIGNED } });
  if (assignedJob) {
    const existingNote = await prisma.jobNote.findFirst({
      where: { jobId: assignedJob.id, content: `Assigned by ${admin.name}. Bring eco-friendly supplies.` },
    });

    if (!existingNote) {
      await prisma.jobNote.create({
        data: {
          jobId: assignedJob.id,
          content: `Assigned by ${admin.name}. Bring eco-friendly supplies.`,
        },
      });
    }
  }
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

import { PrismaClient, Role, WorkerStatus } from '@prisma/client';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const db = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') global.prisma = db;

console.log('Connecting to database...');
void db
  .$connect()
  .then(() => {
    console.log('Database connected');
    if (!('CUSTOMER' in Role)) {
      console.error('Prisma client missing Role.CUSTOMER. Regenerate Prisma client.');
    }
    if (!WorkerStatus || !('APPROVED' in WorkerStatus)) {
      console.error('Prisma client missing WorkerStatus enum. Regenerate Prisma client.');
    }
  })
  .catch((error) => {
    console.error('Database connection error:', error);
  });

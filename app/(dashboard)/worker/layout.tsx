import type { ReactNode } from 'react';
import WorkerLocationTracker from '@/components/WorkerLocationTracker';

export default function WorkerDashboardLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <WorkerLocationTracker />
      {children}
    </>
  );
}

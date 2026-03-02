import Link from 'next/link';
import { ReactNode } from 'react';
import { getSessionFromCookie } from '@/lib/auth';
import { LogoutButton } from '@/components/logout-button';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const session = getSessionFromCookie();
  const isAdmin = session?.role === 'ADMIN';

  const dashboardHref = isAdmin ? '/admin/dashboard' : '/worker/dashboard';
  const jobsHref = isAdmin ? '/admin/jobs' : '/worker/jobs';
  const panelTitle = isAdmin ? 'Admin Panel' : 'Worker Panel';

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="hidden w-64 border-r border-slate-200 bg-white p-6 md:block">
        <h2 className="mb-6 text-lg font-semibold text-slate-800">Helio Scheduler</h2>
        <nav className="space-y-3 text-sm">
          <Link href={dashboardHref} className="block text-slate-600 transition hover:text-slate-900">
            Dashboard
          </Link>
          <Link href={jobsHref} className="block text-slate-600 transition hover:text-slate-900">
            Jobs
          </Link>
        </nav>
      </aside>

      <div className="flex-1">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <h1 className="text-lg font-semibold text-slate-800">{panelTitle}</h1>
          <LogoutButton />
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

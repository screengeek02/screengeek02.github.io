'use client';

import Link from 'next/link';
import { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import clsx from 'clsx';
import { LogoutButton } from '@/components/logout-button';

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  const dashboardHref = isAdmin ? '/admin/dashboard' : '/worker/dashboard';
  const jobsHref = isAdmin ? '/admin/jobs' : '/worker/jobs';
  const panelTitle = isAdmin ? 'Admin Panel' : 'Worker Panel';

  const navItems = [
    { label: 'Dashboard', href: dashboardHref, active: pathname.startsWith(dashboardHref) },
    { label: 'Jobs', href: jobsHref, active: pathname.startsWith(jobsHref) },
  ];

  return (
    <div className="min-h-screen bg-slate-50 md:flex">
      <aside className="hidden w-64 border-r border-slate-200 bg-white p-6 md:block">
        <h2 className="mb-6 text-lg font-semibold tracking-tight text-slate-800">Helio Scheduler</h2>
        <nav className="space-y-2 text-sm">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={clsx(
                'block rounded-lg px-3 py-2 font-medium transition',
                item.active ? 'bg-slate-100 text-slate-900' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex-1">
        <header className="sticky top-0 z-20 flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:px-6">
          <h1 className="text-base font-semibold text-slate-800 md:text-lg">{panelTitle}</h1>
          <LogoutButton className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900" />
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}

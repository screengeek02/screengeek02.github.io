'use client';

import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import clsx from 'clsx';
import { LogoutButton } from '@/components/logout-button';

type NavItem = {
  label: string;
  href?: Route;
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith('/admin');

  const primaryNav: NavItem[] = isAdmin
    ? [
        { label: 'Dashboard', href: '/admin/dashboard' },
        { label: 'Job Management', href: '/admin/jobs' },
        { label: 'Workers' },
        { label: 'Availability' },
        { label: 'Scheduling' },
        { label: 'Settings' },
      ]
    : [
        { label: 'Dashboard', href: '/worker/dashboard' },
        { label: 'Job Management', href: '/worker/jobs' },
        { label: 'Workers' },
        { label: 'Availability' },
        { label: 'Scheduling' },
        { label: 'Settings' },
      ];

  const title = 'Dashboard';
  const subtitle = isAdmin ? 'Welcome, Admin Dispatcher' : 'Welcome, Field Cleaner';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 text-slate-100">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-sky-400/15 bg-slate-950/70 p-5 backdrop-blur xl:block">
          <div className="mb-8 flex items-center gap-3 rounded-xl border border-sky-400/20 bg-slate-900/70 px-3 py-2 shadow-[0_0_24px_rgba(56,189,248,0.18)]">
            <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-sky-400 to-blue-600" />
            <div>
              <p className="text-xl font-semibold tracking-tight">Helio</p>
              <p className="text-xs text-slate-400">Dispatch Platform</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            {primaryNav.map((item) => {
              const active = item.href ? pathname.startsWith(item.href) : false;

              if (item.href) {
                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={clsx(
                      'block rounded-xl border px-3 py-2.5 text-sm font-medium transition',
                      active
                        ? 'border-sky-400/35 bg-sky-500/15 text-sky-100 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                        : 'border-transparent text-slate-300 hover:border-sky-300/20 hover:bg-slate-800/70 hover:text-white',
                    )}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <span
                  key={item.label}
                  className="block rounded-xl border border-transparent px-3 py-2.5 text-sm font-medium text-slate-500"
                >
                  {item.label}
                </span>
              );
            })}
          </nav>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-20 border-b border-sky-400/15 bg-slate-950/70 px-4 py-3 backdrop-blur md:px-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-white">{title}</h1>
                <div className="mt-1 flex items-center gap-2 text-sm text-slate-300">
                  <span>{subtitle}</span>
                  <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 text-slate-300 transition hover:border-sky-400/40 hover:text-sky-200"
                  type="button"
                  aria-label="Notifications"
                >
                  🔔
                </button>
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 text-sm font-semibold text-slate-300">
                  U
                </div>
                <LogoutButton className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:border-sky-400/40 hover:text-sky-200" />
              </div>
            </div>
          </header>

          <main className="p-4 md:p-6">{children}</main>
        </div>
      </div>
    </div>
  );
}

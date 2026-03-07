'use client';

import type { Route } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import clsx from 'clsx';
import { LogoutButton } from '@/components/logout-button';

type NavItem = {
  label: string;
  href: Route;
  icon: string;
  roles: Array<'admin' | 'worker'>;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard', icon: '▦', roles: ['admin'] },
  { label: 'Job Management', href: '/admin/jobs', icon: '▤', roles: ['admin'] },
  { label: 'Workers', href: '/admin/workers', icon: '◉', roles: ['admin'] },
  { label: 'Availability', href: '/admin/availability', icon: '◌', roles: ['admin'] },
  { label: 'Scheduling', href: '/admin/scheduling', icon: '◧', roles: ['admin'] },
  { label: 'Dispatch', href: '/admin/dispatch', icon: '⌖', roles: ['admin'] },
  { label: 'Settings', href: '/admin/settings', icon: '⚙', roles: ['admin'] },
  { label: 'Dashboard', href: '/worker/dashboard', icon: '▦', roles: ['worker'] },
  { label: 'Jobs', href: '/worker/jobs', icon: '▤', roles: ['worker'] },
  { label: 'Availability', href: '/worker/availability', icon: '◌', roles: ['worker'] },
  { label: 'Profile', href: '/worker/profile', icon: '◍', roles: ['worker'] },
  { label: 'Settings', href: '/worker/settings', icon: '⚙', roles: ['worker'] },
];

function getPageTitle(pathname: string) {
  if (pathname.includes('/jobs/')) return 'Job Details';
  if (pathname.endsWith('/jobs')) return 'Job Management';
  if (pathname.endsWith('/workers')) return 'Workers';
  if (pathname.endsWith('/availability')) return 'Availability';
  if (pathname.endsWith('/scheduling')) return 'Scheduling';
  if (pathname.endsWith('/dispatch')) return 'Dispatch';
  if (pathname.endsWith('/profile')) return 'Profile';
  if (pathname.endsWith('/settings')) return 'Settings';
  return 'Dashboard';
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const role: 'admin' | 'worker' = pathname.startsWith('/admin') ? 'admin' : 'worker';
  const roleLabel = role === 'admin' ? 'Admin' : 'Worker';

  const sidebarItems = useMemo(() => navItems.filter((item) => item.roles.includes(role)), [role]);
  const pageTitle = getPageTitle(pathname);
  const breadcrumb = role === 'admin' ? `Admin / ${pageTitle}` : `Worker / ${pageTitle}`;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100">
      <button
        type="button"
        className="fixed left-4 top-4 z-40 rounded-lg border border-slate-700 bg-slate-900/90 px-3 py-2 text-sm text-slate-200 xl:hidden"
        onClick={() => setSidebarOpen((prev) => !prev)}
      >
        ☰
      </button>

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-30 w-[260px] border-r border-sky-400/15 bg-gradient-to-b from-slate-950 to-slate-900 p-5 shadow-[0_0_35px_rgba(15,23,42,0.8)] transition-transform xl:static xl:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="mb-8 rounded-xl border border-sky-400/20 bg-slate-900/70 px-3 py-3 shadow-[0_0_24px_rgba(56,189,248,0.18)]">
          <Image
            src="/public/image/logo.png"
            alt="Helio logo"
            width={220}
            height={80}
            priority
            unoptimized
            className="h-14 w-auto object-contain md:h-16"
          />
          <p className="mt-2 text-xs text-slate-400">Dispatch Platform</p>
        </div>

        <nav className="space-y-1.5">
          {sidebarItems.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={clsx(
                  'flex items-center gap-2 rounded-xl border px-3 py-2.5 text-sm font-medium transition',
                  active
                    ? 'border-sky-500 bg-sky-900/40 text-white shadow-[0_0_20px_rgba(56,189,248,0.2)]'
                    : 'border-transparent text-slate-300 hover:border-sky-300/20 hover:bg-slate-800/70 hover:text-white',
                )}
              >
                <span className="text-slate-400">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex flex-1 flex-col xl:pl-0">
        <header className="sticky top-0 z-20 border-b border-sky-400/15 bg-slate-950/80 px-4 py-3 backdrop-blur md:px-6">
          <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-3">
            <div className="pl-12 xl:pl-0">
              <p className="text-xs uppercase tracking-wide text-slate-400">{breadcrumb}</p>
              <h1 className="text-xl font-semibold tracking-tight text-white">{pageTitle}</h1>
            </div>

            <div className="flex items-center gap-2">
              <span className="rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-200">
                {roleLabel}
              </span>
              <div className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 bg-slate-800/80 text-sm font-semibold text-slate-300">
                U
              </div>
              <LogoutButton className="rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-1.5 text-sm font-medium text-slate-200 transition hover:border-sky-400/40 hover:text-sky-200" />
            </div>
          </div>
        </header>

        <main className="flex-1 p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}

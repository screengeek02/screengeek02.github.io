import Link from 'next/link';
import { LogoutButton } from '@/components/logout-button';
import { getSessionFromCookie } from '@/lib/auth';

export default async function PublicLayout({ children }: { children: React.ReactNode }) {
  const session = getSessionFromCookie();
  const dashboardHref = session?.role === 'ADMIN' ? '/admin/dashboard' : session?.role === 'WORKER' ? '/worker/dashboard' : '/dashboard';

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/book" className="text-base font-semibold tracking-tight text-slate-800">
            Helio Service Scheduler
          </Link>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Home
            </Link>
            {!session ? (
              <Link
                href="/login"
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
              >
                Login
              </Link>
            ) : (
              <>
                <Link
                  href={dashboardHref}
                  className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900"
                >
                  Dashboard
                </Link>
                <LogoutButton className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 hover:text-slate-900" />
              </>
            )}
          </div>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

import './globals.css';
import Link from 'next/link';
import { getSessionFromCookie } from '@/lib/auth';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const session = getSessionFromCookie();

  return (
    <html lang="en">
      <body>
        <header className="border-b bg-white">
          <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
            <Link href="/book" className="font-semibold text-blue-700">Helio Service Scheduler</Link>
            <div className="flex items-center gap-4 text-sm">
              {!session && (
                <>
                  <Link href="/book" className="hover:text-blue-600">Book Now</Link>
                  <Link href="/login" className="hover:text-blue-600">Login</Link>
                </>
              )}
              {session?.role === 'ADMIN' && <Link href="/admin/dashboard" className="hover:text-blue-600">Dashboard</Link>}
              {session?.role === 'WORKER' && <Link href="/worker/dashboard" className="hover:text-blue-600">My Jobs</Link>}
              {session && (
                <form action="/api/auth/logout" method="post">
                  <button className="rounded bg-slate-800 px-3 py-1.5 text-white">Logout</button>
                </form>
              )}
            </div>
          </nav>
        </header>
        <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}

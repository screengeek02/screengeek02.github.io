import Link from 'next/link';

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <nav className="mx-auto flex w-full max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/book" className="text-base font-semibold tracking-tight text-slate-800">
            Helio Service Scheduler
          </Link>
          <Link href="/worker/jobs" className="text-sm font-medium text-slate-600 transition hover:text-slate-900">
            My Jobs
          </Link>
        </nav>
      </header>
      <main className="mx-auto w-full max-w-5xl px-4 py-8">{children}</main>
    </div>
  );
}

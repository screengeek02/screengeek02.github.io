import type { ReactNode } from 'react';

type DashboardKpiCardProps = {
  label: string;
  value: string | number;
  hint: string;
  icon: ReactNode;
  tone?: 'sky' | 'emerald' | 'cyan';
};

const toneClassMap: Record<NonNullable<DashboardKpiCardProps['tone']>, string> = {
  sky: 'text-sky-300',
  emerald: 'text-emerald-300',
  cyan: 'text-cyan-300',
};

export function DashboardKpiCard({ label, value, hint, icon, tone = 'sky' }: DashboardKpiCardProps) {
  return (
    <article className="rounded-xl border border-sky-300/15 bg-slate-900/75 p-4 shadow-[0_0_24px_rgba(56,189,248,0.1)]">
      <div className="flex items-start gap-3">
        <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-sky-300/20 bg-slate-800/80 text-lg text-slate-200">
          {icon}
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
          <p className={`mt-1 text-3xl font-semibold ${toneClassMap[tone]}`}>{value}</p>
          <p className="text-xs text-slate-400">{hint}</p>
        </div>
      </div>
    </article>
  );
}

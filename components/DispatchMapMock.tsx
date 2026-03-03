export function DispatchMapMock() {
  return (
    <div className="dispatch-map relative overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900 p-6 shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_22px_50px_-24px_rgba(14,165,233,0.5)]">
      <div className="dispatch-map-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="dispatch-map-glow pointer-events-none absolute inset-0" />

      <span className="absolute left-4 top-4 rounded-full border border-sky-400/30 bg-sky-500/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em] text-sky-200">
        Punta Cana • Bavaro
      </span>

      <div className="relative h-[280px] w-full md:h-[340px]">
        <span className="dispatch-marker dispatch-cleaner" style={{ left: '24%', top: '70%' }} />
        <span className="dispatch-marker dispatch-cleaner dispatch-drift-alt" style={{ left: '42%', top: '58%' }} />
        <span className="dispatch-marker dispatch-cleaner" style={{ left: '68%', top: '66%' }} />

        <div className="dispatch-marker-job" style={{ left: '54%', top: '35%' }}>
          <span className="dispatch-job-core" />
          <span className="dispatch-job-ring" />
          <span className="dispatch-job-label">Active Job</span>
        </div>

        <span className="dispatch-route" style={{ left: '27%', top: '61%', width: '36%', transform: 'rotate(-28deg)' }} />
      </div>
    </div>
  );
}

export function DispatchMapMock() {
  return (
    <div className="dispatch-map relative overflow-hidden rounded-xl border border-slate-700/80 bg-slate-900 p-4 shadow-[0_0_0_1px_rgba(56,189,248,0.08),0_22px_50px_-24px_rgba(14,165,233,0.5)] md:p-6">
      <div className="dispatch-map-grid pointer-events-none absolute inset-0 opacity-30" />
      <div className="dispatch-map-glow pointer-events-none absolute inset-0" />

      <span className="absolute left-4 top-4 z-10 rounded-full border border-slate-500/70 bg-slate-800/85 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-slate-100">
        Punta Cana • Bavaro
      </span>

      <div className="relative h-[260px] w-full md:h-[340px]">
        <span className="dispatch-marker dispatch-cleaner" style={{ left: '18%', top: '36%' }} />
        <span className="dispatch-marker dispatch-cleaner dispatch-drift-alt" style={{ left: '36%', top: '52%' }} />
        <span className="dispatch-marker dispatch-cleaner" style={{ left: '78%', top: '60%' }} />

        <div className="dispatch-marker-job" style={{ left: '60%', top: '44%' }}>
          <span className="dispatch-job-core" />
          <span className="dispatch-job-ring" />
          <span className="dispatch-job-label">Active Job</span>
        </div>

        <span className="dispatch-route" style={{ left: '21%', top: '45%', width: '43%', transform: 'rotate(8deg)' }} />
      </div>
    </div>
  );
}

type AvatarSpotProps = {
  name: string;
};

export function AvatarSpot({ name }: AvatarSpotProps) {
  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-sky-400/30 bg-gradient-to-br from-slate-700 to-slate-900 text-xs font-semibold text-sky-100 shadow-[0_0_14px_rgba(56,189,248,0.2)]">
      {initials || 'U'}
    </div>
  );
}

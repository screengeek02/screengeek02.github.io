'use client';

import { useFormStatus } from 'react-dom';

export function LoadingButton({ label, loadingLabel }: { label: string; loadingLabel?: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded bg-blue-600 px-4 py-2 text-white disabled:cursor-not-allowed disabled:bg-blue-300"
    >
      {pending ? loadingLabel ?? 'Loading...' : label}
    </button>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

type LogoutButtonProps = {
  className?: string;
};

export function LogoutButton({ className }: LogoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setLoading(true);

    await fetch('/api/auth/logout', {
      method: 'POST',
    });

    router.replace('/login');
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={
        className ??
        'rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-500'
      }
    >
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  );
}

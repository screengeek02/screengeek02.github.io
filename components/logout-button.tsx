'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function LogoutButton() {
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
      className="rounded bg-slate-800 px-3 py-1.5 text-white disabled:cursor-not-allowed disabled:bg-slate-500"
    >
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  );
}

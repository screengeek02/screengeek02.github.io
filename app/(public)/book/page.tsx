'use client';

import { ServiceType } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function BookPage() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setLoading(true);
    const formData = new FormData(event.currentTarget);

    const payload = {
      customerName: formData.get('customerName'),
      customerPhone: formData.get('customerPhone'),
      customerEmail: formData.get('customerEmail') || '',
      address: formData.get('address'),
      serviceType: formData.get('serviceType'),
      scheduledDate: new Date(String(formData.get('scheduledDate'))).toISOString(),
      notes: formData.get('notes') || '',
    };

    const response = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const json = await response.json();
    setLoading(false);
    if (!response.ok) {
      setError(json.error ?? 'Booking failed.');
      return;
    }

    router.push(`/book/confirmation?jobId=${json.id}`);
  }

  return (
    <section className="mx-auto max-w-2xl rounded bg-white p-6 shadow">
      <h1 className="mb-2 text-2xl font-semibold">Book a Cleaning Service</h1>
      <p className="mb-6 text-sm text-slate-600">Submit your request and our team will schedule your service.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input className="w-full rounded border p-2" placeholder="Customer Name" name="customerName" required />
        <input className="w-full rounded border p-2" placeholder="Phone" name="customerPhone" required />
        <input className="w-full rounded border p-2" placeholder="Email (optional)" name="customerEmail" />
        <input className="w-full rounded border p-2" placeholder="Address" name="address" required />
        <select className="w-full rounded border p-2" name="serviceType" defaultValue={ServiceType.STANDARD}>
          <option value={ServiceType.STANDARD}>Standard</option>
          <option value={ServiceType.DEEP}>Deep</option>
          <option value={ServiceType.MOVE_OUT}>Move Out</option>
        </select>
        <input className="w-full rounded border p-2" type="datetime-local" name="scheduledDate" required />
        <textarea className="w-full rounded border p-2" placeholder="Notes (optional)" name="notes" rows={4} />
        {error && <p className="text-sm text-rose-600">{error}</p>}
        <button className="w-full rounded bg-blue-600 py-2 text-white" disabled={loading}>
          {loading ? 'Submitting...' : 'Submit Booking'}
        </button>
      </form>
    </section>
  );
}

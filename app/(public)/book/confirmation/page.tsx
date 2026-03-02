import Link from 'next/link';
import { db } from '@/lib/db';

export default async function ConfirmationPage({
  searchParams,
}: {
  searchParams: { jobId?: string };
}) {
  const job = searchParams.jobId
    ? await db.job.findUnique({ where: { id: searchParams.jobId } })
    : null;

  return (
    <section className="mx-auto max-w-xl rounded bg-white p-6 shadow">
      <h1 className="text-2xl font-semibold text-green-700">Booking Confirmed</h1>
      <p className="mt-2 text-slate-700">Thanks for your request. We will follow up shortly.</p>
      {job && (
        <div className="mt-4 space-y-1 rounded bg-slate-50 p-3 text-sm">
          <p><strong>Job ID:</strong> {job.id}</p>
          <p><strong>Name:</strong> {job.customerName}</p>
          <p><strong>Scheduled:</strong> {new Date(job.scheduledDate).toLocaleString()}</p>
          <p><strong>Status:</strong> {job.status}</p>
        </div>
      )}
      <Link href="/book" className="mt-5 inline-block text-blue-600">Book another service</Link>
    </section>
  );
}

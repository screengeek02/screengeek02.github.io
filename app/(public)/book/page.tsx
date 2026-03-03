import { BookingForm } from '@/components/BookingForm';

export default function BookPage() {
  return (
    <section className="mx-auto w-full max-w-4xl px-1 py-4 sm:px-2 md:py-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-700">Book Helio Service</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-slate-900">Schedule Your Cleaning</h1>
        <p className="mt-2 text-sm text-slate-600 md:text-base">
          Choose your service details and our team will confirm your Punta Cana booking quickly.
        </p>

        <div className="mt-6 border-t border-slate-200 pt-6">
          <BookingForm />
        </div>
      </div>
    </section>
  );
}

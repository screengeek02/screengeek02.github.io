import { BookingForm } from '@/components/BookingForm';

export default function BookPage() {
  return (
    <section className="relative mx-auto w-full max-w-5xl px-2 py-6 md:py-10">
      <div className="pointer-events-none absolute inset-x-0 -top-10 h-40 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.24),transparent_72%)]" />
      <div className="relative overflow-hidden rounded-2xl border border-slate-700/70 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-900 p-6 shadow-2xl md:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-sky-300">Book Helio Service</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">Schedule Your Cleaning</h1>
        <p className="mt-2 text-sm text-slate-300 md:text-base">
          Book trusted cleaners for your villa, Airbnb, or apartment in Punta Cana and Bavaro.
        </p>

        <div className="mt-6 border-t border-slate-700/80 pt-6">
          <BookingForm />
        </div>
      </div>
    </section>
  );
}

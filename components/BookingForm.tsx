'use client';

import { ServiceType } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { FormEvent, useMemo, useState } from 'react';

type BookingValues = {
  fullName: string;
  email: string;
  phone: string;
  serviceType: ServiceType;
  scheduledDate: string;
  scheduledTime: string;
  address: string;
  notes: string;
};

type BookingErrors = Partial<Record<keyof BookingValues, string>>;

const SERVICE_OPTIONS: Array<{ label: string; value: ServiceType }> = [
  { label: 'Standard', value: ServiceType.STANDARD },
  { label: 'Deep', value: ServiceType.DEEP },
  { label: 'Move Out', value: ServiceType.MOVE_OUT },
];

const phonePattern = /^\+?[0-9()\-\s]{7,20}$/;

function toDateTimeISO(date: string, time: string) {
  return new Date(`${date}T${time}`).toISOString();
}

export function BookingForm() {
  const router = useRouter();
  const [values, setValues] = useState<BookingValues>({
    fullName: '',
    email: '',
    phone: '',
    serviceType: ServiceType.STANDARD,
    scheduledDate: '',
    scheduledTime: '',
    address: '',
    notes: '',
  });
  const [errors, setErrors] = useState<BookingErrors>({});
  const [globalError, setGlobalError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  function validateForm(next: BookingValues) {
    const nextErrors: BookingErrors = {};

    if (!next.fullName.trim()) nextErrors.fullName = 'Full name is required.';

    if (!next.email.trim()) {
      nextErrors.email = 'Email address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.email)) {
      nextErrors.email = 'Please enter a valid email address.';
    }

    if (!next.phone.trim()) {
      nextErrors.phone = 'Phone number is required.';
    } else if (!phonePattern.test(next.phone)) {
      nextErrors.phone = 'Please enter a valid phone number.';
    }

    if (!next.scheduledDate) {
      nextErrors.scheduledDate = 'Please select a date.';
    }

    if (!next.scheduledTime) {
      nextErrors.scheduledTime = 'Please select a time.';
    }

    if (next.scheduledDate && next.scheduledTime) {
      const scheduled = new Date(`${next.scheduledDate}T${next.scheduledTime}`);
      if (Number.isNaN(scheduled.getTime())) {
        nextErrors.scheduledDate = 'Please choose a valid date and time.';
      } else if (scheduled.getTime() < Date.now()) {
        nextErrors.scheduledDate = 'Scheduled date and time cannot be in the past.';
      }
    }

    if (!next.address.trim()) nextErrors.address = 'Address is required.';

    return nextErrors;
  }

  function updateField<K extends keyof BookingValues>(field: K, value: BookingValues[K]) {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setGlobalError('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGlobalError('');
    setSuccess('');

    const nextErrors = validateForm(values);
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);

    try {
      const scheduledDateTime = toDateTimeISO(values.scheduledDate, values.scheduledTime);
      const payload = {
        fullName: values.fullName,
        email: values.email,
        phone: values.phone,
        serviceType: values.serviceType,
        scheduledDate: scheduledDateTime,
        scheduledTime: values.scheduledTime,
        address: values.address,
        notes: values.notes,
        customerName: values.fullName,
        customerEmail: values.email,
        customerPhone: values.phone,
      };

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json: { error?: string; id?: string } = await response.json();

      if (!response.ok || !json.id) {
        setGlobalError(json.error ?? 'Unable to submit your booking right now. Please try again.');
        setLoading(false);
        return;
      }

      setSuccess('Booking submitted successfully. Redirecting...');
      setLoading(false);
      router.push(`/book/confirmation?jobId=${json.id}`);
    } catch {
      setGlobalError('Network error while booking. Please try again.');
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Full name" error={errors.fullName}>
          <input
            value={values.fullName}
            onChange={(event) => updateField('fullName', event.target.value)}
            className={inputClass(Boolean(errors.fullName))}
            placeholder="Jane Doe"
            autoComplete="name"
            required
          />
        </Field>

        <Field label="Email address" error={errors.email}>
          <input
            value={values.email}
            onChange={(event) => updateField('email', event.target.value)}
            className={inputClass(Boolean(errors.email))}
            placeholder="jane@email.com"
            autoComplete="email"
            type="email"
            required
          />
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Phone number" error={errors.phone}>
          <input
            value={values.phone}
            onChange={(event) => updateField('phone', event.target.value)}
            className={inputClass(Boolean(errors.phone))}
            placeholder="+1 (809) 555-1234"
            autoComplete="tel"
            required
          />
        </Field>

        <Field label="Service type">
          <select
            value={values.serviceType}
            onChange={(event) => updateField('serviceType', event.target.value as ServiceType)}
            className={inputClass(false)}
            required
          >
            {SERVICE_OPTIONS.map((service) => (
              <option key={service.value} value={service.value}>
                {service.label}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Scheduled date" error={errors.scheduledDate}>
          <input
            value={values.scheduledDate}
            onChange={(event) => updateField('scheduledDate', event.target.value)}
            className={inputClass(Boolean(errors.scheduledDate))}
            type="date"
            min={minDate}
            required
          />
        </Field>

        <Field label="Scheduled time" error={errors.scheduledTime}>
          <input
            value={values.scheduledTime}
            onChange={(event) => updateField('scheduledTime', event.target.value)}
            className={inputClass(Boolean(errors.scheduledTime))}
            type="time"
            required
          />
        </Field>
      </div>

      <Field label="Address" error={errors.address}>
        <input
          value={values.address}
          onChange={(event) => updateField('address', event.target.value)}
          className={inputClass(Boolean(errors.address))}
          placeholder="Street, building, apartment"
          autoComplete="street-address"
          required
        />
      </Field>

      <Field label="Additional notes (optional)">
        <textarea
          value={values.notes}
          onChange={(event) => updateField('notes', event.target.value)}
          className={inputClass(false)}
          rows={4}
          placeholder="Access details, preferences, or special instructions"
        />
      </Field>

      {globalError && (
        <p className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700">{globalError}</p>
      )}
      {success && (
        <p className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{success}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex w-full items-center justify-center rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'Submitting booking...' : 'Submit Booking'}
      </button>
    </form>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
      {error && <span className="mt-1 block text-xs text-rose-600">{error}</span>}
    </label>
  );
}

function inputClass(hasError: boolean) {
  return [
    'w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition',
    'placeholder:text-slate-400 focus:ring-2',
    hasError
      ? 'border-rose-300 focus:border-rose-400 focus:ring-rose-100'
      : 'border-slate-300 focus:border-sky-400 focus:ring-sky-100',
  ].join(' ');
}

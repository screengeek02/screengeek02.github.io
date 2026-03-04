'use client';

import { ServiceType } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { FormEvent, useEffect, useMemo, useState } from 'react';

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

type ValidationErrorPayload = {
  success: false;
  type: 'validation';
  message?: string;
  errors?: {
    fieldErrors?: Record<string, string[] | undefined>;
    formErrors?: string[];
  };
};

type ServerErrorPayload = {
  success: false;
  type: 'server';
  message: string;
};

type SuccessPayload = {
  success: true;
  jobId: string;
  scheduledDate: string;
  status: 'PENDING';
};

type AvailabilityPayload = {
  slots: string[];
};

const SERVICE_OPTIONS: Array<{ label: string; value: ServiceType }> = [
  { label: 'Standard', value: ServiceType.STANDARD },
  { label: 'Deep', value: ServiceType.DEEP },
  { label: 'Move Out', value: ServiceType.MOVE_OUT },
];

const phonePattern = /^\+?[0-9()\-\s]{7,20}$/;

const apiToFormField: Record<string, keyof BookingValues> = {
  customerName: 'fullName',
  customerEmail: 'email',
  customerPhone: 'phone',
  serviceType: 'serviceType',
  scheduledDate: 'scheduledDate',
  address: 'address',
  notes: 'notes',
};

function toDateTimeISO(date: string, time: string) {
  return new Date(`${date}T${time}`).toISOString();
}

function formatScheduledDate(isoDate: string) {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDate));
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
  const [successData, setSuccessData] = useState<{ jobId: string; scheduledDate: string } | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [loading, setLoading] = useState(false);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsError, setSlotsError] = useState('');
  const [mounted, setMounted] = useState(false);

  const minDate = useMemo(() => new Date().toISOString().split('T')[0], []);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!showToast) return;

    const timer = window.setTimeout(() => {
      setShowToast(false);
    }, 2600);

    return () => {
      window.clearTimeout(timer);
    };
  }, [showToast]);

  useEffect(() => {
    if (!values.scheduledDate) {
      setAvailableSlots([]);
      setSlotsError('');
      return;
    }

    let active = true;
    setSlotsLoading(true);
    setSlotsError('');
    setValues((prev) => ({ ...prev, scheduledTime: '' }));

    const loadSlots = async () => {
      try {
        const response = await fetch(`/api/availability?date=${values.scheduledDate}`);
        if (!response.ok) {
          throw new Error('Could not load time slots.');
        }

        const json = (await response.json()) as AvailabilityPayload;
        if (!active) return;
        setAvailableSlots(json.slots);
      } catch {
        if (!active) return;
        setAvailableSlots([]);
        setSlotsError('Unable to load available time slots for this date.');
      } finally {
        if (active) {
          setSlotsLoading(false);
        }
      }
    };

    void loadSlots();

    return () => {
      active = false;
    };
  }, [values.scheduledDate]);

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

  function applyApiValidationErrors(payload: ValidationErrorPayload) {
    if (payload.message) {
      setGlobalError(payload.message);
    }

    const fieldErrors = payload.errors?.fieldErrors;
    if (!fieldErrors) return;

    const nextErrors: BookingErrors = {};
    for (const [apiField, messages] of Object.entries(fieldErrors)) {
      const mappedField = apiToFormField[apiField];
      if (mappedField && messages?.[0]) {
        nextErrors[mappedField] = messages[0];
      }
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors((prev) => ({ ...prev, ...nextErrors }));
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setGlobalError('');
    setSuccessData(null);

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

      const json = (await response.json()) as SuccessPayload | ValidationErrorPayload | ServerErrorPayload;

      if (!response.ok) {
        if ('type' in json && json.type === 'validation') {
          applyApiValidationErrors(json);
        } else if ('type' in json && json.type === 'server') {
          setGlobalError(json.message ?? 'Unable to submit your booking right now.');
        } else {
          setGlobalError('Unable to submit your booking right now.');
        }
        setLoading(false);
        return;
      }

      if (!('success' in json && json.success)) {
        setGlobalError('Unexpected booking response. Please try again.');
        setLoading(false);
        return;
      }

      setSuccessData({ jobId: json.jobId, scheduledDate: json.scheduledDate });
      setShowToast(true);
      setLoading(false);

      window.setTimeout(() => {
        router.push(`/book/confirmation?jobId=${json.jobId}`);
      }, 900);
    } catch {
      setGlobalError('Network error while booking. Please try again.');
      setLoading(false);
    }
  }

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className={`space-y-5 transition-all duration-500 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'}`}
        aria-describedby={globalError ? 'booking-global-error' : undefined}
      >
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Full name" error={errors.fullName} fieldId="fullName">
            <input
              id="fullName"
              value={values.fullName}
              onChange={(event) => updateField('fullName', event.target.value)}
              className={inputClass(Boolean(errors.fullName))}
              placeholder="Jane Doe"
              autoComplete="name"
              aria-invalid={Boolean(errors.fullName)}
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
              required
            />
          </Field>

          <Field label="Email address" error={errors.email} fieldId="email">
            <input
              id="email"
              value={values.email}
              onChange={(event) => updateField('email', event.target.value)}
              className={inputClass(Boolean(errors.email))}
              placeholder="jane@email.com"
              autoComplete="email"
              type="email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby={errors.email ? 'email-error' : undefined}
              required
            />
          </Field>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Phone number" error={errors.phone} fieldId="phone">
            <input
              id="phone"
              value={values.phone}
              onChange={(event) => updateField('phone', event.target.value)}
              className={inputClass(Boolean(errors.phone))}
              placeholder="+1 (809) 555-1234"
              autoComplete="tel"
              aria-invalid={Boolean(errors.phone)}
              aria-describedby={errors.phone ? 'phone-error' : undefined}
              required
            />
          </Field>

          <Field label="Service type" fieldId="serviceType">
            <select
              id="serviceType"
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
          <Field label="Scheduled date" error={errors.scheduledDate} fieldId="scheduledDate">
            <input
              id="scheduledDate"
              value={values.scheduledDate}
              onChange={(event) => updateField('scheduledDate', event.target.value)}
              className={inputClass(Boolean(errors.scheduledDate))}
              type="date"
              min={minDate}
              aria-invalid={Boolean(errors.scheduledDate)}
              aria-describedby={errors.scheduledDate ? 'scheduledDate-error' : undefined}
              required
            />
          </Field>

          <Field label="Scheduled time" error={errors.scheduledTime} fieldId="scheduledTime">
            <div id="scheduledTime" className="space-y-2" aria-live="polite">
              {slotsLoading ? (
                <p className="text-sm text-slate-300">Loading available slots...</p>
              ) : availableSlots.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                  {availableSlots.map((slot) => {
                    const isSelected = values.scheduledTime === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => updateField('scheduledTime', slot)}
                        className={`rounded-lg border px-4 py-2 text-sm transition ${
                          isSelected
                            ? 'border-sky-400 bg-sky-500 text-white'
                            : 'border-slate-700 bg-slate-800 text-slate-100 hover:border-sky-400/70 hover:text-sky-200'
                        }`}
                        aria-pressed={isSelected}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-slate-300">No available slots for this date.</p>
              )}

              {slotsError && <p className="text-xs text-rose-300">{slotsError}</p>}
            </div>
          </Field>
        </div>

        <Field label="Address" error={errors.address} fieldId="address">
          <input
            id="address"
            value={values.address}
            onChange={(event) => updateField('address', event.target.value)}
            className={inputClass(Boolean(errors.address))}
            placeholder="Street, building, apartment"
            autoComplete="street-address"
            aria-invalid={Boolean(errors.address)}
            aria-describedby={errors.address ? 'address-error' : undefined}
            required
          />
        </Field>

        <Field label="Additional notes (optional)" fieldId="notes">
          <textarea
            id="notes"
            value={values.notes}
            onChange={(event) => updateField('notes', event.target.value)}
            className={inputClass(false)}
            rows={4}
            placeholder="Access details, preferences, or special instructions"
          />
        </Field>

        {globalError && (
          <p id="booking-global-error" className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-200" role="alert">
            {globalError}
          </p>
        )}

        {successData && (
          <p className="rounded-xl border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-200" role="status">
            Booking created • Job ID: <span className="font-semibold">{successData.jobId}</span> • Scheduled for{' '}
            <span className="font-semibold">{formatScheduledDate(successData.scheduledDate)}</span>
          </p>
        )}

        <button
          type="submit"
          disabled={loading || !values.scheduledTime}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-sky-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:opacity-60"
          aria-busy={loading}
        >
          {loading && <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-700 border-t-transparent" />}
          {loading ? 'Submitting booking...' : 'Submit Booking'}
        </button>
      </form>

      <div
        className={`pointer-events-none fixed right-4 top-4 z-50 transform rounded-xl border border-emerald-300/40 bg-slate-900/95 px-4 py-3 text-sm text-emerald-200 shadow-xl transition-all duration-300 ${
          showToast ? 'translate-y-0 opacity-100' : '-translate-y-2 opacity-0'
        }`}
        role="status"
        aria-live="polite"
      >
        {successData ? `Booking ${successData.jobId} submitted` : 'Booking submitted'}
      </div>
    </>
  );
}

function Field({
  label,
  error,
  fieldId,
  children,
}: {
  label: string;
  error?: string;
  fieldId: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block" htmlFor={fieldId}>
      <span className="mb-1.5 block text-sm font-medium text-slate-100">{label}</span>
      {children}
      {error && (
        <span id={`${fieldId}-error`} className="mt-1 block text-xs text-rose-300">
          {error}
        </span>
      )}
    </label>
  );
}

function inputClass(hasError: boolean) {
  return [
    'w-full rounded-xl border bg-slate-900/70 px-3 py-2.5 text-sm text-slate-100 shadow-sm outline-none transition',
    'placeholder:text-slate-400 focus:ring-2 focus:ring-offset-0',
    hasError
      ? 'border-rose-400/60 focus:border-rose-300 focus:ring-rose-300/20'
      : 'border-slate-700 focus:border-sky-400 focus:ring-sky-300/20',
  ].join(' ');
}

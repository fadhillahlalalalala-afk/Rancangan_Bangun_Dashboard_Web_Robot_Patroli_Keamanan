import type { InputHTMLAttributes } from 'react';

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  id: string;
  label: string;
  error?: string;
  hint?: string;
}

export default function TextField({ id, label, error, hint, required, ...rest }: Props) {
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : ''].filter(Boolean).join(' ') || undefined;
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <input
        id={id}
        name={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy}
        className={`block min-h-11 w-full rounded-md border px-3 py-2 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700 ${error ? 'border-red-700' : 'border-slate-500'}`}
        {...rest}
      />
      {hint && <p id={`${id}-hint`} className="mt-1 text-sm text-slate-700">{hint}</p>}
      {error && <p id={`${id}-error`} className="mt-1 text-sm font-medium text-red-800">{error}</p>}
    </div>
  );
}

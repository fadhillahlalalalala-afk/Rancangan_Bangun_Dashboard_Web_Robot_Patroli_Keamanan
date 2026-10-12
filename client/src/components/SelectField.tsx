import type { SelectHTMLAttributes } from 'react';

interface Props extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'> {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  error?: string;
}

export default function SelectField({ id, label, options, error, required, ...rest }: Props) {
  return (
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium">
        {label}
        {required && <span aria-hidden="true"> *</span>}
      </label>
      <select
        id={id}
        name={id}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className={`block min-h-11 w-full rounded-md border bg-white px-3 py-2 text-base focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700 ${error ? 'border-red-700' : 'border-slate-500'}`}
        {...rest}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      {error && <p id={`${id}-error`} className="mt-1 text-sm font-medium text-red-800">{error}</p>}
    </div>
  );
}

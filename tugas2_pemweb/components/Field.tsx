export function Field({
  id,
  label,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  error?: string[];
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      {children}
      {hint && <p className="hint" id={`${id}-hint`}>{hint}</p>}
      {error && (
        <p className="field-error" id={`${id}-error`} role="alert">
          {error[0]}
        </p>
      )}
    </div>
  );
}

export function aria(id: string, error?: string[], hint?: boolean) {
  return {
    "aria-invalid": error ? true : undefined,
    "aria-describedby": [hint ? `${id}-hint` : null, error ? `${id}-error` : null].filter(Boolean).join(" ") || undefined,
  } as const;
}

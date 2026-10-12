interface Props {
  label: string;
  value: string | number;
  hint?: string;
}

// Dipakai di dalam <dl> agar relasi label-nilai terbaca pembaca layar.
export default function StatCard({ label, value, hint }: Props) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <dt className="text-sm font-medium text-slate-700">{label}</dt>
      <dd className="mt-1 text-2xl font-bold">{value}</dd>
      {hint && <dd className="mt-1 text-xs text-slate-700">{hint}</dd>}
    </div>
  );
}

import type { ReactNode } from 'react';

type Tone = 'merah' | 'kuning' | 'hijau' | 'abu';

const tones: Record<Tone, string> = {
  merah: 'bg-red-100 text-red-900',
  kuning: 'bg-amber-100 text-amber-900',
  hijau: 'bg-green-100 text-green-900',
  abu: 'bg-slate-200 text-slate-900',
};

export default function Badge({ tone = 'abu', children }: { tone?: Tone; children: ReactNode }) {
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

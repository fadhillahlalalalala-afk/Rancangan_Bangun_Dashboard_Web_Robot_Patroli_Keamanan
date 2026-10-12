import { formatWaktu, LABEL_JENIS } from '../lib/format';
import type { Kejadian } from '../types';
import Badge from './Badge';

export default function EventTable({ data, caption }: { data: Kejadian[]; caption: string }) {
  if (data.length === 0) {
    return <p role="status" className="py-6 text-center text-slate-700">Tidak ada kejadian yang cocok.</p>;
  }
  return (
    <div className="overflow-x-auto" role="region" aria-label={`${caption} (dapat digulir)`} tabIndex={0}>
      <table className="w-full min-w-[34rem] text-left text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead className="border-b border-slate-300">
          <tr>
            <th scope="col" className="py-2 pr-4 font-semibold">Waktu</th>
            <th scope="col" className="py-2 pr-4 font-semibold">Jenis</th>
            <th scope="col" className="py-2 pr-4 font-semibold">Titik</th>
            <th scope="col" className="py-2 pr-4 font-semibold">Arah</th>
            <th scope="col" className="py-2 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody>
          {data.map((k) => (
            <tr key={k.id} className="border-b border-slate-200">
              <td className="py-2 pr-4">{formatWaktu(k.waktu)}</td>
              <td className="py-2 pr-4">{LABEL_JENIS[k.jenis]}</td>
              <td className="py-2 pr-4">{k.titik}</td>
              <td className="py-2 pr-4">{k.arah}</td>
              <td className="py-2">
                <Badge tone={k.status === 'baru' ? 'merah' : 'hijau'}>{k.status === 'baru' ? 'Baru' : 'Ditangani'}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

import { useMemo, useState } from 'react';
import Card from '../components/Card';
import EventTable from '../components/EventTable';
import PageHeader from '../components/PageHeader';
import SelectField from '../components/SelectField';
import TextField from '../components/TextField';
import { MOCK_KEJADIAN } from '../data/mock';
import { usePageTitle } from '../lib/usePageTitle';

const opsiJenis = [
  { value: 'semua', label: 'Semua jenis' },
  { value: 'gerak', label: 'Gerakan' },
  { value: 'getar', label: 'Getaran' },
  { value: 'perintah', label: 'Perintah' },
];

export default function Riwayat() {
  usePageTitle('Riwayat Kejadian');
  const [jenis, setJenis] = useState('semua');
  const [cari, setCari] = useState('');

  const data = useMemo(
    () =>
      MOCK_KEJADIAN.filter(
        (k) => (jenis === 'semua' || k.jenis === jenis) && k.titik.toLowerCase().includes(cari.trim().toLowerCase()),
      ),
    [jenis, cari],
  );

  return (
    <>
      <PageHeader title="Riwayat Kejadian" description="Semua peringatan dan perintah yang tercatat." />
      <Card>
        <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <SelectField id="jenis" label="Jenis kejadian" options={opsiJenis} value={jenis} onChange={(e) => setJenis(e.target.value)} />
          <TextField id="cari" label="Cari titik" placeholder="Contoh: Titik B" value={cari} onChange={(e) => setCari(e.target.value)} />
        </div>
        <p role="status" className="mb-2 text-sm text-slate-700">{data.length} kejadian ditampilkan</p>
        <EventTable data={data} caption="Riwayat kejadian robot patroli" />
      </Card>
    </>
  );
}

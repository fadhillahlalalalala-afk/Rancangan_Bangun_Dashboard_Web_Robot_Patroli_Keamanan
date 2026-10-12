import { useState, type FormEvent } from 'react';
import Badge from '../components/Badge';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import SelectField from '../components/SelectField';
import TextField from '../components/TextField';
import { MOCK_TITIK_JAGA } from '../data/mock';
import { usePageTitle } from '../lib/usePageTitle';
import { validateTitik, type Errors } from '../lib/validation';
import type { TitikJaga as TitikJagaT, Zona } from '../types';

const opsiZona = [
  { value: '', label: 'Pilih zona' },
  { value: 'A', label: 'Zona A' },
  { value: 'B', label: 'Zona B' },
  { value: 'C', label: 'Zona C' },
  { value: 'D', label: 'Zona D' },
];
const awal = { nama: '', zona: '', durasi: '8', catatan: '' };

export default function TitikJaga() {
  usePageTitle('Titik Jaga');
  const [daftar, setDaftar] = useState<TitikJagaT[]>(MOCK_TITIK_JAGA);
  const [v, setV] = useState(awal);
  const [errors, setErrors] = useState<Errors>({});
  const [pesan, setPesan] = useState('');

  const ubah = (k: keyof typeof awal) => (e: { target: { value: string } }) => {
    setV((s) => ({ ...s, [k]: e.target.value }));
    setErrors((s) => ({ ...s, [k]: '' }));
    setPesan('');
  };

  function kirim(e: FormEvent) {
    e.preventDefault();
    const err = validateTitik(v);
    setErrors(err);
    const pertama = Object.keys(err)[0];
    if (pertama) {
      document.getElementById(pertama)?.focus();
      return;
    }
    setDaftar((d) => [
      ...d,
      { id: `tj-${Date.now()}`, nama: v.nama.trim(), zona: v.zona as Zona, durasiScan: Number(v.durasi), catatan: v.catatan.trim() },
    ]);
    setPesan(`Titik jaga "${v.nama.trim()}" berhasil ditambahkan (data tiruan, belum disimpan ke server).`);
    setV(awal);
  }

  return (
    <>
      <PageHeader title="Titik Jaga" description="Atur titik berhenti robot saat memindai gerakan." />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Tambah titik jaga">
          <form onSubmit={kirim} noValidate className="space-y-4" aria-label="Form tambah titik jaga">
            <TextField id="nama" label="Nama titik" required value={v.nama} onChange={ubah('nama')} error={errors.nama} hint="3 sampai 30 karakter." />
            <SelectField id="zona" label="Zona" required options={opsiZona} value={v.zona} onChange={ubah('zona')} error={errors.zona} />
            <TextField id="durasi" label="Durasi pindai (detik)" required type="number" inputMode="numeric" value={v.durasi} onChange={ubah('durasi')} error={errors.durasi} hint="Bilangan bulat 3 sampai 30." />
            <TextField id="catatan" label="Catatan" value={v.catatan} onChange={ubah('catatan')} error={errors.catatan} hint="Opsional, maksimal 100 karakter." />
            <Button type="submit">Simpan titik jaga</Button>
            <p role="status" className="text-sm font-medium text-green-900">{pesan}</p>
          </form>
        </Card>
        <Card title={`Daftar titik jaga (${daftar.length})`}>
          <ul className="space-y-3">
            {daftar.map((t) => (
              <li key={t.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{t.nama}</span>
                  <Badge tone="abu">Zona {t.zona}</Badge>
                </div>
                <p className="mt-1 text-sm text-slate-700">Pindai {t.durasiScan} detik{t.catatan ? `. ${t.catatan}` : ''}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </>
  );
}

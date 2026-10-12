import { Link } from 'react-router-dom';
import Card from '../components/Card';
import EventTable from '../components/EventTable';
import PageHeader from '../components/PageHeader';
import StatCard from '../components/StatCard';
import { MOCK_KEJADIAN, MOCK_ROBOT } from '../data/mock';
import { usePageTitle } from '../lib/usePageTitle';

export default function Dashboard() {
  usePageTitle('Dashboard');
  const hariIni = MOCK_KEJADIAN.filter((k) => k.waktu.startsWith('2026-10-12')).length;
  const belum = MOCK_KEJADIAN.filter((k) => k.status === 'baru').length;

  return (
    <>
      <PageHeader title="Dashboard" description="Ringkasan kondisi robot patroli dan kejadian terbaru di lab." />
      <dl className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Status robot" value={MOCK_ROBOT.status} hint={MOCK_ROBOT.nama} />
        <StatCard label="Kejadian hari ini" value={hariIni} />
        <StatCard label="Belum ditangani" value={belum} hint="Perlu dicek admin" />
        <StatCard label="Baterai" value={`${MOCK_ROBOT.baterai}%`} />
      </dl>
      <Card title="Kejadian terbaru">
        <EventTable data={MOCK_KEJADIAN.slice(0, 5)} caption="Lima kejadian terbaru" />
        <p className="mt-4 text-sm">
          <Link to="/riwayat" className="font-semibold text-indigo-800 underline">Lihat seluruh riwayat</Link>
        </p>
      </Card>
    </>
  );
}

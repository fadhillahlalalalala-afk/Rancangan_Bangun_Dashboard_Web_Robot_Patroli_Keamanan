import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { usePageTitle } from '../lib/usePageTitle';

export default function NotFound() {
  usePageTitle('Halaman tidak ditemukan');
  return (
    <>
      <PageHeader title="Halaman tidak ditemukan" description="Alamat yang kamu buka tidak ada." />
      <Link to="/" className="font-semibold text-indigo-800 underline">Kembali ke dashboard</Link>
    </>
  );
}

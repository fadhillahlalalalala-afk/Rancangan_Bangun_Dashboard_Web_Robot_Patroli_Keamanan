import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <>
      <a
        href="#konten"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-10 focus:rounded focus:bg-white focus:px-3 focus:py-2 focus:text-indigo-800"
      >
        Lewati ke konten utama
      </a>
      <Navbar />
      <main id="konten" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-6 sm:py-8">
        <Outlet />
      </main>
      <footer className="mx-auto max-w-5xl px-4 py-6 text-sm text-slate-700">
        SecureBot, milestone 1. Data pada halaman ini adalah data tiruan.
      </footer>
    </>
  );
}

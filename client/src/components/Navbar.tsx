import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/riwayat', label: 'Riwayat' },
  { to: '/titik-jaga', label: 'Titik Jaga' },
  { to: '/masuk', label: 'Masuk' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-2 px-4 py-3">
        <Link to="/" className="rounded text-xl font-bold text-indigo-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700">
          SecureBot
        </Link>
        <button
          type="button"
          className="min-h-11 rounded-md border border-slate-400 px-3 text-sm font-semibold md:hidden focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700"
          aria-expanded={open}
          aria-controls="menu-utama"
          onClick={() => setOpen((o) => !o)}
        >
          {open ? 'Tutup menu' : 'Buka menu'}
        </button>
        <nav aria-label="Navigasi utama" id="menu-utama" className={`${open ? 'block' : 'hidden'} w-full md:block md:w-auto`}>
          <ul className="flex flex-col gap-1 md:flex-row">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === '/'}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center rounded-md px-3 text-sm font-medium focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-700 ${isActive ? 'bg-indigo-700 text-white' : 'text-slate-900 hover:bg-slate-100'}`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}

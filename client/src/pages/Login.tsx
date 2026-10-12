import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import TextField from '../components/TextField';
import { usePageTitle } from '../lib/usePageTitle';
import { validateLogin, type Errors } from '../lib/validation';

export default function Login() {
  usePageTitle('Masuk');
  const navigate = useNavigate();
  const [v, setV] = useState({ username: '', password: '' });
  const [errors, setErrors] = useState<Errors>({});

  function kirim(e: FormEvent) {
    e.preventDefault();
    const err = validateLogin(v);
    setErrors(err);
    const pertama = Object.keys(err)[0];
    if (pertama) {
      document.getElementById(pertama)?.focus();
      return;
    }
    navigate('/'); // Milestone 1: belum ada autentikasi sungguhan
  }

  return (
    <div className="mx-auto max-w-md">
      <PageHeader title="Masuk" description="Masuk sebagai admin untuk memantau robot." />
      <Card>
        <form onSubmit={kirim} noValidate className="space-y-4" aria-label="Form masuk">
          <TextField id="username" label="Nama pengguna" required autoComplete="username" value={v.username}
            onChange={(e) => { setV({ ...v, username: e.target.value }); setErrors({ ...errors, username: '' }); }} error={errors.username} />
          <TextField id="password" label="Password" required type="password" autoComplete="current-password" value={v.password}
            onChange={(e) => { setV({ ...v, password: e.target.value }); setErrors({ ...errors, password: '' }); }} error={errors.password}
            hint="Minimal 8 karakter." />
          <Button type="submit" className="w-full">Masuk</Button>
        </form>
        <p className="mt-4 text-sm text-slate-700">
          Catatan: pada milestone ini validasi hanya di sisi klien. Autentikasi sungguhan ditambahkan setelah server dibuat.
        </p>
      </Card>
    </div>
  );
}

export type Errors = Record<string, string>;

export function validateLogin(v: { username: string; password: string }): Errors {
  const e: Errors = {};
  const user = v.username.trim();
  if (!user) e.username = 'Nama pengguna wajib diisi.';
  else if (user.length < 3) e.username = 'Nama pengguna minimal 3 karakter.';

  if (!v.password) e.password = 'Password wajib diisi.';
  else if (v.password.length < 8) e.password = 'Password minimal 8 karakter.';
  return e;
}

export function validateTitik(v: { nama: string; zona: string; durasi: string; catatan: string }): Errors {
  const e: Errors = {};
  const nama = v.nama.trim();
  if (!nama) e.nama = 'Nama titik wajib diisi.';
  else if (nama.length < 3 || nama.length > 30) e.nama = 'Nama titik harus 3 sampai 30 karakter.';

  if (!['A', 'B', 'C', 'D'].includes(v.zona)) e.zona = 'Pilih zona A, B, C, atau D.';

  const durasi = Number(v.durasi);
  if (v.durasi.trim() === '') e.durasi = 'Durasi pindai wajib diisi.';
  else if (!Number.isInteger(durasi) || durasi < 3 || durasi > 30) e.durasi = 'Durasi harus bilangan bulat 3 sampai 30 detik.';

  if (v.catatan.length > 100) e.catatan = 'Catatan maksimal 100 karakter.';
  return e;
}

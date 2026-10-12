# SecureBot Client (Milestone 1, Pengembangan Aplikasi Web)

Antarmuka web SecureBot. Berada di folder `client/` pada repository yang sama dengan backend
dan komponen kriptografi di folder induknya.

## Produk
**Nama:** SecureBot Dashboard
**Tujuan:** memantau robot patroli keamanan di lab dan menampilkan kejadian yang perlu ditangani.

**Permasalahan yang diselesaikan.** CCTV biasa hanya merekam, sehingga kejadian baru diketahui setelah
rekaman diperiksa. Robot patroli memberi peringatan langsung, tetapi pemilik lab butuh satu tempat
untuk melihat kejadian, mengatur titik berhenti robot, dan menindaklanjutinya.

**Sasaran pengguna.** Admin lab sekolah atau kampus, pemilik toko atau kos, dan pengelola ruang server kecil
yang ingin pemantauan ruangan tanpa biaya satpam tambahan.

## Fitur awal (Milestone 1, data tiruan)
- **Dashboard:** status robot, jumlah kejadian, kejadian belum ditangani, baterai, dan lima kejadian terbaru.
- **Riwayat kejadian:** tabel dengan filter jenis dan pencarian titik.
- **Titik jaga:** formulir menambah titik jaga dengan validasi sisi klien, plus daftar titik.
- **Masuk:** formulir login dengan validasi sisi klien (belum ada autentikasi sungguhan).

Rencana lanjutan: server dan database (Milestone 2), autentikasi dan pengamanan komunikasi
(Milestone berikutnya), dan data kejadian sungguhan dari robot.

## Teknologi
React 18, TypeScript (strict), Tailwind CSS 3, Vite 5, React Router 6. Tanpa pustaka UI tambahan.

## Struktur aplikasi
```
client/
  src/
    components/   komponen reusable
    pages/        halaman
    data/mock.ts  data tiruan bertipe
    lib/          validasi, format tanggal, hook judul halaman
    types.ts      tipe data bersama
  docs/           laporan pengujian dan tangkapan layar
```

**Halaman (4):** Dashboard (`/`), Riwayat (`/riwayat`), Titik Jaga (`/titik-jaga`), Masuk (`/masuk`).

**Komponen reusable (10):** `Button`, `Card`, `StatCard`, `Badge`, `TextField`, `SelectField`,
`PageHeader`, `EventTable`, `Navbar`, `Layout`.

Mock data berada di satu berkas bertipe (`src/data/mock.ts`) dengan bentuk yang sama dengan tabel
yang akan dibuat di database, sehingga pada Milestone 2 cukup mengganti sumber datanya.

## Aksesibilitas dan responsif
- HTML semantik: `header`, `nav`, `main`, `footer`, satu `h1` per halaman, tabel dengan `caption` dan `th scope`.
- Tautan "Lewati ke konten utama", label pada semua kolom isian, `aria-invalid` dan `aria-describedby` untuk pesan kesalahan,
  `role="status"` untuk pesan hasil, fokus pindah ke kolom pertama yang tidak valid.
- Target sentuh minimal 44 px, indikator fokus yang jelas, kontras warna tinggi.
- Tata letak mengikuti lebar layar: ponsel (≤ 640 px) satu kolom dengan menu lipat, tablet (768 px) dua kolom,
  desktop (≥ 1024 px) empat kolom ringkasan dan menu mendatar. Tabel digulir di dalam wadahnya sendiri.

## Menjalankan
Prasyarat: Node.js ≥ 18.
```bash
cd client
npm install
npm run dev      # buka alamat yang tampil, biasanya http://localhost:5173
npm run build    # pemeriksaan tipe TypeScript + build produksi
npm run preview  # menjalankan hasil build
```

## Pengujian
Lihat `docs/LAPORAN_PENGUJIAN.md` (kondisi Lighthouse, ukuran layar, dan skenario formulir).

## Pencatatan penggunaan AI
Lihat `AI_LOG.md` di akar repository.

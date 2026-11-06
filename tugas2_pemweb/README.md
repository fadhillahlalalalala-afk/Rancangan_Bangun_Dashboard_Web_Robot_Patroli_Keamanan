# Patrol Dashboard — Rancang Bangun Dashboard Web Robot Patroli Keamanan (v0.2)

Dashboard web untuk memantau armada robot patroli keamanan dan mengatur jadwal patroli. Produk ini melanjutkan Milestone 1 (v0.1, antarmuka dengan mock data) dengan logika server dan database PostgreSQL.

## Perkembangan fitur v0.1 ke v0.2

| Aspek | v0.1 | v0.2 |
|---|---|---|
| Data | Mock data statis | PostgreSQL via Prisma ORM 7 (persisten) |
| Routing | Halaman statis | Next.js App Router (`/`, `/robots`, `/patroli`, halaman tambah dan ubah) |
| Pengelolaan data | Tidak ada | CRUD lengkap untuk **Robot** dan **Patroli** lewat Server Actions |
| Validasi | Sisi klien / tidak ada | Zod di sisi server, pesan error per field |
| Database | Tidak ada | Schema, migration, dan seed data sintetis |

## Model data

- **Robot** (`kode` unik, `nama`, `model`, `status`, `baterai`, `lokasi`)
- **Patroli** (`judul`, `area`, `rute`, `jadwalMulai`, `durasiMenit`, `status`, `catatan`, `robotId`)
- Relasi: satu Robot memiliki banyak Patroli (`onDelete: Cascade`, menghapus robot ikut menghapus patroli miliknya).

## Teknologi

Next.js 15 (App Router, Server Actions), React 19, TypeScript, Zod, PostgreSQL, Prisma ORM 7 (`@prisma/adapter-pg`).

## Menjalankan aplikasi

Prasyarat: Node.js 20+ dan PostgreSQL yang sudah berjalan.

```bash
npm install
cp .env.example .env          # lalu isi DATABASE_URL dengan kredensial lokal Anda
createdb patrol_dashboard     # atau buat database lewat psql / pgAdmin

npm run db:generate           # prisma generate
npm run db:migrate            # prisma migrate dev (menerapkan migration)
npm run db:seed               # prisma db seed (data sintetis)

npm run dev                   # http://localhost:3000
```

Catatan Prisma 7: konfigurasi koneksi dan seed berada di `prisma.config.ts`, client dihasilkan ke folder `generated/prisma` (tidak di-commit), dan `generate` serta `seed` dijalankan secara eksplisit.

Migration awal sudah disertakan di `prisma/migrations/20261107000000_init`. Jika ingin membuatnya ulang dari schema, jalankan `npm run db:reset` lalu `npm run db:migrate`.

## Keamanan

Kredensial tidak disimpan di repository. `.env` masuk `.gitignore`; gunakan `.env.example` sebagai contoh. Seluruh data seed dan pengujian bersifat sintetis. Autentikasi dan otorisasi akan dikembangkan pada milestone berikutnya.

## Pengujian

Lihat [`docs/PENGUJIAN.md`](docs/PENGUJIAN.md) untuk skenario pengujian, bukti validasi, dan bukti perubahan database.

## Rilis

```bash
git add . && git commit -m "feat: milestone 2 - CRUD, Prisma, validasi Zod (v0.2)"
git push origin main
git tag v0.2 && git push origin v0.2
```

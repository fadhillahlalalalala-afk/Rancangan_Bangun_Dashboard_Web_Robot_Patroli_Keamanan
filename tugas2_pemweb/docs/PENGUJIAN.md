# Dokumentasi Pengujian — Milestone 2 (v0.2)

Seluruh pengujian memakai data sintetis dari `prisma/seed.ts`. Kolom **Hasil aktual** dan **Status** diisi setelah Anda menjalankan setiap skenario di aplikasi Anda sendiri. Target kelulusan: minimal 9 dari 10 skenario (90%).

## A. Skenario CRUD (8)

| ID | Tujuan | Langkah pengujian | Hasil diharapkan | Hasil aktual | Status |
|---|---|---|---|---|---|
| T01 | Create Robot | Buka `/robots/new`, isi Kode `PTR-005`, Nama `Sentinel Echo`, Model `SecuBot X1`, Status Aktif, Baterai 90, Lokasi `Pos Jaga Selatan`, klik Simpan | Redirect ke `/robots`, robot baru tampil di daftar |Berhasil diarahkan kembali ke halaman /robots dan entri data PTR-005 (Sentinel Echo) muncul di tabel daftar robot. |Lulus |
| T02 | Read Robot | Buka `/robots` | Seluruh robot dari database tampil lengkap dengan status, baterai, jumlah patroli | | |
| T03 | Update Robot | Klik Ubah pada `PTR-003`, ubah Status menjadi Aktif dan Baterai 80, simpan | Daftar menampilkan data baru; muat ulang halaman, data tetap | | |
| T04 | Delete Robot | Klik Hapus pada `PTR-005`, konfirmasi | Robot hilang dari daftar dan dari tabel `Robot` | | |
| T05 | Create Patroli | Buka `/patroli/new`, isi judul `Patroli atap gedung`, robot `PTR-002`, area `Atap Gedung A`, rute `Tangga -> Atap -> Tangga`, jadwal, durasi 40, simpan | Patroli baru tampil di `/patroli` dengan kode robot `PTR-002` | | |
| T06 | Read Patroli | Buka `/patroli` dan `/` | Daftar patroli dan 5 patroli terbaru di ringkasan sesuai isi database | | |
| T07 | Update Patroli | Ubah status patroli `Patroli parkiran malam` menjadi Dibatalkan, tambahkan catatan, simpan | Status dan catatan berubah dan tetap setelah muat ulang | | |
| T08 | Delete Patroli | Hapus `Patroli atap gedung`, konfirmasi | Patroli hilang dari daftar dan dari tabel `Patroli` | | |

## B. Skenario relasi data (2)

| ID | Tujuan | Langkah pengujian | Hasil diharapkan | Hasil aktual | Status |
|---|---|---|---|---|---|
| T09 | Patroli terhubung ke Robot | Buat patroli dengan robot `PTR-001`, lalu buka `/robots` | Kolom Patroli pada `PTR-001` bertambah 1; di `/patroli` kolom Robot menampilkan `PTR-001` | | |
| T10 | Cascade delete | Hapus robot `PTR-001` (punya 2 patroli seed), konfirmasi | Robot dan seluruh patroli miliknya hilang; patroli robot lain tidak terpengaruh | | |

## C. Bukti penolakan input tidak valid (validasi Zod server)

Matikan JavaScript atau kirim langsung ke Server Action untuk memastikan validasi benar-benar di server. Lampirkan tangkapan layar.

| ID | Input | Field | Pesan yang diharapkan |
|---|---|---|---|
| V01 | Kode robot `ABC` | kode | Kode harus berformat AAA-123, contoh PTR-001 |
| V02 | Baterai `150` | baterai | Baterai maksimal 100 |
| V03 | Nama robot `ab` | nama | Nama minimal 3 karakter |
| V04 | Kode robot `PTR-002` (duplikat) | kode | Kode robot sudah digunakan |
| V05 | Durasi patroli `2` atau kosong | durasiMenit | Durasi minimal 5 / Durasi wajib diisi |
| V06 | Robot tidak dipilih | robotId | Pilih robot yang bertugas |

## D. Bukti perubahan database

Setelah T01, T03, T04, T05, T07, dan T08, jalankan kueri berikut lewat `psql` atau `npx prisma studio` dan lampirkan hasilnya:

```sql
SELECT id, kode, nama, status, baterai FROM "Robot" ORDER BY id;
SELECT p.id, p.judul, p.status, r.kode FROM "Patroli" p JOIN "Robot" r ON r.id = p."robotId" ORDER BY p.id;
```

## Ringkasan hasil

- Skenario lulus: ___ / 10
- Persentase: ___ % (minimal 90%)
- Bukti validasi server terdokumentasi: ___ (minimal 3)

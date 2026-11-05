# Tugas Pendahuluan Modul 7 — Debugging dan Telaah Kode

Nama/NIM :
Mata Kuliah : Praktikum Pengembangan Aplikasi Web (052356)
Tema Produk : Rancangan Bangun Dashboard Web Robot Patroli Keamanan
Repositori : https://github.com/fadhillahlalalalala-afk/Rancangan_Bangun_Dashboard_Web_Robot_Patroli_Keamanan/blob/main/tugas_pendahuluan_modul-07.md

> **Pemetaan entitas.** Modul memakai entitas `Item` dan `Ulasan`. Pada produk saya, padanannya adalah:
>
> | Modul | Produk saya (Dashboard Robot Patroli) |
> |-------|----------------------------------------|
> | `Item` | `Robot` (nama, zona patroli, deskripsi, status aktif) |
> | `Ulasan` | `LaporanPatroli` (catatan, tingkat bahaya 1-5), `robotId` sebagai foreign key |
> | `tersedia` | `aktif` (status robot aktif atau nonaktif) |
> | `/katalog` | `/robot` |
>
> Nama kolom dan rute dapat disesuaikan dengan skema Prisma yang sebenarnya.

---

## 1. Langkah Reproduksi Galat pada Produk

Saat memeriksa kode hasil AI pada dashboard robot patroli, saya menemukan empat galat. Satu galat saya tuliskan lengkap sebagai langkah reproduksi, tiga lainnya diringkas pada tabel.

### 1.1 Galat yang direproduksi: Status robot "Nonaktif" tidak tersimpan

**Lingkungan:** Node.js 24, Next.js 16.x, Prisma ORM 7.x, Zod 4, PostgreSQL 18, Google Chrome, branch `praktikum/modul-07` (commit `<hash commit awal>`)

**Data awal:** Robot dengan id 1 ("Robot Patroli Gerbang Utara") berstatus aktif (hasil `npx prisma db seed`).

**Langkah reproduksi:**
1. Jalankan konfigurasi debugger "Next.js: debug server-side", lalu buka `/robot/1/edit`.
2. Pada kolom Status Robot pilih "Nonaktif".
3. Klik **Simpan**, lalu buka halaman detail `/robot/1`.

**Hasil yang diharapkan:** Dashboard menampilkan robot dengan status "Nonaktif".

**Hasil aktual:** Robot tetap tampil "Aktif", sementara pesan "Perubahan disimpan." tetap muncul.

**Frekuensi:** 5 dari 5 percobaan.

**Akar penyebab:** Skema Zod memakai `z.coerce.boolean()`, yang memanggil `Boolean("false")` dan menghasilkan `true`. Pada dashboard keamanan, galat ini berbahaya karena operator mengira robot sudah dinonaktifkan (misalnya untuk perawatan), padahal sistem masih menganggapnya aktif.

**Perbaikan:** Ganti dengan `z.stringbool()`.

### 1.2 Ringkasan keempat galat yang ditemukan

| No | Galat pada dashboard robot patroli | Lapisan | Akar penyebab | Bukti |
|----|------------------------------------|---------|---------------|-------|
| 1 | Status robot "Nonaktif" tidak tersimpan, tetap "Aktif" | Server (Server Action, validasi Zod) | `z.coerce.boolean()` mengubah string `"false"` menjadi `true` | Payload Network berisi `aktif: "false"`, Debug Console menunjukkan `hasil.data.aktif` bernilai `true` |
| 2 | Hapus robot tanpa laporan: item hilang tetapi halaman tidak berpindah ke `/robot`, log menulis "Gagal menghapus" | Server (Server Action) | `redirect()` dipanggil di dalam `try`, sehingga galat `NEXT_REDIRECT` tertangkap `catch` | Breakpoint di `catch`: `e.message` bernilai `'NEXT_REDIRECT'` |
| 3 | Hapus robot yang sudah punya laporan patroli: tidak terhapus dan pengguna tidak mendapat pesan apa pun | Basis data (Prisma) | Foreign key `LaporanPatroli.robotId` mencegah penghapusan (P2003), lalu galat ditelan `catch` | Stack trace `PrismaClientKnownRequestError` dengan `code: 'P2003'` setelah `console.error(e)` |
| 4 | Penghitung karakter catatan laporan patroli selalu menampilkan "280 karakter tersisa" | Peramban (Client Component) | State `sisa` dihitung di `useEffect` dengan larik dependensi kosong `[]`, sehingga tidak dihitung ulang saat teks berubah | Tab Components (React Developer Tools): `isi` berubah tetapi `sisa` tetap 280 |

Keempatnya lolos `npx tsc --noEmit` dan berjalan normal dengan data bawaan, sehingga baru terdeteksi setelah sengaja diuji dengan nilai lain (status "Nonaktif", hapus robot berlaporan, dan mengetik di kolom catatan).

---

## 2. Breakpoint, Conditional Breakpoint, dan Logpoint

| Jenis | Cara kerja | Situasi yang tepat pada dashboard robot patroli |
|-------|------------|--------------------------------------------------|
| **Breakpoint** | Menghentikan eksekusi setiap kali baris tersebut tercapai, sehingga Variables, Call Stack, dan Watch bisa diperiksa. | Berhenti di baris `await prisma.robot.update(...)` pada Server Action `ubahRobot` untuk memeriksa apakah `hasil.data.aktif` sudah bernilai benar sebelum disimpan. |
| **Conditional breakpoint** | Berhenti hanya bila ekspresi kondisi bernilai truthy, misalnya `id === 3`. | Dashboard menampilkan banyak robot dan laporan. Galat hanya muncul pada satu robot, sehingga breakpoint dipasang dengan kondisi `id === 3` atau pada laporan dengan `tingkatBahaya >= 4`, agar tidak berhenti di setiap data lain. |
| **Logpoint** | Mencetak pesan ke Debug Console (misalnya `hapus robot id={id}`) tanpa menghentikan eksekusi dan tanpa mengubah kode. | Memantau urutan permintaan ubah status atau hapus robot yang datang beruntun dari dashboard tanpa mengganggu alur, dan tanpa menambah `console.log` yang berisiko ikut ter-commit. |

---

## 3. Kode Galat Prisma P2002, P2003, dan P2025

| Kode | Arti | Contoh pada `Robot` | Contoh pada `LaporanPatroli` |
|------|------|---------------------|-------------------------------|
| **P2002** | *Unique constraint* gagal: nilai yang harus unik sudah dipakai. | Menambah robot dengan `kodeRobot` (misalnya `PTR-01`) yang sudah dipakai robot lain, bila kolom tersebut `@unique`. | Bila ada aturan satu robot hanya boleh punya satu laporan per sesi patroli (`@@unique([robotId, sesiPatroli])`), mengirim laporan kedua untuk sesi yang sama memicu P2002. |
| **P2003** | *Foreign key constraint* gagal. | Menghapus robot yang masih memiliki laporan patroli (`LaporanPatroli.robotId` masih merujuknya). | Menambah laporan dengan `robotId` yang tidak ada, misalnya robot sudah dihapus operator lain saat formulir laporan masih terbuka. |
| **P2025** | Record yang dibutuhkan tidak ditemukan. | Mengubah atau menghapus robot yang sudah dihapus operator lain di tab berbeda. | Menghapus atau mengubah laporan patroli yang sudah dihapus sebelumnya. |

Ketiganya dilempar sebagai `PrismaClientKnownRequestError` dengan properti `code`. Galat ini tidak boleh ditelan `catch`: kembalikan galat per field untuk P2002, tetapkan aturan hapus untuk P2003 (hapus berantai, tolak, atau `onDelete`), dan tampilkan `notFound()` atau pesan status untuk P2025.

---

## 4. Mengapa `Boolean("false")` Bernilai `true` dan Mengapa `redirect()` Tidak Boleh di Dalam `try`

### a. `Boolean("false")` bernilai `true`

`Boolean()` tidak membaca isi teks, melainkan hanya memeriksa apakah nilai itu *truthy* atau *falsy*. Di JavaScript, **setiap string tidak kosong adalah truthy**, termasuk `"false"` dan `"0"`. Hanya string kosong `""` yang falsy.

```js
Boolean("false") // true  (string tidak kosong)
Boolean("")      // false
```

`z.coerce.boolean()` di Zod memakai `Boolean(input)`. Pada dashboard, nilai `"false"` dari `<select>` status robot berubah menjadi `true`, sehingga robot yang dinonaktifkan tetap tercatat aktif. Perbaikannya memakai `z.stringbool()` dari Zod 4, yang memetakan `"true"` ke `true`, `"false"` ke `false`, dan menolak nilai lain.

### b. `redirect()` tidak boleh dipanggil di dalam blok `try`

`redirect()` (juga `notFound()`) di Next.js bekerja dengan **melempar galat khusus** `NEXT_REDIRECT`. Bila dipanggil di dalam `try`, blok `catch` ikut menangkapnya sehingga:

- navigasi batal dan halaman tidak berpindah;
- log menampilkan pesan gagal padahal operasi hapus robot sebenarnya berhasil.

```ts
// Salah
try {
  await prisma.robot.delete({ where: { id } });
  redirect("/robot"); // tertangkap catch
} catch (e) { console.log("Gagal menghapus"); }

// Benar
await prisma.robot.delete({ where: { id } });
redirect("/robot"); // di luar try/catch
```

---

## 5. Pasangan Telaah

| Keterangan | Isi |
|------------|-----|
| Nama pasangan telaah | `<isi nama pasangan>` |
| URL repositori pasangan | `https://github.com/<username-pasangan>/<nama-repositori>` |
| Pasangan sudah menjadi collaborator di repositori saya | Ya / Belum |
| Saya sudah menerima undangan collaborator di repositori pasangan | Ya / Belum |

**Bukti undangan collaborator diterima:**

`<lampirkan tangkapan layar Settings > Collaborators pada kedua repositori, atau email/notifikasi GitHub>`

---

*Catatan pemanfaatan AI: `<isi sesuai AI_LOG.md, atau tulis "Tidak menggunakan AI">`*

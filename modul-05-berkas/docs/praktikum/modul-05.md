# Dokumen Teknis Modul 5 — Formulir, Validasi, Session, dan Cookie

Nama/NIM : Muhammad Fadhilah Chandra Mulan / 105224036
Repositori : https://github.com/fadhillahlalalalala-afk/Rancangan_Bangun_Dashboard_Web_Robot_Patroli_Keamanan/edit/main/modul-05-berkas/docs/praktikum/modul-05.md
Produk : Web Robot Patroli Keamanan

> Konteks produk: aplikasi web untuk mengelola **titik patroli** robot keamanan. Entitas `Item` pada modul dipetakan menjadi titik patroli: `judul` = nama titik, `kategori` = jenis area (`gedung`, `parkir`, `perimeter`), `deskripsi` = catatan area yang diawasi, `tersedia` = titik aktif dan boleh dikunjungi robot. Halaman tambah titik hanya boleh diakses operator yang sudah masuk.

---

## 1. Skema Validasi

### 1.1 Tabel kolom formulir (`skemaItem`, `lib/skema.ts`)

| Kolom | Tipe | Aturan Zod 4 | Pesan galat |
|---|---|---|---|
| `judul` | string | `z.string().trim().min(3).max(80)` | "Judul minimal 3 karakter" / "Judul maksimal 80 karakter" |
| `kategori` | enum | `z.enum(["gedung","parkir","perimeter"], { error })` | "Pilih salah satu kategori" |
| `deskripsi` | string | `z.string().trim().min(10).max(300)` | "Deskripsi minimal 10 karakter" / "Deskripsi maksimal 300 karakter" |
| `tersedia` | boolean | `z.stringbool().default(false)` | (tidak ada; kotak centang tidak tercentang berarti `false`) |

Tabel kolom formulir masuk (`skemaMasuk`):

| Kolom | Tipe | Aturan Zod 4 | Pesan galat |
|---|---|---|---|
| `email` | string | `z.email("...")` | "Format email tidak valid" |
| `kataSandi` | string | `z.string().min(8, "...")` | "Kata sandi minimal 8 karakter" |

Skema menjadi satu sumber aturan sekaligus tipe TypeScript melalui `z.infer<typeof skemaItem>` (`MasukanItem`). Pilihan `z.enum` sengaja disamakan dengan union `Kategori` di `lib/tipe.ts` agar tidak muncul galat TS2322 saat `MasukanItem` disusun menjadi `Item`.

Catatan Zod 4 yang dipakai: `z.flattenError(error).fieldErrors` (bukan `error.flatten()`), `z.email()` sebagai fungsi tingkat atas, parameter `{ error: "..." }` (bukan `required_error`), dan `z.stringbool()` untuk kotak centang. `z.object` membuang kunci yang tidak dikenal, sehingga kolom tambahan kiriman penyerang tidak ikut tersimpan.

### 1.2 Aturan semantik

**Aturan:** nama titik patroli (`judul`) tidak boleh sama dengan titik lain (tanpa membedakan huruf besar/kecil), dicek lewat `judulSudahAda()`.

**Alasan:** aturan ini butuh data yang sudah tersimpan, sedangkan skema Zod hanya melihat satu paket masukan. Dua titik patroli bernama sama membuat laporan dan log robot ambigu (misalnya "Gerbang Utara" ada dua kali). Karena itu aturan ini diperiksa di Server Action **setelah** `safeParse` berhasil, dan galatnya dikembalikan pada kolom `judul`.

---

## 2. Alur Server Action

### 2.1 Urutan pemeriksaan di `simpanItem` (`app/katalog/actions.ts`)

| No | Pemeriksaan | Bila gagal |
|---|---|---|
| 1 | Sesi: `bacaSesi()` | Kembalikan `{ pesan: "Silakan masuk terlebih dahulu." }` |
| 2 | Validasi bentuk: `skemaItem.safeParse()` | Kembalikan galat per kolom dari `z.flattenError` + `nilai` |
| 3 | Validasi semantik: `judulSudahAda()` | Kembalikan galat pada kolom `judul` + `nilai` |
| 4 | Mutasi: `tambahItem()` di dalam `try` | Catat ke log server (`console.error`), kembalikan pesan umum |
| 5 | `revalidatePath("/katalog")` lalu `redirect()` | `redirect` diletakkan **di luar `try`** |

Alasan urutan: Server Action pada dasarnya endpoint POST yang dapat dipanggil siapa pun yang tahu pengenal aksinya, tanpa membuka halaman formulir. Maka sesi diperiksa lebih dulu, lalu bentuk data, lalu aturan semantik, dan baru terakhir data diubah. Masukan tidak sah tidak pernah mencapai `tambahItem`.

`redirect()` bekerja dengan melempar exception khusus. Jika diletakkan di dalam `try`, blok `catch` akan menangkapnya dan pengalihan gagal. Galat yang diharapkan (masukan tidak sah, sesi kosong) dikembalikan sebagai nilai, bukan dilempar; hanya exception tak terduga yang ditulis ke log server, dan pengguna hanya menerima pesan umum tanpa stack trace.

### 2.2 Galat per kolom dan aksesibilitas

`FormItem` memakai `useActionState(simpanItem, awal)` sehingga aksi menerima `(_sebelumnya, formData)`. Setiap kolom punya `aria-invalid={!!g?.kolom}` dan `aria-describedby` yang menunjuk ke elemen `<p id="galat-...">` di bawah kolom. Pesan umum memakai `role="status"` `aria-live="polite"`. Karena React 19 mereset kolom tak terkendali setelah aksi selesai, aksi mengembalikan `nilai`, dipakai sebagai `defaultValue`, dan `<select>` diberi `key` agar pilihan terakhir tetap tampil.

### 2.3 Pembagian berkas

| Jenis | Berkas | Peran |
|---|---|---|
| Server Component | `app/katalog/tambah/page.tsx`, `app/masuk/page.tsx` | Merender halaman; halaman tambah memeriksa sesi dan `redirect("/masuk")` bila kosong |
| Client Component (`"use client"`) | `components/FormItem.tsx`, `components/FormMasuk.tsx` | Memakai `useActionState`, menampilkan galat dan status pending |
| Berkas `"use server"` | `app/katalog/actions.ts`, `app/masuk/actions.ts` | `simpanItem`, `masuk`, `keluar` |
| Modul server-only | `lib/sesi.ts` | `buatSesi`, `bacaSesi`, `hapusSesi`; `import "server-only"` agar build gagal bila terimpor ke Client Component |
| Bersama | `lib/skema.ts`, `lib/status-form.ts` | Skema Zod dan tipe `StatusForm` |
| Proxy | `proxy.ts` | Pemeriksaan optimistik keberadaan cookie `sesi` |

---

## 3. Bukti Uji Validasi

> **Petunjuk pengisian (hapus bagian ini sebelum dikumpulkan):** kolom "Hasil yang diharapkan" sudah terisi dari perilaku kode modul. Kolom **"Hasil nyata" wajib Anda isi dari pengujian sendiri** dan tangkapan layarnya diganti dengan milik Anda. Jika hasil nyata berbeda dari yang diharapkan, tulis apa adanya beserta penyebabnya di bagian 6.

### 3.1 Tabel kasus uji

| No | Skenario | Masukan | Validasi klien | Hasil yang diharapkan | Hasil nyata |
|---|---|---|---|---|---|
| 1 | Data sah | judul "Gerbang Utara", kategori `perimeter`, deskripsi 25 karakter, tersedia dicentang | Aktif | Item tersimpan, `revalidatePath`, dialihkan ke `/katalog/[id]` item baru, item muncul di `/katalog` | [ISI] |
| 2 | Judul duplikat (semantik) | judul "Gerbang Utara" (sudah ada), kolom lain sah | Aktif | "Judul sudah dipakai item lain" di bawah kolom judul; isian kategori dan deskripsi tetap terisi | [ISI] |
| 3 | Judul terlalu pendek | judul "ab" | **Dilewati (`novalidate`)** | "Judul minimal 3 karakter" dari server | [ISI] |
| 4 | Kategori kosong | kategori tidak dipilih | **Dilewati (`novalidate`)** | "Pilih salah satu kategori" dari server | [ISI] |
| 5 | Deskripsi terlalu panjang | deskripsi 400 karakter | **Dilewati (`novalidate`)** | "Deskripsi maksimal 300 karakter" dari server | [ISI] |
| 6 | Tiga galat sekaligus | kasus 3 + 4 + 5 dikirim bersamaan | **Dilewati (`novalidate`)** | Tiga galat tampil di bawah kolom masing-masing; tidak ada item tersimpan | [ISI] |
| 7 | Nilai enum palsu | ubah `value` opsi `<select>` di Elements menjadi "rahasia", kirim | Aktif | "Pilih salah satu kategori"; nilai di luar enum ditolak | [ISI] |
| 8 | Judul hanya spasi | judul "     " | **Dilewati (`novalidate`)** | Setelah `trim()` panjang 0, "Judul minimal 3 karakter" | [ISI] |
| 9 | Kolom judul kosong | judul dikosongkan | **Dilewati (`novalidate`)** | "Judul minimal 3 karakter"; nilai kosong tidak lolos | [ISI] |
| 10 | Kirim tanpa sesi | hapus cookie `sesi` setelah halaman tambah terbuka, kirim formulir sah | Aktif | Pesan "Silakan masuk terlebih dahulu."; item tidak tersimpan | [ISI] |
| 11 | Login email salah format | email "bukan-email" | Dilewati | "Format email tidak valid" di bawah kolom email | [ISI] |
| 12 | Login kata sandi pendek | kata sandi "abc" | Aktif/dilewati | "Kata sandi minimal 8 karakter" | [ISI] |
| 13 | Login kredensial salah | email sah, kata sandi salah (8+ karakter) | Aktif | "Email atau kata sandi salah." | [ISI] |
| 14 | Akses halaman tambah tanpa cookie | buka `/katalog/tambah` tanpa login | - | `proxy.ts` mengalihkan ke `/masuk` sebelum halaman dirender | [ISI] |

Kasus 3, 4, 5, 6, 8, dan 9 dikerjakan dengan validasi klien dilewati (melebihi syarat minimal 3 kasus). Total ada 14 kasus (syarat minimal 8).

### 3.2 Cara melewati validasi klien

Panel Elements → klik kanan elemen `<form>` → Add attribute → ketik `novalidate` → kirim formulir dengan masukan tidak sah.

### 3.3 Tangkapan layar

> Ganti dengan tangkapan layar milik sendiri. Simpan di `docs/praktikum/img/` lalu tautkan. Jangan menampilkan nilai cookie asli.

- Kasus 3–6, tiga galat per kolom dari server: `![Galat per kolom](img/modul-05-galat-kolom.png)`
- Kasus 2, judul duplikat: `![Galat semantik](img/modul-05-galat-semantik.png)`
- Kasus 1, hasil redirect ke halaman detail: `![Redirect sukses](img/modul-05-sukses.png)`

---

## 4. Session dan Cookie

### 4.1 Atribut cookie `sesi` dan alasannya

| Atribut | Nilai | Ancaman yang dikurangi |
|---|---|---|
| `HttpOnly` | `true` | Skrip hasil XSS tidak bisa membaca cookie lewat `document.cookie`, sehingga pencurian sesi sulit. Sesi operator robot patroli menyangkut kendali perangkat fisik. |
| `Secure` | `true` di produksi | Cookie hanya dikirim lewat HTTPS sehingga tidak bisa disadap di jaringan (sniffing). Di `localhost` dikecualikan peramban, jadi di mode pengembangan atribut ini tidak muncul. |
| `SameSite` | `lax` | Cookie tidak ikut pada permintaan lintas situs selain navigasi tingkat atas, sehingga menahan CSRF (misalnya form tersembunyi di situs lain yang menambah titik patroli). |
| `Path` | `/` | Cookie berlaku di seluruh rute produk. |
| `Max-Age` | `28800` (8 jam) | Membatasi umur cookie yang dicuri; sama dengan satu shift operator. |

Nilai cookie adalah `crypto.randomUUID()`, pengenal acak yang tidak dapat ditebak. Data sesi (`email`, `kedaluwarsa`) disimpan di server.

### 4.2 Tangkapan layar

> Ganti dengan milik sendiri; **samarkan nilai cookie**.

- Panel Network, permintaan POST `/masuk`, header `Set-Cookie`: `![Set-Cookie](img/modul-05-set-cookie.png)`
- Panel Application → Cookies (kolom HttpOnly, SameSite, Expires): `![Application cookies](img/modul-05-application.png)`
- Console `document.cookie` yang tidak memuat `sesi`: `![document.cookie](img/modul-05-document-cookie.png)`

Header yang diharapkan: `sesi=***; Path=/; Max-Age=28800; HttpOnly; SameSite=lax` (tanpa `Secure` karena mode pengembangan).

### 4.3 Hasil uji session

| Uji | Langkah | Hasil yang diharapkan | Hasil nyata |
|---|---|---|---|
| Cookie palsu | Masuk, buka `/katalog/tambah`, ubah nilai `sesi` jadi palsu, kirim formulir sah | `proxy.ts` meloloskan karena cookie ada, tetapi `bacaSesi()` mengembalikan `null`; tampil "Silakan masuk terlebih dahulu."; item tidak tersimpan | [ISI] |
| Logout | Klik "Keluar" | Sesi dihapus dari penyimpanan server, cookie dihapus, dialihkan ke `/` | [ISI] |
| Cookie lama setelah logout | Salin nilai `sesi`, logout, pasang kembali cookie lama lewat Application, buka `/katalog/tambah` | Dialihkan ke `/masuk` karena sesi sudah tidak ada di penyimpanan server | [ISI] |

---

## 5. Keputusan Teknis

### 5.1 Session di server dibanding token di cookie

Cookie hanya berisi pengenal acak, sedangkan data sesi disimpan di server (`Map` di memori, dipegang di `globalThis` agar tidak hilang saat Fast Refresh). Keunggulannya, sesi bisa dicabut seketika saat logout; hal ini terbukti pada uji cookie lama. Pada token tanpa status (JWT), token yang sudah dicuri tetap sah sampai kedaluwarsa. Untuk produk robot patroli, kemampuan mencabut akses operator dengan segera lebih penting daripada menghemat satu pencarian di penyimpanan. Kekurangannya, penyimpanan di memori hilang saat server dimulai ulang dan tidak cocok untuk banyak instans; ini diterima untuk tahap tiruan dan akan diganti pustaka autentikasi pada Modul 10–11.

### 5.2 Pemisahan validasi bentuk dan semantik

Skema Zod hanya memeriksa bentuk satu paket masukan (tipe, panjang, pilihan). Aturan "nama titik belum dipakai" membutuhkan data tersimpan, jadi diletakkan di aksi setelah `safeParse` berhasil. Pemisahan ini membuat skema murni dan bisa dipakai ulang (misalnya untuk formulir ubah), sementara aturan yang bergantung data tetap berada di tempat yang punya akses ke data. Atribut HTML (`required`, `minLength`) hanya untuk kenyamanan pengguna karena bisa dihapus lewat DevTools atau `novalidate`; kebenaran data dijamin validasi server, dan terbukti pada kasus uji 3–9.

### 5.3 Batas peran `proxy.ts`

`proxy.ts` hanya melakukan pemeriksaan **optimistik**: apakah cookie `sesi` ada, lalu mengalihkan ke `/masuk` lebih awal. Ia tidak memverifikasi isi cookie, sehingga cookie palsu lolos (terbukti pada uji cookie palsu). Karena itu verifikasi sesungguhnya (`bacaSesi()`) tetap dilakukan di halaman tambah dan di dalam `simpanItem`. Dokumentasi Next.js juga mengingatkan bahwa perubahan `matcher` bisa menghilangkan cakupan proxy tanpa disadari, sehingga pemeriksaan di Server Function wajib tetap ada. Proxy adalah lapisan kenyamanan; aksi adalah lapisan keamanan.

### 5.4 Keputusan lain

- Cookie `HttpOnly` agar tidak terbaca skrip; `SameSite=Lax` agar CSRF tertahan tanpa merusak navigasi biasa.
- Akun demo dibaca dari `.env.local` (tidak di-commit), dengan `.env.example` tanpa nilai asli di-commit.
- Pesan galat spesifik per kolom, bukan pesan umum, agar operator tahu persis apa yang harus diperbaiki.

---

## 6. Kendala dan Penyelesaian

Kendala utama pada Modul 5 ini terletak pada pengelolaan berkas dan Git, bukan pada kodenya. Pertama, berkas modul yang saya ekstrak dari zip awalnya berada di folder sementara di dalam repositori, sehingga berstatus untracked dan tidak berada di struktur proyek Next.js yang benar. Saya menyelesaikannya dengan memeriksa letak package.json dan folder app, lalu menyalin berkas ke lokasi yang sesuai tanpa menimpa lib/data.ts dan lib/tipe.ts milik Modul 4. Kedua, perintah git switch -c praktikum/modul-05 gagal karena branch tersebut sudah dibuat sebelumnya, sehingga saya berpindah dengan git switch praktikum/modul-05 tanpa opsi -c. Ketiga, saya sempat salah mengetik nama folder pada git add (modul-5 alih-alih modul-05) dan nama folder hasil ekstrak ternyata modul-05-berkas, sehingga Git menolak dengan pesan pathspec did not match dan berkas tidak ikut ter-commit. Saya memperbaikinya dengan membaca git status untuk memastikan nama dan status berkas sebelum menjalankan git add, git commit, dan git push. Dari pengalaman ini saya belajar untuk selalu memeriksa git status dan branch aktif sebelum commit, serta menghindari git add . agar folder sementara dan berkas rahasia seperti .env.local tidak ikut ter-commit.

## 7. Catatan Pemanfaatan AI

| Alat | Perintah utama | Bagian yang digunakan | Cara verifikasi |
|---|---|---|---|
| Claude (Anthropic) | Meminta penyusunan kerangka Dokumen Teknis Modul 5 dari modul praktikum, disesuaikan dengan tema Web Robot Patroli Keamanan | Struktur dokumen, tabel kolom/skema, tabel urutan pemeriksaan, tabel atribut cookie, penjelasan keputusan teknis (bagian 1, 2, 4, 5), dan daftar kasus uji | Mencocokkan setiap isi dengan modul praktikum dan kode di repositori saya sendiri; menjalankan semua kasus uji di peramban lalu mengisi kolom "Hasil nyata" dan tangkapan layar dari hasil sendiri; menjalankan `npx tsc --noEmit` dan `npm run lint`; membaca ulang agar mampu menjelaskan tiap aturan skema, urutan pemeriksaan, dan atribut cookie |

[ISI/SESUAIKAN: tulis jika ada bagian lain yang dibantu AI, misalnya debugging, dan bagian yang Anda tulis sendiri.]

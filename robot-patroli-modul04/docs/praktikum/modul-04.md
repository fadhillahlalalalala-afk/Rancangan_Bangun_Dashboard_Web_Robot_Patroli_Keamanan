# Dokumen Teknis Modul 4: Next.js App Router

Nama/NIM :Muhammad Fadhilah Chandra Mulan /105224036
Repositori :
Versi Next.js dan mode Cache Components (aktif/tidak) :

## 1. Peta Rute
| URL | Berkas di app/ | Jenis rute | Isi halaman |
|---|---|---|---|
| / | app/page.tsx | statis | Beranda, tiga robot terbaru |
| /katalog | app/katalog/page.tsx | statis | Daftar robot patroli dengan filter |
| /katalog/[id] | app/katalog/[id]/page.tsx | dinamis | Detail satu robot |
| /tentang | app/tentang/page.tsx | statis | Tentang Web Robot Patroli Keamanan |

(Tempel potongan tabel rute dari keluaran `npm run build`.)

## 2. Layout, Template, dan Berkas Khusus
- Pohon folder app/ akhir:
- Hasil uji layout vs template (tangkapan layar sebelum dan sesudah navigasi):
- Tangkapan layar loading.tsx dan error.tsx (mode dev dan produksi):

## 3. Rute Dinamis dan Validasi params
| URL | Hasil diharapkan | Hasil aktual | Kode status curl |
|---|---|---|---|
| /katalog/1 | Detail PatroliBot A1 | | |
| /katalog/abc | Item tidak ditemukan | | |
| /katalog/999 | Item tidak ditemukan | | |
| /tidak-ada | Halaman tidak ditemukan | | |

Penjelasan aturan validasi params (string, regex `^[1-9]\d*$`, Number, cariItem, notFound()):

## 4. Pembagian Server dan Client Components
| Komponen/berkas | Jenis | Alasan teknis |
|---|---|---|
| app/katalog/[id]/page.tsx | Server | Membaca data dan params di server |
| ItemTerbaru | Server | Membaca lib/data.ts langsung, kode tidak dikirim ke peramban |
| SiteHeader, SiteFooter, KartuItem | Server | Tampilan tanpa state atau event |
| TautanNav | Client | Memakai usePathname |
| DaftarItem | Client | Memakai useState dan onChange (filter) |
| KolomCatatan | Client | Memakai useState dan onChange |
| error.tsx | Client | Error boundary wajib Client Component |

Hasil uji impor lib/data.ts (server-only) dari DaftarItem (tempel pesan galat):

## 5. Verifikasi
Keluaran `npx tsc --noEmit`, `npm run lint`, dan `npm run build`:

## 6. Kendala dan Penyelesaian
Kendala yang paling menyita waktu adalah memahami batas antara Server Component dan Client Component. Pada awalnya `ItemTerbaru` dan `DaftarItem` sama-sama saya anggap perlu `"use client"`, sehingga muncul galat ketika `lib/data.ts` diberi `import "server-only"` dan masih diimpor dari komponen klien. Saya menyelesaikannya dengan menjadikan `ItemTerbaru` Server Component yang membaca data langsung, dan memberi `"use client"` hanya pada komponen daun yang memakai state atau hook (`DaftarItem`, `KolomCatatan`, `TautanNav`). Kendala kedua adalah `params` yang bertipe `Promise` dan selalu berupa string. Halaman detail sempat selalu menampilkan "Item tidak ditemukan" karena `item.id` (angka) dibandingkan dengan `id` (string); masalah ini selesai setelah saya memvalidasi format dengan regex `^[1-9]\d*$`, mengonversinya dengan `Number(id)`, lalu memanggil `notFound()` bila tidak valid. Kendala ketiga adalah membedakan perilaku `layout.tsx` dan `template.tsx`, yang baru jelas setelah saya mengetik teks pada kedua kolom catatan lalu berpindah antara `/katalog` dan `/katalog/[id]`: teks di layout bertahan, sedangkan teks di template kosong karena dipasang ulang. Terakhir, pesan galat di mode produksi berbeda dari mode pengembangan (pesan generik dengan digest), sehingga saya mencocokkan digest tersebut dengan log terminal `npm start`.

## 7. Catatan Pemanfaatan AI
Alat, perintah utama, bagian yang digunakan, dan cara memverifikasinya.


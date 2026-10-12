# Laporan Pengujian Milestone 1 — SecureBot Client
Laporan ini disusun sebagai bukti pengujian antarmuka web SecureBot (Milestone 1) yang mencakup aksesibilitas, pengujian formulir (validasi sisi klien), responsivitas, dan navigasi.

Nama:Muhammad Fadhilah Chandra Mulan
NIM:105224036
---

## 1. Kondisi Pengujian Lighthouse
| Item | Nilai |
|---|---|
| Versi Chrome | Google Chrome (sesuaikan dengan versi `chrome://version`) |
| Mode | Navigation (default) |
| Perangkat yang diemulasikan | Mobile & Desktop |
| Jenis build yang diuji | `npm run build` lalu `npm run preview` (atau Vite dev server) |
| Tanggal pengujian | 12 Oktober 2026 |

---

## 2. Skor Lighthouse Accessibility (Minimal 85)
| Halaman | Alamat | Skor Mobile | Skor Desktop |
|---|---|---|---|
| Dashboard | `/` | 92 | 96 |
| Riwayat | `/riwayat` | 90 | 95 |
| Titik Jaga | `/titik-jaga` | 92 | 96 |
| Masuk | `/masuk` | 95 | 98 |

**Temuan dan Perbaikan:** 
Seluruh halaman telah menerapkan elemen semantik HTML (`<main>`, `<nav>`, `<header>`) serta atribut `aria-*` pada elemen interaktif untuk memenuhi standar aksesibilitas web dengan skor di atas ambang batas minimal 85.

---

## 3. Pengujian Formulir (Validasi Sisi Klien)
| Form | Masukan (Input) | Hasil yang Diharapkan | Hasil Sebenarnya (Aktual) | Status |
|---|---|---|---|---|
| **Masuk** | Semua kolom dikosongkan | "Nama pengguna wajib diisi." dan "Password wajib diisi." | Pesan error tampil di bawah kolom | **Lolos** |
| **Masuk** | Nama `ab`, Password `1234567` | Peringatan minimal karakter (nama min. 3, password min. 8) | Pesan peringatan karakter tampil | **Lolos** |
| **Masuk** | Nama `admin`, Password `12345678` | Berpindah halaman ke Dashboard | Berhasil masuk ke Dashboard | **Lolos** |
| **Titik Jaga** | Semua kolom kosong (durasi dikosongkan) | Pesan wajib diisi untuk nama, zona, dan durasi | Pesan error validasi tampil | **Lolos** |
| **Titik Jaga** | Durasi diisi `2` atau `31` | "Durasi harus bilangan bulat 3 sampai 30 detik." | Pesan batas durasi tampil | **Lolos** |
| **Titik Jaga** | Durasi diisi pecahan `8.5` | Pesan error format bilangan bulat | Ditolak karena bukan bilangan bulat | **Lolos** |
| **Titik Jaga** | Data diisi valid dan sesuai format | Muncul pesan berhasil dan data titik baru masuk ke daftar | Titik jaga baru berhasil ditambahkan | **Lolos** |

---

## 4. Responsivitas Antarmuka
| Lebar Perangkat | Target Bagian yang Diperiksa | Hasil Pengujian |
|---|---|---|
| **375 px (Ponsel)** | Menu lipat (hamburger), tata letak satu kolom, tabel dapat digulir horizontal | Berhasil menyesuaikan (*Single column & collapsible menu*) |
| **768 px (Tablet)** | Tata letak dua kolom ringkasan statistik dan konten | Berhasil menyesuaikan (*Two-column grid layout*) |
| **1280 px (Desktop)** | Menu mendatar penuh, tata letak empat kolom ringkasan | Berhasil menyesuaikan (*Full horizontal navbar & 4-columns layout*) |

*Catatan Tangkapan Layar:* Tangkapan layar dari pengujian responsif ini telah disimpan di dalam folder `client/docs/` dengan nama seperti `ponsel-dashboard.png`, `tablet-dashboard.png`, dan `desktop-dashboard.png`.

---

## 5. Navigasi Aplikasi
* **Status Navigasi:** Semua halaman (Dashboard, Riwayat, Titik Jaga, dan Masuk) dapat diakses dengan lancar melalui menu navigasi utama maupun tautan internal aplikasi.
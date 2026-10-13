# Inventaris Aset SecureBot

Versi awal (Latihan Tugas 1 Keamanan Komputasi dan Siber). Mengacu pada kode di repository ini:
backend `src/app.js`, komponen kriptografi `src/*.js`, antarmuka `client/` dan `web/`.
Status "belum ada" ditulis jujur supaya menjadi bahan analisis ancaman di Tugas 1.

## Skala rating
| Rating | Arti |
|---|---|
| **Tinggi** | Pelanggaran menyebabkan kerugian serius: akses penuh, keputusan keamanan yang salah, atau layanan utama berhenti |
| **Sedang** | Pelanggaran mengganggu tetapi dapat dipulihkan atau dampaknya terbatas |
| **Rendah** | Dampak kecil atau data sudah bersifat publik |

K = Kerahasiaan, I = Integritas, A = Ketersediaan.

## 1. Data
| ID | Aset | Lokasi | K | I | A | Alasan | Perlindungan kriptografi |
|---|---|---|---|---|---|---|---|
| A-01 | Password admin (saat dimasukkan di form login) | Browser ke server | Tinggi | Sedang | Rendah | Password yang bocor memberi akses penuh ke dashboard dan perintah robot. | Diverifikasi dengan scrypt di server. Pengiriman masih HTTP tanpa TLS. |
| A-02 | Hash password admin | Memori server (dibuat dari variabel lingkungan saat start) | Sedang | Tinggi | Sedang | Hash yang diganti membuat penyerang bisa masuk, sedangkan hash yang bocor hanya memungkinkan tebakan offline yang lambat. | **scrypt + salt acak 16 byte** |
| A-03 | Token sesi admin | Memori server dan browser | Tinggi | Sedang | Rendah | Pemegang token bertindak sebagai admin selama 15 menit tanpa perlu password. | Dibuat dari CSPRNG (32 byte). Tidak dienkripsi saat dikirim. |
| A-04 | Riwayat kejadian | Memori server | Sedang | Tinggi | Sedang | Riwayat yang dipalsukan menyesatkan keputusan keamanan, sedangkan isinya sendiri tidak terlalu sensitif. | Sumbernya terverifikasi AES-GCM. Penyimpanannya belum dienkripsi atau ditandatangani. |
| A-05 | Paket kejadian robot ke server (dalam perjalanan) | Jaringan lab (WiFi) | Tinggi | Tinggi | Sedang | Penyadap tidak boleh tahu kejadian, dan paket palsu atau lama tidak boleh diterima. | **AES-256-GCM, IV acak, counter anti-replay** |
| A-06 | Perintah server ke robot (dalam perjalanan) | Jaringan lab (WiFi) | Rendah | Tinggi | Sedang | Perintah palsu seperti `ALARM_OFF` melumpuhkan pengamanan, tetapi isi perintah tidak rahasia. | **HMAC-SHA256 + counter** |
| A-07 | Konfigurasi titik jaga | State aplikasi web (data tiruan) | Rendah | Sedang | Rendah | Titik yang diubah membuat patroli melewatkan area, sedangkan lokasinya sendiri tidak rahasia. | Tidak ada |

## 2. Secrets
| ID | Aset | Lokasi | K | I | A | Alasan | Perlindungan kriptografi |
|---|---|---|---|---|---|---|---|
| A-08 | Kunci AES enkripsi kejadian (`SECUREBOT_EVENT_KEY`) | Variabel lingkungan server dan robot | Tinggi | Tinggi | Tinggi | Pemegang kunci dapat membaca dan memalsukan semua kejadian, dan kunci yang hilang menghentikan pengiriman. | Dibuat dari CSPRNG 32 byte. Satu kunci untuk semua robot, belum ada rotasi. |
| A-09 | Kunci HMAC perintah (`SECUREBOT_CMD_KEY`) | Variabel lingkungan | Tinggi | Tinggi | Sedang | Pemegang kunci dapat memerintah robot seolah-olah server. | Dibuat dari CSPRNG 32 byte |
| A-10 | Password admin awal (`SECUREBOT_ADMIN_PASSWORD`) | Variabel lingkungan terminal | Tinggi | Sedang | Sedang | Sama dengan A-01, tetapi juga terekam di riwayat perintah terminal lokal. | Di-hash scrypt saat server mulai. Tidak ada di repository. |
| A-11 | Token bot Telegram (`TELEGRAM_BOT_TOKEN`) | Variabel lingkungan server | Tinggi | Sedang | Sedang | Pemegang token mengendalikan bot dan dapat mengirim pesan palsu ke admin. | Tidak ada. Hanya dipakai lewat HTTPS ke Telegram. |
| A-12 | Chat ID Telegram (`TELEGRAM_CHAT_ID`) | Variabel lingkungan server | Sedang | Rendah | Rendah | Mengidentifikasi akun pribadi admin sehingga termasuk data pribadi. | Tidak ada |

## 3. Layanan
| ID | Aset | Lokasi | K | I | A | Alasan | Perlindungan kriptografi |
|---|---|---|---|---|---|---|---|
| A-13 | Backend API | `src/app.js`, port 3000 | Sedang | Tinggi | Tinggi | Semua kejadian, login, dan perintah melewatinya, jadi gangguan menghentikan pemantauan. | Memakai komponen kriptografi A-02, A-05, A-06. Belum ada TLS. |
| A-14 | Dashboard web | `client/` dan `web/dashboard.html` | Rendah | Sedang | Sedang | Tampilan yang dimodifikasi dapat menipu admin, sedangkan kodenya tidak rahasia. | Tidak ada |
| A-15 | Robot patroli (saat ini simulasi, rencana ESP32) | Lab | Sedang | Tinggi | Tinggi | Robot yang diambil alih menghasilkan data palsu dan melumpuhkan patroli. | Menyimpan kunci A-08 dan A-09. Belum ada autentikasi robot terpisah. |
| A-16 | Telegram Bot API (pihak ketiga) | api.telegram.org | Sedang | Sedang | Sedang | Isi notifikasi melewati pihak ketiga, dan gangguan layanan menunda peringatan. | TLS (HTTPS) |
| A-17 | Repository GitHub dan CI | github.com | Sedang | Tinggi | Sedang | Repository publik sehingga kode terbuka, tetapi commit dan tag yang dinilai tidak boleh berubah. | TLS oleh GitHub. Tidak ada tanda tangan commit. |

## 4. Backup
| ID | Aset | Lokasi | K | I | A | Alasan | Perlindungan kriptografi |
|---|---|---|---|---|---|---|---|
| A-18 | Cadangan riwayat kejadian | **Belum ada** (riwayat hanya di memori dan hilang saat server restart) | Sedang | Tinggi | Sedang | Cadangan harus utuh agar riwayat dapat dipulihkan, dan berisi data yang sama dengan A-04. | Rencana: enkripsi cadangan setelah database ada (Milestone 2) |

## 5. Log
| ID | Aset | Lokasi | K | I | A | Alasan | Perlindungan kriptografi |
|---|---|---|---|---|---|---|---|
| A-19 | Log konsol server | Terminal server | Rendah | Sedang | Rendah | Hanya mencetak pesan generik, dan token atau kunci tidak pernah dicetak. | Tidak ada |
| A-20 | Log audit aplikasi (login gagal, perintah, kejadian) | **Belum ada** | Sedang | Tinggi | Sedang | Tanpa log yang utuh, serangan tidak dapat ditelusuri dan bukti dapat dihapus penyerang. | Rencana: log append-only dengan rantai hash |

## 6. Akun
| ID | Aset | Lokasi | K | I | A | Alasan | Perlindungan kriptografi |
|---|---|---|---|---|---|---|---|
| A-21 | Akun admin dashboard (`admin`, satu akun) | Backend API | Tinggi | Tinggi | Sedang | Akun ini memegang seluruh kendali atas dashboard dan robot. | Password di-hash scrypt. Belum ada 2FA dan belum ada pembatasan percobaan login. |
| A-22 | Akun GitHub pemilik repository | github.com | Tinggi | Tinggi | Sedang | Akun yang diambil alih dapat mengubah kode, tag, dan riwayat yang dinilai. | Sesuai pengaturan GitHub. 2FA disarankan. |

## Ringkasan
- Total aset: 22 (7 data, 5 secrets, 5 layanan, 1 backup, 2 log, 2 akun).
- Aset dengan perlindungan kriptografi di aplikasi: A-02 (scrypt), A-05 (AES-GCM), A-06 (HMAC), A-03, A-08, A-09 (dibuat CSPRNG), dan A-16 (TLS).
- Aset yang belum ada: A-18 (backup) dan A-20 (log audit).

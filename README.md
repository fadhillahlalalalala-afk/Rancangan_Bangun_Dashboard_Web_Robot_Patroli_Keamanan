# SecureBot — Dashboard Web Robot Patroli dengan Pengamanan Kriptografi

Repository bersama untuk **Kriptografi**, **Pengembangan Aplikasi Web**, dan **Keamanan Komputasi dan Siber**.
Tag penilaian Tugas 1 Kriptografi: **v0.1**. Seluruh data di repository ini sintetis.

## 1. Deskripsi produk (K1)
SecureBot adalah dashboard web untuk memantau robot patroli keamanan di lab. Robot berhenti di titik jaga,
memindai gerakan 180° (kiri, tengah, kanan), lalu mengirim peringatan ke server. Admin melihat riwayat kejadian
dan mengirim perintah ke robot. Produk terdiri dari:

| Bagian | Berkas | Peran |
|---|---|---|
| Backend web | `src/app.js`, `src/server.js` | API login, penerimaan kejadian, riwayat, perintah |
| Dashboard | `web/dashboard.html` | Login admin, riwayat kejadian, tombol perintah |
| Simulator robot | `web/simulator.html` (`/simulator`) | Visualisasi patroli dan demo serangan |
| Sisi robot (simulasi) | `src/robotClient.js` | Mengenkripsi kejadian, memverifikasi perintah |
| **Komponen kriptografi** | `src/passwordHash.js`, `src/eventCrypto.js`, `src/commandMac.js` | Tugas ini |

## 2. Kebutuhan kriptografi (K1)

| # | Data (aset) | Tujuan keamanan | Prioritas | Kebutuhan komponen yang dapat diuji | Uji |
|---|---|---|---|---|---|
| 1 | Password admin | Kerahasiaan (tahan tebak offline bila penyimpanan bocor) | **Tinggi** | Disimpan sebagai hash lambat + salt acak; password salah ditolak; password < 8 karakter ditolak | T1–T4, T11, T12 |
| 2 | Kejadian robot → server (jenis, titik, arah) | Kerahasiaan, integritas, keaslian, anti-replay | **Tinggi** | Terenkripsi dan terautentikasi; data diubah ditolak; paket yang sama dikirim ulang ditolak; IV tidak berulang | T5–T9, T14, T15, T18 |
| 3 | Perintah server → robot (mis. ALARM_OFF) | Integritas dan keaslian | **Sedang** | Setiap perintah memiliki MAC; perintah yang diubah ditolak | T10, T17 |

Sandi klasik (Caesar, Vigenère) hanya **bahan belajar** dan **tidak dipakai** untuk melindungi data produk
karena dapat dipecahkan dengan analisis frekuensi dan pencarian kunci menyeluruh.

## 3. Rancangan komponen (K2)

| Komponen | Masukan | Proses | Keluaran |
|---|---|---|---|
| `passwordHash.js` | password (string ≥ 8 karakter) | salt 16 byte dari CSPRNG → scrypt (N=16384, r=8, p=1) | `scrypt$N$r$p$salt_b64$hash_b64`; verifikasi → boolean (waktu-konstan) |
| `eventCrypto.js` | kunci 32 byte, deviceId, counter ≥ 1, objek kejadian | IV 12 byte dari CSPRNG → AES-256-GCM; deviceId sebagai AAD; counter di dalam plaintext; penerima menyimpan counter terakhir per perangkat dan memperbaruinya hanya setelah semua pemeriksaan lolos | amplop `{v, device, iv, ct, tag}` (base64); penerima mengembalikan kejadian atau melempar error |
| `commandMac.js` | kunci ≥ 32 byte, perintah, counter | HMAC-SHA256 atas `counter|perintah` | `{command, counter, mac(hex)}`; verifikasi → boolean (waktu-konstan) |

**Encoding vs enkripsi.** Kunci, IV, tag, dan ciphertext adalah byte (`Buffer`). Base64 dan hex hanyalah *encoding*
agar byte bisa dikirim sebagai teks JSON; keduanya dapat dibalik tanpa kunci dan tidak memberi perlindungan.
Perlindungan berasal dari AES-GCM dan HMAC.

**Sumber keacakan.** Kunci, salt, IV, dan token sesi berasal dari `crypto.randomBytes` (CSPRNG sistem operasi).
`Math.random` tidak dipakai untuk nilai rahasia apa pun.

**Alasan pemilihan pustaka.** `node:crypto` (bawaan Node.js, membungkus OpenSSL yang terpelihara dan diaudit luas)
dipilih tanpa dependensi pihak ketiga agar permukaan serangan rantai pasok kecil. AES-GCM adalah AEAD: satu
primitif memberi kerahasiaan sekaligus integritas, sehingga tidak perlu merakit enkripsi + MAC sendiri.
scrypt sengaja memakan memori sehingga mahal bagi penyerang yang memakai GPU, berbeda dengan SHA-256 yang
terlalu cepat untuk password. HMAC-SHA256 dipakai untuk perintah karena perintah pendek dan tidak perlu
dirahasiakan, hanya perlu keaslian.

**Keputusan keamanan yang perlu dijelaskan.** (a) IV acak 12 byte per pesan: IV tidak boleh berulang dengan kunci
yang sama pada GCM. (b) `authTagLength` dipaksa 16 byte dan panjang IV/tag diperiksa, mencegah tag pendek.
(c) `timingSafeEqual` untuk semua perbandingan rahasia. (d) Counter berada di dalam plaintext sehingga ikut
terlindungi tag; counter hanya diperbarui setelah dekripsi sukses sehingga paket palsu tidak bisa memajukan counter.
(e) `deviceId` sebagai AAD mengikat paket ke perangkat pengirimnya.

**Batasan v0.1 (ditulis jujur).** Distribusi dan rotasi kunci belum dibahas; counter disimpan di memori sehingga
hilang saat server restart; satu kunci bersama untuk semua robot; endpoint `/api/events` dan
`/api/commands/next` belum memakai autentikasi robot terpisah; belum ada pembatasan percobaan login.
Beberapa di antaranya menjadi bahan tugas Keamanan Siber dan tugas Kriptografi berikutnya.

## 4. Cara menjalankan (K3)
https://github.com/fadhillahlalalalala-afk/Rancangan_Bangun_Dashboard_Web_Robot_Patroli_Keamanan/blob/main/(K3)img.pdf

Prasyarat: Node.js ≥ 18. Tidak ada dependensi, jadi **tidak perlu `npm install`**.

**a. Uji otomatis (satu perintah)**
```bash
npm test
```
**b. Demo alur lengkap (server + robot + penyerang, satu perintah)**
```bash
npm run demo
```
**c. Menjalankan produk dan membuka dashboard**
```bash
export SECUREBOT_EVENT_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
export SECUREBOT_CMD_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")
export SECUREBOT_ADMIN_PASSWORD="isi-password-lokal-anda"
npm start
# buka http://127.0.0.1:3000  (login: admin / password di atas)
```
Rahasia hanya ada di variabel lingkungan, tidak di repository (lihat `.env.example`).

### Contoh keluaran `npm run demo`
```

[1] Login admin (komponen: scrypt)
  password salah -> 401
  password benar -> 200 (token sesi diterima, panjang 64 hex)

[2] Robot mengirim kejadian terenkripsi (komponen: AES-256-GCM)
  yang terlihat penyadap : {"v":1,"device":"robot-01","iv":"MKv0+NED8Em83Wtd","ct":"GaZEZNUYd/WDcGMszM7xXsuT...","tag":"uiz1uVeojsjvrn96YDpw6Q=="}
  respons server         : 201

[3] Penyerang mengirim ulang paket yang sama (replay)
  respons server         : 409 replay ditolak

[4] Penyerang mengubah satu byte ciphertext
  respons server         : 400 paket ditolak

[5] Admin mengirim perintah, robot memverifikasi (komponen: HMAC-SHA256)
  robot menerima perintah: ALARM_OFF (MAC valid)

[6] Dashboard membaca riwayat (hanya dengan token)
  jumlah kejadian tersimpan: 1 -> {"type":"gerak","zone":"B","dir":"KIRI"}
```

## 5. Skenario uji (`npm test`: 18 uji, 18 lulus) (K4)
https://github.com/fadhillahlalalalala-afk/Rancangan_Bangun_Dashboard_Web_Robot_Patroli_Keamanan/blob/main/(K4)img.pdf

| ID | Skenario | Jenis | Hasil yang diharapkan |
|---|---|---|---|
| T1 | Verifikasi password benar | normal | `true` |
| T2 | Verifikasi password salah | negatif | `false` |
| T3 | Hash password sama dua kali | normal | dua string hash berbeda (salt acak) |
| T4 | Password 7 vs 8 karakter | batas | 7 → `RangeError`; 8 → diterima |
| T5 | Enkripsi lalu dekripsi kejadian | normal | objek identik dengan aslinya |
| T6 | Satu byte ciphertext diubah | negatif | dekripsi melempar error (tag tidak cocok) |
| T7 | deviceId dipalsukan | negatif | dekripsi melempar error (AAD tidak cocok) |
| T8 | Paket valid diterima dua kali | negatif | kedua ditolak dengan pesan `replay` |
| T9 | Kunci 16 byte dan counter 0 | batas | `RangeError` |
| T10 | HMAC perintah asli vs diubah | normal + negatif | asli `true`, diubah `false` |
| T11 | Login admin benar (HTTP) | normal | 200 + token 64 hex |
| T12 | Login password salah (HTTP) | negatif | 401 |
| T13 | Baca riwayat tanpa token | negatif | 401 |
| T14 | Robot kirim kejadian terenkripsi, dashboard membaca | normal | 201; riwayat memuat kejadian yang sama |
| T15 | Replay paket lewat HTTP | negatif | 409 |
| T16 | Body 20 KB (batas 16 KB) | batas | 413 |
| T17 | Perintah tanpa token vs dengan token | negatif + normal | 401; lalu robot menerima perintah dengan MAC valid |
| T18 | Dua enkripsi data sama | normal | `iv` dan `ct` berbeda |

## 6. Keamanan repository
Tidak ada kunci, token, atau password asli. Uji dan demo memakai kunci acak yang dibuat saat dijalankan serta
password sintetis. `.env`, `*.pem`, dan `*.key` ada di `.gitignore`.

## 7. Pencatatan penggunaan AI
Lihat `AI_LOG.md`.

## 8. Struktur repository
```
src/            komponen kriptografi, backend, sisi robot
test/           uji unit (T1-T10, T18) dan uji integrasi HTTP (T11-T17)
demo/           demo satu perintah
web/            dashboard dan simulator robot
.github/        CI: menjalankan npm test pada setiap push
AI_LOG.md       pencatatan penggunaan AI
DEMO_NOTES.md   latihan dan bahan demo
CHECKLIST_RUBRIK.md  daftar periksa sebelum mengumpulkan
```

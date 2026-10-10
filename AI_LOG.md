# AI_LOG

> TEMPLATE: periksa, koreksi, dan lengkapi kolom bertanda [isi] sesuai yang benar-benar kamu lakukan.
> Mahasiswa wajib mampu menjelaskan seluruh kode yang dikumpulkan.

| # | Alat | Tujuan | Ringkasan perintah | Bagian dipakai / diubah | Cara memeriksa |
|---|---|---|---|---|---|
| 1 | Claude | Konsep dan simulator web robot patroli | Minta ide simulasi robot virtual dengan sensor 180° dan demo serangan | `web/simulator.html` dipakai; [isi yang kamu ubah] | Menjalankan di browser, mencoba replay dan spoofing di mode aman dan tidak aman |
| 2 | Claude | Rancangan dan kode komponen kriptografi, backend, uji | Minta repo untuk Tugas 1 sesuai rubrik: scrypt, AES-GCM, HMAC, backend, uji otomatis | `src/*`, `test/*`, `demo/demo.js`, `web/dashboard.html`, `README.md`; [isi yang kamu ubah] | `npm test` (18/18 lulus); `npm run demo`; membaca dokumentasi `node:crypto`; uji mutasi satu baris (lihat `DEMO_NOTES.md`); [isi eksperimen sendiri] |

## Refleksi
- Hal yang saya pahami dan bisa jelaskan: Dari pengerjaan tugas ini saya belajar bahwa kriptografi bukan sekadar "mengenkripsi semuanya", tetapi memilih alat yang sesuai dengan tujuan keamanannya. Untuk password admin, saya memakai scrypt dengan salt acak karena password tidak perlu dibaca kembali, dan hash yang sengaja lambat membuat tebakan offline jadi mahal. Untuk data kejadian dari robot, saya memakai AES-256-GCM karena data itu harus rahasia sekaligus tidak boleh diubah, dan tag autentikasinya membuat paket yang dimodifikasi satu byte saja langsung ditolak. Saya juga paham bahwa IV harus acak dan tidak boleh berulang karena pada GCM, IV yang sama dengan kunci yang sama bisa membocorkan isi pesan, lalu counter di dalam pesan dipakai untuk menolak serangan replay. Untuk perintah ke robot, cukup HMAC-SHA256 karena yang dibutuhkan hanya keaslian, bukan kerahasiaan. Saya jadi bisa membedakan encoding seperti base64 yang bisa dibalik tanpa kunci dengan enkripsi yang butuh kunci, serta mengerti kenapa nilai rahasia harus dibuat dengan CSPRNG, bukan Math.random. Lewat uji otomatis dan latihan mengubah satu baris kode, saya melihat langsung bahwa kesalahan kecil seperti <= menjadi < bisa membuka celah replay, dan bahwa IV tetap tidak merusak fungsi program padahal berbahaya, sehingga uji fungsional saja tidak cukup untuk membuktikan sistem aman.

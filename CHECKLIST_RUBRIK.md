# Checklist Rubrik R1 (Tugas 1 Kriptografi)

Centang sendiri sebelum mengumpulkan. Bukti ada di berkas yang disebutkan.

## K1 Deskripsi produk dan kebutuhan (20)
- [ ] Deskripsi produk jelas (`README.md` bagian 1)
- [ ] Minimal 3 data dipetakan ke tujuan keamanan yang tepat, dengan prioritas (bagian 2)
- [ ] Tiap data diturunkan menjadi kebutuhan komponen yang dapat diuji (kolom "Uji")
- [ ] Sandi klasik ditandai sebagai bahan belajar, bukan perlindungan produk

## K2 Rancangan komponen (20)
- [ ] Tabel masukan-proses-keluaran untuk tiap komponen (bagian 3)
- [ ] Penjelasan encoding vs enkripsi
- [ ] CSPRNG untuk semua nilai rahasia
- [ ] Alasan pemilihan pustaka yang spesifik

## K3 Implementasi (25)
- [ ] `npm run demo` dan `npm start` berjalan sesuai README di komputer sendiri
- [ ] Komponen terpisah di `src/passwordHash.js`, `eventCrypto.js`, `commandMac.js`
- [ ] Tidak ada kunci, token, password, atau data pribadi di repository (`git grep -i -E "password|token|secret"` hanya menemukan nama variabel dan data sintetis)

## K4 Skenario uji (25)
- [ ] `npm test` lulus semua dengan satu perintah
- [ ] Minimal 4 skenario, minimal 3 berhasil, ada uji negatif dan uji batas
- [ ] Tabel skenario di README sesuai isi `test/`

## K5 Penjelasan, demo, AI_LOG (10)
- [ ] `AI_LOG.md` sudah diisi spesifik (alat, tujuan, perintah, bagian dipakai/diubah, cara memeriksa)
- [ ] Sudah mencoba sendiri minimal dua latihan "ubah satu baris" (`DEMO_NOTES.md`)
- [ ] Bisa menjelaskan tiap file di `src/` tanpa membaca catatan
- [ ] Sudah berlatih demo 3 menit

## Pengumpulan
- [ ] Nama di `LICENSE` dan identitas git sudah benar
- [ ] Push ke GitHub (repository publik atau dosen diberi akses)
- [ ] `git tag v0.1` pada commit final, lalu `git push origin v0.1`
- [ ] Tautan repository dan tag ditulis di kolom teks sebelum tenggat
- [ ] Tag tidak dipindahkan setelah tenggat

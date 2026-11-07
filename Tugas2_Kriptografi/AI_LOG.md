# AI_LOG.md — Catatan Penggunaan AI Generatif

> **Petunjuk:** Isi/ubah bagian bertanda `[ISI]` sesuai pengalaman Anda sendiri. Catatan ini harus jujur dan mencerminkan apa yang benar-benar Anda lakukan. Anda wajib mampu menjelaskan seluruh kode.

## Entri 1
| Kolom | Isi |
|---|---|
| Tanggal | [ISI: tanggal] |
| Alat | Claude (Anthropic), antarmuka chat |
| Tujuan | Membuat kerangka modul AEAD AES-256-GCM, skrip keygen, unit test, dan draf KEPUTUSAN.md untuk produk Dashboard Web Robot Patroli Keamanan |
| Ringkasan perintah | Meminta pembuatan berkas tugas Sub-CPMK 3 (AEAD/MAC dengan pustaka terpelihara) bertema dashboard robot patroli, mengikuti ketentuan minimum tugas |
| Bagian yang dipakai / diubah | [ISI: mis. "Memakai kripto/aead.py; mengubah daftar jenis record dan nama robot_id agar sesuai database saya; menambah ..."] |
| Cara memeriksa | Menjalankan `python -m unittest discover -v` (16 uji lolos); membaca dokumentasi `cryptography` untuk `AESGCM`; menjalankan `demo.py` dan memodifikasi ciphertext secara manual untuk memastikan ditolak; memeriksa `git status` bahwa tidak ada berkas `.key` ikut ter-commit; [ISI: pemeriksaan tambahan Anda] |

## Pemahaman yang saya verifikasi sendiri
- Mengapa nonce tidak boleh dipakai ulang pada kunci yang sama: [ISI dengan kata sendiri]
- Fungsi AAD dan mengapa tidak dienkripsi: [ISI]
- Mengapa pesan galat dekripsi dibuat generik: [ISI]
- Mengapa kunci disimpan di luar repository: [ISI]

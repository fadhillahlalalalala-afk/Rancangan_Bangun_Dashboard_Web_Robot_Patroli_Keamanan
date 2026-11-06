# KEPUTUSAN.md — Perlindungan Data Kriptografi (v0.2)

**Produk:** Rancangan Bangun Dashboard Web Robot Patroli Keamanan
**Sub-CPMK 3 — Kriptografi terapan (AEAD)**
**Pustaka:** `cryptography` (Python, pyca) — `AESGCM`, dipelihara aktif, berbasis OpenSSL.

## 1. Kebutuhan → Mekanisme → Alasan

| # | Kebutuhan (aset & ancaman) | Mekanisme | Alasan |
|---|---|---|---|
| K-1 | **Kerahasiaan** telemetri robot (posisi GPS, rute patroli, event deteksi, status baterai) saat disimpan di basis data dan saat dikirim robot → server. Bocornya rute/jadwal patroli memungkinkan penyusup menghindari robot. | **AES-256-GCM** (AEAD) | Satu primitif menjamin kerahasiaan *dan* integritas; standar NIST SP 800-38D; didukung akselerasi perangkat keras (AES-NI/ARMv8) sehingga cocok untuk robot dengan sumber daya terbatas. |
| K-2 | **Integritas & keaslian** record: penyerang tidak boleh memalsukan atau mengubah event (misal menghapus "intrusi terdeteksi"). | Tag autentikasi GCM 128-bit, diverifikasi **sebelum** plaintext dikembalikan | Perubahan 1 bit pada ciphertext/tag/nonce/AAD membuat dekripsi ditolak. |
| K-3 | **Pengikatan konteks**: record robot A tidak boleh disalin/diputar ulang seolah milik robot B atau sebagai jenis record lain. | **AAD** = `v1\|key_id\|robot_id\|jenis` | AAD tidak dienkripsi tetapi ikut diautentikasi; perubahan konteks → tag gagal. |
| K-4 | Kunci tidak boleh bocor lewat repository. | Kunci dibangkitkan CSPRNG, disimpan **di luar repo**, dimuat lewat `PATROLI_KEY_FILE` | Lihat §3. |

**Mengapa bukan alternatif lain?**
- *Hanya HMAC-SHA256*: menjamin integritas, **tidak** menjamin kerahasiaan. Kebutuhan K-1 tidak terpenuhi.
- *AES-CBC + HMAC (encrypt-then-MAC)*: aman bila benar, tetapi dua kunci dan dua langkah → lebih mudah salah rakit. AEAD lebih sederhana.
- *ChaCha20-Poly1305*: juga pilihan baik; AES-GCM dipilih karena dukungan perangkat keras luas dan keseragaman dengan komponen web/server.
- *Membuat algoritma sendiri / ECB / enkripsi tanpa autentikasi*: tidak aman dan dilarang ketentuan tugas.

## 2. Parameter

| Parameter | Nilai | Keterangan |
|---|---|---|
| Algoritma | AES-256-GCM | `cryptography.hazmat.primitives.ciphers.aead.AESGCM` |
| Panjang kunci | **256 bit (32 byte)** | Divalidasi eksak; selain 32 byte ditolak |
| Nonce | **96 bit (12 byte)**, acak dari `os.urandom` | Baru **untuk setiap enkripsi**; tidak pernah diberikan pemanggil. Dikirim bersama ciphertext (nonce tidak rahasia) |
| Batas pemakaian kunci | ≤ 2³² enkripsi per kunci | Batas NIST untuk nonce acak 96-bit (peluang tabrakan diabaikan). Setelah itu **rotasi kunci** (ganti `key_id`) |
| AAD | `v1\|<key_id>\|<robot_id>\|<jenis>` (ASCII) | `robot_id` ∈ `[A-Za-z0-9_-]{1,32}`; `jenis` ∈ daftar izin {telemetri, event_deteksi, log_rute, status} |
| Tag | **128 bit (16 byte)** | Ditambahkan di akhir ciphertext oleh pustaka; diverifikasi sebelum dekripsi dilepas |
| Plaintext | JSON kanonis ASCII, maks **64 KiB** | `NaN/Infinity` ditolak |
| Format simpan/kirim | JSON envelope `{v, kid, rid, jns, nonce, ct}` (base64) | Struktur dan panjang setiap field divalidasi |

## 3. Manajemen Kunci
- **Pembangkitan:** `python -m kripto.keygen <path> <key_id>` memakai `os.urandom(32)` (CSPRNG OS).
- **Penyimpanan:** berkas di luar repository (mis. `~/.config/patroli/kunci_v1.key`), izin `600`, dibuat dengan `O_EXCL` (tidak menimpa). `keygen` **menolak** path di dalam repo. `.gitignore` memblokir `*.key`, `*.pem`, `.env`.
- **Pemuatan:** variabel lingkungan `PATROLI_KEY_FILE`. Dimuat gagal-tertutup bila berkas hilang, format salah, panjang ≠ 32 byte, atau izin terlalu longgar (grup/other dapat membaca).
- **Rotasi:** `key_id` tercatat pada setiap envelope sehingga kunci baru dapat diperkenalkan tanpa memutus pembacaan data lama.
- **Produksi (di luar lingkup v0.2):** pindahkan ke secret manager / KMS / TPM robot.

## 4. Masukan & Penanganan Kegagalan (Gagal Tertutup)
- Semua masukan divalidasi sebelum kripto dijalankan: tipe, panjang kunci, regex ID, daftar izin jenis, ukuran, base64 ketat (`validate=True`), panjang nonce = 12, panjang ciphertext ≥ 16.
- Kegagalan verifikasi → `DecryptionError` dengan pesan **generik** (tidak membedakan "kunci salah" vs "data diubah") agar tidak menjadi oracle. Tidak ada plaintext parsial dikembalikan.
- Masukan tidak valid → `ValidationError`; masalah kunci → `KeyError_`. Pemanggil (backend dashboard) wajib memperlakukan semuanya sebagai **tolak** (HTTP 400/401), bukan melanjutkan dengan data mentah.
- Tidak ada log yang memuat kunci, plaintext, atau nonce+ciphertext lengkap.

## 5. Skenario Uji (`python -m unittest discover -v`)
| ID | Skenario | Hasil yang diharapkan |
|---|---|---|
| S1 | Enkripsi→dekripsi sah | Berhasil, data identik |
| S2 | Dua enkripsi data sama | Nonce & ciphertext berbeda; nonce 12 byte |
| S3 | Semua jenis record; panjang ct = plaintext + 16 | Berhasil, tag 128-bit terbukti |
| S4 | Muat kunci dari berkas izin 600 | Berhasil |
| T1 | Ciphertext dimodifikasi | **Ditolak** |
| T2 | Tag dimodifikasi | **Ditolak** |
| T3 | Kunci salah | **Ditolak** |
| T4–T5 | `robot_id` / `jenis` (AAD) diubah | **Ditolak** |
| T6 | Nonce diubah | **Ditolak** |
| T7 | Konteks tak sesuai harapan pemanggil | **Ditolak** |
| V1–V5 | Masukan invalid, kunci ≠ 32 byte, envelope rusak, field terpotong, berkas kunci hilang/pendek/izin longgar | **Ditolak** (gagal tertutup) |

Total 16 uji (4 skenario sah, 12 penolakan).

## 6. Batasan yang Diketahui
- AEAD tidak mencegah **replay** record utuh yang sama; mitigasi lanjutan: tambahkan `ts`/counter berurutan di plaintext dan tolak yang kedaluwarsa/duplikat di sisi server.
- Tidak menyembunyikan **metadata** (`robot_id`, `jenis`, ukuran, waktu kirim).
- Kunci simetris bersama: pembocoran kunci pada satu perangkat membuka seluruh data. Rencana lanjutan: kunci per-robot (derivasi HKDF) dan TLS untuk transport.
- Hanya melindungi data aplikasi; autentikasi pengguna dashboard dan TLS ditangani modul Pengembangan Aplikasi Web.

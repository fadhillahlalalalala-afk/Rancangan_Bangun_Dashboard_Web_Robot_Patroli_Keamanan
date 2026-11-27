# Pemetaan Kontrol Tugas 2 ke Register Risiko Tugas 1 (sec-0.2)

Penanda: `sec-0.2`
Sumber: `risk-register.md`, `threat-model.md`, `rencana_control_risk.md`, `dfd.md`.

## 1. Pemetaan kontrol

| ID risiko | Ancaman (Tugas 1) | Kontrol Tugas 2 | Bukti | Penanda |
|---|---|---|---|---|
| Risk-01, T13 | Akses data atau fungsi tanpa otorisasi | Matriks akses per peran, token wajib pada `/api/events`, `/api/commands`, `/api/notify` | `security/access-tests.md` (N1 sampai N8) | `sec-0.2` |
| Risk-01, T01 | Pengambilalihan akun admin lewat tebak kata sandi | scrypt + salt unik; rencana rate limiting login (lihat temuan 2 di access-tests) | `security/password-hashing.md` | `sec-0.2` |
| Risk-01, T08 | Kebocoran hash tersimpan | Hash lambat membuat tebakan offline mahal | `security/password-hashing.md` | `sec-0.2` |
| T02, T14 | Token dicuri atau dipalsukan | Token CSPRNG 32 byte, berlaku 15 menit, token palsu dan kedaluwarsa ditolak | `access-tests.md` N5, N6 | `sec-0.2` |
| Risk-02, T01 | Akses SSH tidak sah ke VM | SSH hanya kunci, root ditolak, firewall, Lynis ≥ 70 | `security/hardening-vm.md`, `lynis-before.txt`, `lynis-after.txt` | `sec-0.2` |
| Risk-03, T09 | Penguasaan proses lalu pencurian kunci | Container non-root, `cap_drop: ALL`, `no-new-privileges`, filesystem hanya-baca, tanpa rahasia di image | `security/container-hardening.md` | `sec-0.2` |
| Risk-03, T11 | Layanan terbuka ke jaringan publik | Port app dan db tidak dipublikasikan, jaringan internal, batas sumber daya | `docker-compose.yml` | `sec-0.2` |
| Risk-04, T04 | Komponen rentan pada image | Pindai sebelum dan sesudah, tanpa CRITICAL pada image akhir, SBOM | `image-scan-before.txt`, `image-scan-after.txt`, `sbom.cdx.json` | `sec-0.2` |

## 2. Risiko sisa yang diakui

| Risiko | Alasan belum tertutup di Tugas 2 | Rencana |
|---|---|---|
| T07 / celah TB1 tanpa TLS (F1, F4, F9, F12, F13, F19) | Di luar cakupan tugas ini | Pasang reverse proxy TLS sebelum dipakai lewat jaringan nyata |
| `GET /api/commands/next` terbuka | Lihat temuan 1 di `access-tests.md` | Tambah autentikasi perangkat |
| Tidak ada rate limiting login | Lihat temuan 2 di `access-tests.md` | Tambah rate limiter dan uji 429 |
| Satu kunci bersama, tanpa rotasi (T09) | Menunggu manajemen secrets (Tugas 3) | Pindah ke secret manager, rotasi berkala |

## 3. Lingkungan uji

| Komponen | Keterangan (isi sesuai kondisi Anda) |
|---|---|
| VM | Ubuntu _versi_, _spesifikasi_, akses lewat SSH kunci |
| Docker / Compose | versi _isi_ |
| Alat | `curl`, `jq`, `lynis`, `trivy`, `docker compose` |
| Akun uji | `admin` dengan kata sandi uji di `.env` (tidak di-commit) |
| Data | Tidak ada data pengguna nyata |

## 4. Skenario demonstrasi (urutan yang disarankan)

1. **SSH**: `sudo sshd -T | grep -E 'passwordauthentication|permitrootlogin'` menampilkan `no`; coba login kata sandi dan root, keduanya ditolak.
2. **Lynis**: tunjukkan `hardening_index` pada `lynis-before.txt` dan `lynis-after.txt` (≥ 70).
3. **Container**: `docker compose up -d`, lalu `docker compose exec app id` (bukan root), `grep Cap /proc/self/status` (CapEff nol), `docker compose ps` (tanpa port terpublikasi).
4. **Akses per peran**: jalankan uji P1 sampai P8 dan N1 sampai N8 dari `access-tests.md`, tampilkan kode HTTP.
5. **Kata sandi**: jalankan perintah di `password-hashing.md` bagian 2b.
6. **Pemindaian**: tampilkan perbandingan CRITICAL sebelum dan sesudah, dan isi `sbom.cdx.json`.
7. **Keterkaitan risiko**: buka tabel bagian 1 dan tunjuk ID risiko untuk tiap kontrol.

## 5. Yang dikumpulkan

Teks daring berisi: URL repository, penanda `sec-0.2`, dan hash commit (`git rev-parse HEAD`).
Contoh pembuatan penanda: `git tag sec-0.2 && git push origin sec-0.2`.

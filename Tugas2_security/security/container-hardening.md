# Hardening Container dan Pemindaian Image (sec-0.2)

Risiko Tugas 1: Risk-03 (hardening container), Risk-04 (pemindaian image dan SBOM), T04, T09, T11.

## 1. Kontrol yang diterapkan

| Kontrol | Implementasi | Berkas | Risiko |
|---|---|---|---|
| Pengguna non-root | `USER node` dan `user: "1000:1000"` | `Dockerfile`, `docker-compose.yml` | Risk-03, T09 |
| Capability dibatasi | `cap_drop: [ALL]` (db hanya menambah yang minimal) | `docker-compose.yml` | Risk-03 |
| Tanpa eskalasi hak | `no-new-privileges:true` | `docker-compose.yml` | Risk-03 |
| Filesystem hanya-baca | `read_only: true` + `tmpfs` untuk `/tmp` | `docker-compose.yml` | Risk-03, T04 |
| Port tidak dipublikasikan | Tidak ada blok `ports:`; hanya `expose`; jaringan `internal` | `docker-compose.yml` | Risk-03, T11 |
| Batas sumber daya | `pids_limit`, `mem_limit`, `cpus` | `docker-compose.yml` | T11, T12 |
| Image kecil, multi-stage | `node:22-alpine`, hanya dependensi produksi | `Dockerfile` | Risk-04 |
| Tanpa rahasia di image | `.env` dan `secrets/` di `.dockerignore`; rahasia lewat `env_file` dan Docker secrets | `.dockerignore` | T09 |

Catatan: jaringan `internal: true` memutus akses keluar. Notifikasi Telegram (F23) butuh akses keluar HTTPS. Jika fitur itu diuji, pakai jaringan kedua yang tidak internal untuk `app` saja, atau tetapkan `internal: false` dan batasi dengan firewall VM.

## 2. Cara membuktikan

Jalankan setelah `docker compose up -d`, lalu simpan keluarannya sebagai bukti.

```bash
# a. Berjalan sebagai non-root (harus bukan 0)
docker compose exec app id
docker inspect --format '{{.Config.User}}' $(docker compose ps -q app)

# b. Capability dibuang (CapEff harus 0000000000000000)
docker compose exec app sh -c 'grep Cap /proc/self/status'

# c. Port tidak dipublikasikan (kolom PORTS tidak memuat 0.0.0.0:...->)
docker compose ps
docker port $(docker compose ps -q app)          # keluaran kosong

# d. Tidak bisa diakses dari host lewat port tersebut
curl -m 3 http://127.0.0.1:3000/ || echo "tidak terjangkau dari host (diharapkan)"

# e. Filesystem hanya-baca
docker compose exec app sh -c 'touch /app/x' 2>&1 | head -1   # harus: Read-only file system

# f. Tidak bisa naik hak
docker compose exec app su -     2>&1 | head -1
```

Untuk mengakses aplikasi saat uji (tanpa publikasi port), jalankan uji dari dalam jaringan Docker:

```bash
docker compose exec app node -e "require('http').get('http://127.0.0.1:3000/',r=>console.log(r.statusCode))"
```

## 3. Pemindaian kerentanan sebelum dan sesudah

Jalankan `bash scripts/scan.sh`. Skrip menghasilkan:

| Berkas | Isi |
|---|---|
| `image-scan-before.txt` | Hasil Trivy untuk `Dockerfile.before` (sebelum perbaikan) |
| `image-scan-after.txt` | Hasil Trivy untuk `Dockerfile` (sesudah perbaikan) |
| `sbom.cdx.json` | SBOM format CycloneDX untuk image akhir |

Perbaikan yang diharapkan menurunkan temuan: ganti base image ke versi yang masih didukung dan lebih kecil (alpine), pakai `npm ci --omit=dev`, perbarui dependensi (`npm audit fix` atau naikkan versi paket yang rentan).

### Ringkasan hasil (isi setelah dijalankan)

| Tingkat | Sebelum | Sesudah |
|---|---|---|
| CRITICAL | _isi_ | _isi_ (harus 0) |
| HIGH | _isi_ | _isi_ |
| MEDIUM | _isi_ | _isi_ |
| LOW | _isi_ | _isi_ |

Jika masih ada CRITICAL pada image akhir, tulis di sini ID CVE, paket, dan alasan belum bisa diperbaiki (misalnya belum ada versi perbaikan, atau paket tidak terpakai saat runtime), beserta rencana mitigasinya.

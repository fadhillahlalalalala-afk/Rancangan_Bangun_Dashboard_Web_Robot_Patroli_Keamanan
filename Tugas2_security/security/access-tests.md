# Matriks Akses dan Uji Akses SecureBot (sec-0.2)

Penanda: `sec-0.2`
Risiko Tugas 1 yang dirujuk: Risk-01 (RBAC dan hash kata sandi), T13 (akses tanpa otorisasi), T01 (pengambilalihan akun), T02 dan T14 (token sesi dan klaim peran). Lihat `risk-controls.md`.

## 1. Peran pada SecureBot

| Peran | Siapa | Cara autentikasi |
|---|---|---|
| Anonim | Siapa pun yang belum login | Tidak ada |
| Admin | Pengguna dashboard (E1) | `POST /api/login`, lalu token sesi 15 menit |
| Robot | Robot patroli (E2) | Amplop AES-256-GCM (F5) dan perintah bertanda HMAC (F18) |

## 2. Matriks akses (peran x endpoint)

Keterangan: ✅ diizinkan, ❌ harus ditolak.

| Endpoint | Anonim | Admin | Robot |
|---|:---:|:---:|:---:|
| `POST /api/login` | ✅ (publik, memberi token bila benar) | ✅ | ❌ tidak relevan |
| `GET /api/events` (riwayat) | ❌ | ✅ | ❌ |
| `POST /api/commands` (kirim perintah) | ❌ | ✅ | ❌ |
| `POST /api/notify` | ❌ | ✅ | ❌ |
| `POST /api/events` (kirim kejadian) | ❌ (amplop tidak valid ditolak) | ❌ | ✅ (amplop valid) |
| `GET /api/commands/next` | lihat Temuan 1 | ❌ | ✅ |

## 3. Lingkungan uji

- Server: `docker compose up -d` (lihat `docker-compose.yml`), atau `node src/app.js` di VM uji.
- Akun uji: `admin` dengan kata sandi uji dari `.env` (bukan data pengguna nyata).
- Alat: `curl`, `jq`. Variabel: `BASE=http://127.0.0.1:3000`.
- Token valid didapat sekali:
  ```bash
  TOKEN=$(curl -s -X POST $BASE/api/login -H 'Content-Type: application/json' \
    -d '{"username":"admin","password":"'"$SECUREBOT_ADMIN_PASSWORD"'"}' | jq -r .token)
  ```
- Amplop robot valid dibuat oleh `src/robotClient.js` (atau skrip uji yang memakai kunci uji).

## 4. Uji positif (akses yang seharusnya berhasil)

| ID | Peran | Perintah | Hasil diharapkan | Hasil aktual | Status |
|---|---|---|---|---|---|
| P1 | Admin | `curl -s -o /dev/null -w "%{http_code}" -X POST $BASE/api/login -d '{...benar}'` | 200 dan token | _isi_ | ☐ |
| P2 | Admin | `curl -H "Authorization: Bearer $TOKEN" $BASE/api/events` | 200 | _isi_ | ☐ |
| P3 | Admin | `curl -X POST -H "Authorization: Bearer $TOKEN" $BASE/api/commands -d '{"command":"ALARM_ON"}'` | 200/201 | _isi_ | ☐ |
| P4 | Admin | `curl -X POST -H "Authorization: Bearer $TOKEN" $BASE/api/notify -d '{...}'` | 200 | _isi_ | ☐ |
| P5 | Robot | `node src/robotClient.js` mengirim kejadian valid | 200/202, kejadian muncul di riwayat | _isi_ | ☐ |
| P6 | Robot | Robot mengambil `GET /api/commands/next` | 200, perintah bertanda HMAC valid | _isi_ | ☐ |
| P7 | Admin | Pakai token yang baru dibuat (< 15 menit) pada P2 | 200 | _isi_ | ☐ |
| P8 | Admin | Login lalu cek perintah di P3 diterima robot (P6) dengan MAC valid | MAC dan counter valid | _isi_ | ☐ |

## 5. Uji negatif (akses yang seharusnya ditolak)

| ID | Peran | Perintah | Hasil diharapkan | Hasil aktual | Status |
|---|---|---|---|---|---|
| N1 | Anonim | `curl -s -o /dev/null -w "%{http_code}" $BASE/api/events` (tanpa token) | 401 | _isi_ | ☐ |
| N2 | Anonim | `curl -X POST $BASE/api/commands -d '{"command":"ALARM_OFF"}'` | 401 | _isi_ | ☐ |
| N3 | Anonim | `curl -X POST $BASE/api/notify -d '{...}'` | 401 | _isi_ | ☐ |
| N4 | Anonim | Login dengan kata sandi salah | 401, tanpa token | _isi_ | ☐ |
| N5 | Anonim | `curl -H "Authorization: Bearer $(openssl rand -hex 32)" $BASE/api/events` (token palsu) | 401 | _isi_ | ☐ |
| N6 | Admin | Token kedaluwarsa (>15 menit, atau jam server dimajukan di lingkungan uji) | 401 | _isi_ | ☐ |
| N7 | Penyerang | `POST /api/events` dengan amplop yang `tag`-nya diubah satu byte | Ditolak (400/401), tidak masuk riwayat | _isi_ | ☐ |
| N8 | Penyerang | Kirim ulang amplop valid yang sama (replay, counter lama) | Ditolak, tidak masuk riwayat | _isi_ | ☐ |

Jumlah uji: 8 positif dan 8 negatif (seimbang sesuai ketentuan tugas).

Cara mencatat bukti: jalankan perintah, salin keluaran terminal (kode HTTP) ke kolom "Hasil aktual", dan simpan tangkapan layar di `security/evidence/`.

## 6. Temuan dan tindak lanjut

1. **`GET /api/commands/next` dapat dipanggil siapa saja** (dicatat di `dfd.md`, celah awal nomor 2). Isinya hanya perintah bertanda HMAC sehingga tidak bisa dipalsukan, tetapi pihak lain bisa ikut "mengambil" perintah. Tindak lanjut yang disarankan: tambahkan identitas perangkat dan tanda tangan permintaan (HMAC atas `device` + `timestamp`). Jika belum diperbaiki, tulis di laporan sebagai risiko sisa, dengan alasan.
2. **Tidak ada pembatasan percobaan login** (celah awal nomor 4, ancaman T01). Tambahkan rate limiting dan penguncian sementara, lalu uji dengan 10 login salah beruntun yang diharapkan berujung 429.
3. Peran hanya `admin` dan `robot`. Bila nanti ada peran lain (misalnya `viewer`), tambahkan baris pada matriks dan uji negatif untuk setiap peran baru.

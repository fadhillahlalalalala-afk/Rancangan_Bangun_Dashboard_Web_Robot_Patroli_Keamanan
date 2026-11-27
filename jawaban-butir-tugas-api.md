# Jawaban Butir Tugas — Desain REST API

**Produk:** Rancangan Bangun Dashboard Web Robot Patroli Keamanan (entitas Robot dan LogPatroli)

> Catatan: ID kebutuhan (KF-xx) di bawah adalah contoh. Ganti dengan ID asli dari `docs/kebutuhan.md` dan sesuaikan daftar endpoint dengan rancangan produk Anda.

---

## 1. Tabel endpoint (dasar path: `/api/v1`)

| Metode | Path | Kebutuhan | Kode status yang mungkin |
|---|---|---|---|
| GET | `/robots` | KF-01 (melihat daftar robot) | 200, 400 (query `zona` tidak valid), 500 |
| POST | `/robots` | KF-02 (mendaftarkan robot) | 201 (+ header `Location`), 400 (body bukan JSON), 415 (`Content-Type` bukan JSON), 409 (nama robot sudah terdaftar), 422 (nilai tidak valid, mis. `zona` tidak dikenal), 500 |
| GET | `/robots/{id}` | KF-03 (detail robot beserta log) | 200, 400 (id bukan bilangan bulat positif), 404, 500 |
| PATCH | `/robots/{id}` | KF-04 (mengubah data atau status robot) | 200, 400, 404, 409 (nama bentrok), 422, 500 |
| DELETE | `/robots/{id}` | KF-05 (menghapus robot) | 204, 400, 404, 409 (robot masih punya log patroli), 500 |
| GET | `/robots/{id}/log-patroli` | KF-06 (riwayat patroli) | 200, 400, 404 (robot tidak ada), 500 |
| POST | `/robots/{id}/log-patroli` | KF-07 (mencatat log patroli) | 201, 400, 404 (robot tidak ada), 409 (`kodeLog` ganda pada robot yang sama), 422 (mis. `tingkatRisiko` 6), 500 |

---

## 2. Aman dan idempoten

- **Aman (safe):** permintaan tidak mengubah keadaan data di server. Klien bebas memanggilnya, termasuk oleh crawler atau prefetch.
- **Idempoten:** mengirim permintaan identik satu kali atau berkali-kali menghasilkan keadaan server akhir yang sama. Responsnya boleh berbeda.

| Metode | Aman | Idempoten | Contoh pada produk |
|---|---|---|---|
| GET | Ya | Ya | `GET /robots/3` berapa kali pun tidak mengubah data. |
| POST | Tidak | Tidak | `POST /robots/3/log-patroli` dua kali dengan `kodeLog` berbeda menghasilkan dua log baru. |
| PATCH | Tidak | Tidak dijamin, bergantung isi | `PATCH /robots/3` dengan `{"aktif": false}` idempoten karena nilai akhirnya sama. Perubahan relatif seperti "tambah 1" tidak idempoten. |
| DELETE | Tidak | Ya | `DELETE /robots/3` pertama dibalas 204. Yang kedua dibalas 404, tetapi keadaan akhirnya sama: robot 3 tidak ada. |

---

## 3. Penentuan kode status

| Kasus | Kode | Alasan |
|---|---|---|
| Body bukan JSON | **400 Bad Request** | Permintaan tidak dapat di-*parse* (`request.json()` melempar `SyntaxError`), jadi kesalahannya ada di sintaks. Bila header `Content-Type` yang salah, 415 lebih tepat. |
| JSON valid, kategori tidak dikenal | **422 Unprocessable Content** | Sintaksnya benar dan server memahami isinya, tetapi nilainya melanggar aturan. Contoh: `{"zona": "atap"}` padahal enum hanya `gedung`, `parkir`, `perimeter`. Detail kesalahan per kolom ditaruh di ekstensi `errors`. |
| id yang tidak ada | **404 Not Found** | Format id sudah benar, tetapi sumber daya dengan id itu tidak ada. Bila format id sendiri salah (mis. `abc`), kodenya 400. |
| Menghapus robot yang masih punya log | **409 Conflict** | Permintaan sah, tetapi bentrok dengan keadaan sumber daya. Basis data menolak lewat `ON DELETE RESTRICT` (Prisma `P2003`), dan itu diterjemahkan menjadi 409. Log patroli adalah rekam jejak keamanan, jadi tidak boleh hilang diam-diam; klien harus menghapus log terlebih dahulu secara sadar. Konsisten dengan keputusan `Restrict` pada Dokumen Teknis Modul 6 (Bagian 1.3). |

---

## 4. Contoh Problem Details (RFC 9457) untuk 404

```http
HTTP/1.1 404 Not Found
Content-Type: application/problem+json
Content-Language: id

{
  "type": "https://dashboard-robot.example/problems/robot-tidak-ditemukan",
  "title": "Robot tidak ditemukan",
  "status": 404,
  "detail": "Robot dengan id 9999 tidak terdaftar atau sudah dihapus.",
  "instance": "/api/v1/robots/9999"
}
```

Poin penting:

- Media type-nya `application/problem+json`, bukan `application/json`.
- Anggota standarnya adalah `type`, `title`, `status`, `detail`, dan `instance`.
- Pesan tidak boleh memuat nama tabel, constraint, atau pesan mentah Prisma.

---

## 5. `await params` dan validasinya

### Mengapa `params` harus di-`await`

Sejak Next.js 15, API yang bergantung pada permintaan (`params`, `searchParams`, `cookies()`, `headers()`) bersifat asinkron. `params` berupa `Promise`. Next.js 16 menghapus akses sinkron sepenuhnya, sehingga akses langsung akan gagal. Sifat asinkron ini membuat Next.js dapat memulai rendering bagian yang tidak bergantung pada nilai permintaan lebih awal (prerender dan streaming), lalu baru menunggu nilai `params` saat benar-benar dibutuhkan.

```ts
export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  // ...validasi id sebelum dipakai
}
```

### Mengapa nilainya harus divalidasi

`params.id` selalu berupa string yang berasal dari URL, jadi sepenuhnya dikendalikan pengguna. Untuk `Robot.id` yang bertipe `Int`:

- `abc` menjadi `NaN` saat `Number(id)`, sehingga Prisma melempar `PrismaClientValidationError`. Tanpa penanganan, hasilnya 500 dan pesan galat internal bisa bocor.
- `1.5`, `-1`, `0`, `1e3`, atau string kosong lolos konversi tetapi bukan id yang sah.
- Angka di atas batas Int32 PostgreSQL (2.147.483.647) memicu galat di basis data.

Prisma memakai kueri berparameter sehingga SQL injection tidak terjadi. Namun validasi tetap perlu agar tipe data benar, galat dikembalikan sebagai **400 Problem Details** (bukan 500), dan tidak ada kueri sia-sia ke basis data:

```ts
const parsed = /^[1-9]\d{0,9}$/.test(id) ? Number(id) : NaN;
if (!Number.isInteger(parsed) || parsed > 2147483647) {
  return problem(400, "Id tidak valid", "Id harus bilangan bulat positif.");
}
```

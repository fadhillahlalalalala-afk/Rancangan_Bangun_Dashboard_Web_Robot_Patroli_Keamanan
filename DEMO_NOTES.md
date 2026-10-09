# Catatan latihan demo (±3 menit)

## Alur yang disarankan
1. `npm test` → tunjukkan 18 lulus (±20 detik).
2. `npm run demo` → jelaskan langkah 2 (yang dilihat penyadap), 3 (replay → 409), 4 (diubah → 400) (±1,5 menit).
3. Jawab pertanyaan: kenapa GCM, kenapa IV acak, kenapa scrypt.

## Latihan "ubah satu baris" (hasil sudah dicoba dan terbukti)
| Perubahan | Uji yang gagal | Penjelasan |
|---|---|---|
| `counter <= last` → `counter < last` di `eventCrypto.js` | T8, T15 | Paket dengan counter sama lolos, replay tidak lagi terdeteksi |
| Hapus `cipher.setAAD(...)` saat enkripsi | T5, T8, T14, T15 | Enkripsi dan dekripsi memakai AAD berbeda, tag tidak cocok sehingga paket sah ditolak |
| `crypto.randomBytes(IV_LEN)` → `Buffer.alloc(IV_LEN)` | T18 | IV tetap; pada GCM ini bahaya besar karena IV berulang membocorkan XOR plaintext dan kunci autentikasi |
| `crypto.randomBytes(SALT_LEN)` → `Buffer.alloc(SALT_LEN)` | T3 | Salt sama sehingga password sama menghasilkan hash sama (rentan rainbow table) |

## Pertanyaan yang mungkin muncul
- *Kenapa scrypt dan bukan SHA-256?* SHA-256 cepat sehingga mudah ditebak jutaan kali per detik; scrypt sengaja lambat dan butuh memori.
- *Kenapa base64? Apakah itu aman?* Itu encoding agar byte bisa dikirim sebagai teks; tidak aman sendirian.
- *Apa fungsi tag GCM?* Membuktikan data dan AAD tidak diubah; salah satu berubah, dekripsi gagal.
- *Kenapa counter ada di dalam plaintext?* Agar ikut terlindungi tag; penyerang tidak bisa mengganti counter tanpa menggagalkan tag.
- *Apa kelemahan versi ini?* Lihat "Batasan v0.1" di README (kunci bersama, counter di memori, belum ada autentikasi robot).

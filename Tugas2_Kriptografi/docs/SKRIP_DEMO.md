# Skrip Demonstrasi (±3 menit)

1. **(30 dtk) Tempat kunci:** `ls -l ~/.config/patroli/` → tunjukkan berkas `.key` izin `-rw-------`, lalu `git ls-files | grep -i key` → kosong, dan `.gitignore`. Jangan menampilkan isi kunci.
2. **(30 dtk) Mekanisme:** buka `KEPUTUSAN.md` tabel §1 dan §2 — AES-256-GCM, nonce 96-bit acak, tag 128-bit, AAD `v1|kid|robot|jenis`.
3. **(45 dtk) Alur sah:** `python demo.py` — tunjukkan envelope dan dekripsi sukses.
4. **(60 dtk) Penolakan:** `python -m unittest discover -v` — sorot T1 (data), T2 (tag), T3 (kunci salah), T4 (AAD).
5. **(15 dtk) Gagal tertutup:** tunjukkan `decrypt_record` di `aead.py` — validasi dulu, `InvalidTag` → `DecryptionError` generik.

Siap dijawab: kenapa nonce tidak boleh dipakai ulang? apa fungsi AAD? kenapa bukan HMAC saja? apa yang terjadi bila kunci bocor?

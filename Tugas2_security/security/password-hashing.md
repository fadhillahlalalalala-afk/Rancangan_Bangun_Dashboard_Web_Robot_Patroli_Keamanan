# Bukti Penyimpanan Kata Sandi dengan Hash Lambat (sec-0.2)

Risiko Tugas 1: Risk-01, T01, T08 (A-01, A-02, D1 pada `dfd.md`).

## 1. Mekanisme

| Aspek | Nilai |
|---|---|
| Fungsi hash | scrypt (fungsi hash lambat dan memory-hard, setara tujuan Argon2id/bcrypt) |
| Salt | Acak 16 byte per kata sandi (CSPRNG) |
| Lokasi | D1 (memori server), dibuat saat server start dari `SECUREBOT_ADMIN_PASSWORD` |
| Kata sandi asli | Tidak disimpan di repository dan tidak dicetak ke log |

> Catatan konsistensi: `rencana_control_risk.md` menyebut Argon2id atau bcrypt. Kode SecureBot memakai scrypt. Ketiganya memenuhi kriteria "hash lambat". Pilih satu dan tulis konsisten di laporan. Bila ingin tetap scrypt, ubah kalimat di rencana menjadi "scrypt (atau Argon2id/bcrypt)".

## 2. Cara membuktikan tanpa membuka data pengguna nyata

Gunakan kata sandi uji, bukan kata sandi asli.

**a. Tunjukkan kodenya** (salin potongan hash dari `src/app.js` atau modul auth ke bagian ini):

```bash
grep -rn "scrypt" src/
grep -rn "randomBytes(16)" src/
```

**b. Tunjukkan bahwa dua hash dari kata sandi yang sama berbeda (salt unik) dan lambat:**

```bash
node -e '
const c = require("crypto");
function h(p){ const s=c.randomBytes(16); const t=Date.now();
  const k=c.scryptSync(p,s,64); return {salt:s.toString("hex"),hash:k.toString("hex"),ms:Date.now()-t}; }
console.log(h("kata-sandi-uji-123"));
console.log(h("kata-sandi-uji-123"));
'
```

Hasil yang diharapkan: salt dan hash berbeda pada dua keluaran, dan waktu per hash puluhan milidetik (bukan mikrodetik seperti MD5/SHA-256 polos).

**c. Tunjukkan bahwa tidak ada kata sandi polos di repository:**

```bash
git grep -n -i "password" -- ':!*.md' | grep -v process.env
gitleaks detect --no-banner
```

## 3. Hasil

| Pemeriksaan | Bukti | Status |
|---|---|---|
| Fungsi hash lambat dipakai | Keluaran `grep` kode | ☐ |
| Salt unik per hash | Dua keluaran berbeda (b) | ☐ |
| Waktu hash terukur lambat | Nilai `ms` | ☐ |
| Tidak ada kata sandi polos di repo | Keluaran (c) | ☐ |

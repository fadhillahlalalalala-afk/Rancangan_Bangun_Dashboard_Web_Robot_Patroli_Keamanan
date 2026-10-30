# Petunjuk Memasang File Modul 5

Berkas ini disusun untuk repositori hasil Modul 4 (Next.js 16, React 19, Tailwind).
Salin struktur folder ke akar proyekmu.

## Urutan
```bash
git switch main && git pull
git switch -c praktikum/modul-05
npm install zod server-only
npm ls zod next react        # zod harus 4.x
```

## Berkas BARU (salin langsung)
- lib/skema.ts
- lib/status-form.ts
- lib/sesi.ts
- app/katalog/actions.ts
- app/katalog/tambah/page.tsx
- app/masuk/actions.ts
- app/masuk/page.tsx
- components/FormItem.tsx
- components/FormMasuk.tsx
- proxy.ts            (sejajar dengan folder app)
- .env.example
- docs/praktikum/modul-05.md

## Berkas yang HARUS DIGABUNG dengan milikmu (jangan ditimpa buta)
- lib/tipe.ts  : pastikan union Kategori = "gedung" | "parkir" | "perimeter"
                 (atau ubah z.enum di lib/skema.ts agar SAMA PERSIS).
- lib/data.ts  : tambahkan `import type { MasukanItem } from "./skema"`
                 serta fungsi judulSudahAda() dan tambahItem() di bagian bawah.
                 Data contoh di file ini hanya referensi.

## Perubahan kecil manual
1. app/katalog/page.tsx : tambahkan tautan ke halaman tambah
   ```tsx
   import Link from "next/link";
   // ...
   <Link href="/katalog/tambah" className="underline">Tambah item</Link>
   ```
2. .gitignore : tambahkan baris `!.env.example` di bawah pola `.env*`
3. Buat .env.local (lihat .env.local.CONTOH-JANGAN-COMMIT), lalu restart `npm run dev`.

## Cek sebelum commit
```bash
npx tsc --noEmit
npm run lint
```

## Catatan
- Kalau kategori/kolom produkmu berbeda, ubah di: lib/tipe.ts, lib/skema.ts,
  components/FormItem.tsx (opsi <select>), dan docs/praktikum/modul-05.md.
- Jangan commit .env.local atau nilai cookie asli.
- Berkas dokumen teknis: isi bagian [ISI] sendiri setelah menjalankan pengujian.

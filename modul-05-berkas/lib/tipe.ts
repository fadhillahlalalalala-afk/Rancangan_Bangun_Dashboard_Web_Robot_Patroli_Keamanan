// Referensi: samakan dengan lib/tipe.ts dari Modul 3/4 milikmu.
// Pilihan z.enum di lib/skema.ts HARUS sama dengan union Kategori ini.
export type Kategori = "gedung" | "parkir" | "perimeter";

export type Item = {
  id: number;
  judul: string; // nama titik patroli
  kategori: Kategori; // jenis area
  deskripsi: string; // catatan area yang diawasi
  tersedia: boolean; // titik aktif dan boleh dikunjungi robot
};

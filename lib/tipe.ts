export type Kategori = "indoor" | "outdoor" | "perimeter";

export interface Item {
  id: number;
  judul: string; // nama unit robot
  kategori: Kategori;
  deskripsi: string;
  tersedia: boolean; // true = siap bertugas
}

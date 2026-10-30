// Referensi: gabungkan dengan lib/data.ts dari Modul 3/4 milikmu.
// Bagian yang WAJIB ada untuk Modul 5: import MasukanItem, judulSudahAda, tambahItem.
import type { Item } from "./tipe";
import type { MasukanItem } from "./skema";

export const daftarItem: Item[] = [
  {
    id: 1,
    judul: "Gerbang Utara",
    kategori: "perimeter",
    deskripsi: "Pintu masuk utama kendaraan dan pejalan kaki sisi utara.",
    tersedia: true,
  },
  {
    id: 2,
    judul: "Lobi Gedung A",
    kategori: "gedung",
    deskripsi: "Area resepsionis dan akses lift lantai dasar Gedung A.",
    tersedia: true,
  },
  {
    id: 3,
    judul: "Parkir Basement",
    kategori: "parkir",
    deskripsi: "Area parkir bawah tanah, rawan pencahayaan rendah.",
    tersedia: false,
  },
];

export function cariItem(id: number): Item | undefined {
  return daftarItem.find((i) => i.id === id);
}

export function judulSudahAda(judul: string) {
  const dicari = judul.toLowerCase();
  return daftarItem.some((i) => i.judul.toLowerCase() === dicari);
}

export function tambahItem(masukan: MasukanItem): Item {
  const id = Math.max(0, ...daftarItem.map((i) => i.id)) + 1;
  const item: Item = { id, ...masukan };
  daftarItem.push(item);
  return item;
}

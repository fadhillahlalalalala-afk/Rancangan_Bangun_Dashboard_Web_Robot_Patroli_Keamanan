import "server-only";
import type { Item } from "./tipe";

export const daftarItem: Item[] = [
  { id: 1, judul: "PatroliBot A1", kategori: "indoor",
    deskripsi: "Menyusuri koridor gedung pada malam hari dan memeriksa pintu yang tidak terkunci.",
    tersedia: true },
  { id: 2, judul: "PatroliBot A2", kategori: "indoor",
    deskripsi: "Memantau ruang server dengan sensor suhu dan gerak, lalu mengirim peringatan ke petugas.",
    tersedia: true },
  { id: 3, judul: "RoverGuard B1", kategori: "outdoor",
    deskripsi: "Berpatroli di area parkir dengan kamera termal dan membaca plat nomor kendaraan.",
    tersedia: true },
  { id: 4, judul: "RoverGuard B2", kategori: "outdoor",
    deskripsi: "Robot roda enam untuk medan berbatu; sedang menjalani perawatan baterai.",
    tersedia: false },
  { id: 5, judul: "PagarSiaga C1", kategori: "perimeter",
    deskripsi: "Menelusuri sisi dalam pagar dan mendeteksi orang yang mendekat setelah jam operasional.",
    tersedia: true },
  { id: 6, judul: "PagarSiaga C2", kategori: "perimeter",
    deskripsi: "Cadangan untuk gerbang utara; menunggu pembaruan firmware navigasi.",
    tersedia: false },
];

export function cariItem(id: number): Item | undefined {
  return daftarItem.find((item) => item.id === id);
}

import Link from "next/link";
import type { Item, Kategori } from "@/lib/tipe";

const labelKategori: Record<Kategori, string> = {
  indoor: "Patroli dalam ruangan",
  outdoor: "Patroli luar ruangan",
  perimeter: "Patroli pagar dan gerbang",
};

export default function KartuItem({ item }: { item: Item }) {
  return (
    <article className="rounded border p-4">
      <p className="text-sm text-gray-600">{labelKategori[item.kategori]}</p>
      <h3 className="mt-1 text-lg font-semibold">
        <Link href={`/katalog/${item.id}`} className="hover:underline">
          {item.judul}
        </Link>
      </h3>
      <p className="mt-2 text-sm text-gray-700">{item.deskripsi}</p>
      <p className="mt-2 text-sm font-medium">
        {item.tersedia ? "Siap bertugas" : "Sedang perawatan"}
      </p>
    </article>
  );
}

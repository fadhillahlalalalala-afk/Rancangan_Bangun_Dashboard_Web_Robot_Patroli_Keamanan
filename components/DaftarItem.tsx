"use client";

import { useId, useState } from "react";
import KartuItem from "@/components/KartuItem";
import type { Item, Kategori } from "@/lib/tipe";

const opsi: { nilai: Kategori | "semua"; label: string }[] = [
  { nilai: "semua", label: "Semua robot" },
  { nilai: "indoor", label: "Dalam ruangan" },
  { nilai: "outdoor", label: "Luar ruangan" },
  { nilai: "perimeter", label: "Pagar dan gerbang" },
];

export default function DaftarItem({ items }: { items: Item[] }) {
  const id = useId();
  const [filter, setFilter] = useState<Kategori | "semua">("semua");
  const tampil = filter === "semua" ? items : items.filter((i) => i.kategori === filter);

  return (
    <section aria-labelledby={`${id}-judul`}>
      <h2 id={`${id}-judul`} className="sr-only">Daftar robot patroli</h2>
      <label htmlFor={id} className="text-sm font-medium">Tampilkan</label>
      <select id={id} value={filter}
        onChange={(e) => setFilter(e.target.value as Kategori | "semua")}
        className="ml-2 rounded border px-2 py-1">
        {opsi.map((o) => <option key={o.nilai} value={o.nilai}>{o.label}</option>)}
      </select>
      {tampil.length === 0 ? (
        <p className="mt-4">Belum ada robot pada kategori ini.</p>
      ) : (
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {tampil.map((item) => <KartuItem key={item.id} item={item} />)}
        </div>
      )}
    </section>
  );
}

import type { Metadata } from "next";
import DaftarItem from "@/components/DaftarItem";
import { daftarItem } from "@/lib/data";

export const metadata: Metadata = { title: "Katalog robot" };

export default function HalamanKatalog() {
  return (
    <main id="konten">
      <h1 className="mb-4 text-3xl font-bold">Katalog robot patroli</h1>
      <DaftarItem items={daftarItem} />
    </main>
  );
}

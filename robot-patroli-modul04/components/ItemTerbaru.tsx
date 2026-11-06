// Server Component: tanpa "use client", tanpa useState dan useEffect
import Link from "next/link";
import { daftarItem } from "@/lib/data";

export default function ItemTerbaru() {
  const terbaru = daftarItem.slice(0, 3);
  return (
    <ul className="grid gap-4 sm:grid-cols-3">
      {terbaru.map((item) => (
        <li key={item.id} className="rounded border p-4">
          <Link href={`/katalog/${item.id}`}>{item.judul}</Link>
        </li>
      ))}
    </ul>
  );
}

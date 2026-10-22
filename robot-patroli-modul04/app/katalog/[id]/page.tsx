import Link from "next/link";
import { notFound } from "next/navigation";
import { cariItem, daftarItem } from "@/lib/data";

// id yang dirender saat build; nilai params selalu string
export function generateStaticParams() {
  return daftarItem.map((item) => ({ id: String(item.id) }));
}

export default async function HalamanDetailItem({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params; // /katalog/3 -> id = "3"
  if (!/^[1-9]\d*$/.test(id)) notFound(); // tolak "abc", "0", "03"
  const item = cariItem(Number(id));
  if (!item) notFound(); // tipe never: item pasti ada
  return (
    <main id="konten">
      <p className="text-sm text-gray-600">{item.kategori}</p>
      <h1 className="text-3xl font-bold">{item.judul}</h1>
      <p className="mt-4 text-gray-700">{item.deskripsi}</p>
      <p className="mt-2">
        {item.tersedia ? "Siap bertugas" : "Sedang perawatan"}
      </p>
      <Link href="/katalog" className="mt-6 inline-block underline">
        Kembali ke katalog
      </Link>
    </main>
  );
}

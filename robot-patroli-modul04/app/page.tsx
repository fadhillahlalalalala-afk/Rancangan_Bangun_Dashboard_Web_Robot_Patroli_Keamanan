import Link from "next/link";
import ItemTerbaru from "@/components/ItemTerbaru";

export default function Beranda() {
  return (
    <main id="konten" className="mx-auto max-w-6xl p-4">
      <h1 className="text-3xl font-bold">Pantau robot patroli dari satu halaman</h1>
      <p className="mt-3 max-w-prose text-gray-700">
        Lihat robot mana yang sedang siap bertugas, di area mana ia berpatroli,
        dan kapan ia perlu perawatan.
      </p>
      <h2 className="mt-8 text-xl font-semibold">Robot terbaru</h2>
      <div className="mt-3"><ItemTerbaru /></div>
      <Link href="/katalog" className="mt-6 inline-block underline">
        Lihat semua robot
      </Link>
    </main>
  );
}

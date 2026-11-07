import type { Metadata } from "next";
import { redirect } from "next/navigation";
import FormItem from "@/components/FormItem";
import { bacaSesi } from "@/lib/sesi";
import { keluar } from "@/app/masuk/actions";

export const metadata: Metadata = {
  title: "Tambah Titik Patroli | Web Robot Patroli Keamanan",
};

export default async function HalamanTambahItem() {
  const sesi = await bacaSesi();
  if (!sesi) redirect("/masuk");

  return (
    <main id="konten" className="mx-auto max-w-2xl p-4">
      <h1 className="text-3xl font-bold">Tambah Titik Patroli</h1>
      <p className="mt-2 text-sm text-gray-600">Masuk sebagai {sesi.email}</p>
      <form action={keluar}>
        <button type="submit" className="text-sm underline">
          Keluar
        </button>
      </form>
      <FormItem />
    </main>
  );
}

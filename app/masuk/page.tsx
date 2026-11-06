import type { Metadata } from "next";
import FormMasuk from "@/components/FormMasuk";

export const metadata: Metadata = {
  title: "Masuk | Web Robot Patroli Keamanan",
};

export default function HalamanMasuk() {
  return (
    <main id="konten" className="mx-auto max-w-md p-4">
      <h1 className="text-3xl font-bold">Masuk</h1>
      <FormMasuk />
    </main>
  );
}

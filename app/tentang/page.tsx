import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tentang" };

export default function HalamanTentang() {
  return (
    <main id="konten" className="mx-auto max-w-3xl p-4">
      <h1 className="text-3xl font-bold">Tentang Web Robot Patroli Keamanan</h1>
      <p className="mt-4 text-gray-700">
        Petugas keamanan sering kesulitan memantau banyak area sekaligus,
        terutama pada malam hari. Web ini membantu petugas melihat status
        setiap robot patroli, area tugasnya, dan kesiapannya. Fitur utama:
        katalog robot, halaman detail per unit, dan penanda robot yang
        sedang perawatan.
      </p>
    </main>
  );
}

import { connection } from "next/server";

export default async function HalamanLambat() {
  await connection(); // render menunggu permintaan nyata, tidak diprerender
  await new Promise((selesai) => setTimeout(selesai, 2000));
  return (
    <main id="konten" className="p-4">
      <h1 className="text-2xl font-bold">Data uji selesai dimuat</h1>
    </main>
  );
}

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updatePatroli } from "@/lib/actions";
import { keInputWaktu } from "@/lib/format";
import { PatroliForm } from "@/components/PatroliForm";

export const dynamic = "force-dynamic";

export default async function UbahPatroli({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [p, robots] = await Promise.all([
    prisma.patroli.findUnique({ where: { id } }),
    prisma.robot.findMany({ orderBy: { kode: "asc" }, select: { id: true, kode: true, nama: true } }),
  ]);
  if (!p) notFound();

  return (
    <>
      <div className="page-head"><h1>Ubah patroli</h1></div>
      <PatroliForm
        action={updatePatroli.bind(null, id)}
        robots={robots}
        tombol="Simpan perubahan"
        awal={{
          judul: p.judul, area: p.area, rute: p.rute,
          jadwalMulai: keInputWaktu(p.jadwalMulai), durasiMenit: String(p.durasiMenit),
          status: p.status, catatan: p.catatan ?? "", robotId: String(p.robotId),
        }}
      />
    </>
  );
}

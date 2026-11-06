import { prisma } from "@/lib/prisma";
import { createPatroli } from "@/lib/actions";
import { PatroliForm } from "@/components/PatroliForm";

export const dynamic = "force-dynamic";

export default async function JadwalkanPatroli() {
  const robots = await prisma.robot.findMany({ orderBy: { kode: "asc" }, select: { id: true, kode: true, nama: true } });
  return (
    <>
      <div className="page-head"><h1>Jadwalkan patroli</h1></div>
      <PatroliForm action={createPatroli} robots={robots} tombol="Simpan patroli" />
    </>
  );
}

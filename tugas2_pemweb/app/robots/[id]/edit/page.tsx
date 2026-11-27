import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateRobot } from "@/lib/actions";
import { RobotForm } from "@/components/RobotForm";

export const dynamic = "force-dynamic";

export default async function UbahRobot({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const robot = await prisma.robot.findUnique({ where: { id } });
  if (!robot) notFound();

  return (
    <>
      <div className="page-head"><h1>Ubah robot {robot.kode}</h1></div>
      <RobotForm
        action={updateRobot.bind(null, id)}
        tombol="Simpan perubahan"
        awal={{
          kode: robot.kode, nama: robot.nama, model: robot.model,
          status: robot.status, baterai: String(robot.baterai), lokasi: robot.lokasi,
        }}
      />
    </>
  );
}

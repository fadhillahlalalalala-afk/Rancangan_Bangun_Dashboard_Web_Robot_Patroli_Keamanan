import { RobotForm } from "@/components/RobotForm";
import { createRobot } from "@/lib/actions";

export default function TambahRobot() {
  return (
    <>
      <div className="page-head"><h1>Tambah robot</h1></div>
      <RobotForm action={createRobot} tombol="Simpan robot" />
    </>
  );
}

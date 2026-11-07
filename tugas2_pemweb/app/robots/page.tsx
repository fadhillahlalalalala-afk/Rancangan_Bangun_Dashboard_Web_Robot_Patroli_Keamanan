import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deleteRobot } from "@/lib/actions";
import { StatusBadge } from "@/components/StatusBadge";
import { BatteryMeter } from "@/components/BatteryMeter";
import { DeleteButton } from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function DaftarRobot() {
  const robots = await prisma.robot.findMany({
    orderBy: { kode: "asc" },
    include: { _count: { select: { patroli: true } } },
  });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Robot patroli</h1>
          <p>Kelola armada robot dan pantau kondisinya.</p>
        </div>
        <Link className="btn" href="/robots/new">Tambah robot</Link>
      </div>
      <div className="panel">
        {robots.length === 0 ? (
          <p className="empty">Belum ada robot. Tambahkan robot pertama Anda.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <caption className="muted" style={{ textAlign: "left", paddingBottom: ".5rem" }}>Daftar robot patroli</caption>
              <thead>
                <tr><th>Kode</th><th>Nama</th><th>Model</th><th>Status</th><th>Baterai</th><th>Lokasi</th><th>Patroli</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {robots.map((r) => (
                  <tr key={r.id}>
                    <td>{r.kode}</td><td>{r.nama}</td><td>{r.model}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td><BatteryMeter value={r.baterai} /></td>
                    <td>{r.lokasi}</td>
                    <td>{r._count.patroli}</td>
                    <td>
                      <div className="actions">
                        <Link className="btn ghost sm" href={`/robots/${r.id}/edit`}>Ubah</Link>
                        <DeleteButton
                          action={deleteRobot.bind(null, r.id)}
                          pesan={`Hapus robot ${r.kode}? ${r._count.patroli} patroli terkait juga akan terhapus.`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { deletePatroli } from "@/lib/actions";
import { formatTanggal } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { DeleteButton } from "@/components/DeleteButton";

export const dynamic = "force-dynamic";

export default async function DaftarPatroli() {
  const patroli = await prisma.patroli.findMany({
    orderBy: { jadwalMulai: "desc" },
    include: { robot: true },
  });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Jadwal patroli</h1>
          <p>Atur rute, waktu, dan robot yang bertugas.</p>
        </div>
        <Link className="btn" href="/patroli/new">Jadwalkan patroli</Link>
      </div>
      <div className="panel">
        {patroli.length === 0 ? (
          <p className="empty">Belum ada patroli. Jadwalkan patroli pertama Anda.</p>
        ) : (
          <div className="table-wrap">
            <table>
              <caption className="muted" style={{ textAlign: "left", paddingBottom: ".5rem" }}>Daftar jadwal patroli</caption>
              <thead>
                <tr><th>Judul</th><th>Robot</th><th>Area</th><th>Jadwal</th><th>Durasi</th><th>Status</th><th>Aksi</th></tr>
              </thead>
              <tbody>
                {patroli.map((p) => (
                  <tr key={p.id}>
                    <td>
                      {p.judul}
                      <div className="muted" style={{ fontSize: ".85rem" }}>{p.rute}</div>
                    </td>
                    <td>{p.robot.kode}</td>
                    <td>{p.area}</td>
                    <td>{formatTanggal(p.jadwalMulai)}</td>
                    <td>{p.durasiMenit} menit</td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>
                      <div className="actions">
                        <Link className="btn ghost sm" href={`/patroli/${p.id}/edit`}>Ubah</Link>
                        <DeleteButton action={deletePatroli.bind(null, p.id)} pesan={`Hapus patroli "${p.judul}"?`} />
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

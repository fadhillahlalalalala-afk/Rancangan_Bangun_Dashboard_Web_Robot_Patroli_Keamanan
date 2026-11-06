import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatTanggal } from "@/lib/format";
import { StatusBadge } from "@/components/StatusBadge";
import { BatteryMeter } from "@/components/BatteryMeter";

export const dynamic = "force-dynamic";

export default async function Ringkasan() {
  const [robots, patroli] = await Promise.all([
    prisma.robot.findMany({ orderBy: { kode: "asc" } }),
    prisma.patroli.findMany({ include: { robot: true }, orderBy: { jadwalMulai: "desc" }, take: 5 }),
  ]);
  const jumlah = (s: string) => robots.filter((r) => r.status === s).length;
  const baterai = robots.filter((r) => r.baterai < 30 && r.status !== "OFFLINE").length;
  const berjalan = await prisma.patroli.count({ where: { status: "BERJALAN" } });

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Ringkasan operasi</h1>
          <p>Kondisi armada robot dan patroli terbaru.</p>
        </div>
        <Link className="btn" href="/patroli/new">Jadwalkan patroli</Link>
      </div>

      <dl className="stats">
        <div className="stat"><dt>Total robot</dt><dd>{robots.length}</dd></div>
        <div className="stat"><dt>Sedang patroli</dt><dd>{jumlah("PATROLI")}</dd></div>
        <div className="stat"><dt>Patroli berjalan</dt><dd>{berjalan}</dd></div>
        <div className="stat warn"><dt>Baterai di bawah 30%</dt><dd>{baterai}</dd></div>
        <div className="stat alert"><dt>Robot offline</dt><dd>{jumlah("OFFLINE")}</dd></div>
      </dl>

      <section className="panel" aria-labelledby="h-robot">
        <h2 id="h-robot">Status robot</h2>
        {robots.length === 0 ? (
          <p className="empty">Belum ada robot. <Link href="/robots/new">Tambah robot</Link></p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Kode</th><th>Nama</th><th>Status</th><th>Baterai</th><th>Lokasi</th></tr></thead>
              <tbody>
                {robots.map((r) => (
                  <tr key={r.id}>
                    <td>{r.kode}</td><td>{r.nama}</td>
                    <td><StatusBadge status={r.status} /></td>
                    <td><BatteryMeter value={r.baterai} /></td>
                    <td>{r.lokasi}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="panel" aria-labelledby="h-patroli">
        <h2 id="h-patroli">Patroli terbaru</h2>
        {patroli.length === 0 ? (
          <p className="empty">Belum ada patroli. <Link href="/patroli/new">Jadwalkan patroli</Link></p>
        ) : (
          <div className="table-wrap">
            <table>
              <thead><tr><th>Judul</th><th>Robot</th><th>Jadwal</th><th>Status</th></tr></thead>
              <tbody>
                {patroli.map((p) => (
                  <tr key={p.id}>
                    <td>{p.judul}</td><td>{p.robot.kode}</td>
                    <td>{formatTanggal(p.jadwalMulai)}</td>
                    <td><StatusBadge status={p.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}

import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

// Semua data di bawah ini sintetis (bukan data nyata).
async function main() {
  await prisma.patroli.deleteMany();
  await prisma.robot.deleteMany();

  const robots = await Promise.all([
    prisma.robot.create({ data: { kode: "PTR-001", nama: "Sentinel Alpha", model: "SecuBot X1", status: "PATROLI", baterai: 78, lokasi: "Lobi Gedung A" } }),
    prisma.robot.create({ data: { kode: "PTR-002", nama: "Sentinel Beta", model: "SecuBot X1", status: "AKTIF", baterai: 95, lokasi: "Pos Jaga Utara" } }),
    prisma.robot.create({ data: { kode: "PTR-003", nama: "Rover Gamma", model: "TerraGuard R2", status: "CHARGING", baterai: 34, lokasi: "Stasiun Pengisian 1" } }),
    prisma.robot.create({ data: { kode: "PTR-004", nama: "Rover Delta", model: "TerraGuard R2", status: "OFFLINE", baterai: 0, lokasi: "Gudang Perawatan" } }),
  ]);

  const jam = (offset: number) => new Date(Date.now() + offset * 3600_000);

  await prisma.patroli.createMany({
    data: [
      { judul: "Patroli lobi dan lift", area: "Gedung A Lantai 1", rute: "Lobi -> Lift barat -> Lift timur -> Lobi", jadwalMulai: jam(-1), durasiMenit: 45, status: "BERJALAN", robotId: robots[0].id },
      { judul: "Patroli parkiran malam", area: "Parkiran Basement", rute: "Pintu masuk -> Blok B1 -> Blok B2 -> Pintu keluar", jadwalMulai: jam(5), durasiMenit: 90, status: "TERJADWAL", robotId: robots[0].id },
      { judul: "Cek pagar perimeter utara", area: "Perimeter Utara", rute: "Gerbang 1 -> Sisi pagar utara -> Gerbang 2", jadwalMulai: jam(2), durasiMenit: 60, status: "TERJADWAL", catatan: "Periksa lampu sensor gerak.", robotId: robots[1].id },
      { judul: "Patroli koridor server", area: "Gedung B Lantai 2", rute: "Tangga -> Koridor server -> Ruang NOC", jadwalMulai: jam(-20), durasiMenit: 30, status: "SELESAI", robotId: robots[1].id },
      { judul: "Patroli gudang logistik", area: "Gudang Logistik", rute: "Pintu A -> Rak 1-6 -> Pintu B", jadwalMulai: jam(-30), durasiMenit: 50, status: "DIBATALKAN", catatan: "Dibatalkan karena baterai rendah.", robotId: robots[2].id },
    ],
  });

  console.log("Seed selesai: 4 robot, 5 patroli.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

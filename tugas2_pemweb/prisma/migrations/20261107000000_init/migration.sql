-- CreateEnum
CREATE TYPE "StatusRobot" AS ENUM ('AKTIF', 'PATROLI', 'CHARGING', 'OFFLINE');

-- CreateEnum
CREATE TYPE "StatusPatroli" AS ENUM ('TERJADWAL', 'BERJALAN', 'SELESAI', 'DIBATALKAN');

-- CreateTable
CREATE TABLE "Robot" (
    "id" SERIAL NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "status" "StatusRobot" NOT NULL DEFAULT 'AKTIF',
    "baterai" INTEGER NOT NULL DEFAULT 100,
    "lokasi" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Robot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Patroli" (
    "id" SERIAL NOT NULL,
    "judul" TEXT NOT NULL,
    "area" TEXT NOT NULL,
    "rute" TEXT NOT NULL,
    "jadwalMulai" TIMESTAMP(3) NOT NULL,
    "durasiMenit" INTEGER NOT NULL,
    "status" "StatusPatroli" NOT NULL DEFAULT 'TERJADWAL',
    "catatan" TEXT,
    "robotId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patroli_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Robot_kode_key" ON "Robot"("kode");

-- CreateIndex
CREATE INDEX "Patroli_robotId_idx" ON "Patroli"("robotId");

-- AddForeignKey
ALTER TABLE "Patroli" ADD CONSTRAINT "Patroli_robotId_fkey" FOREIGN KEY ("robotId") REFERENCES "Robot"("id") ON DELETE CASCADE ON UPDATE CASCADE;

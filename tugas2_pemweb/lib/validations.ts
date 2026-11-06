import { z } from "zod";
import { STATUS_PATROLI, STATUS_ROBOT } from "./constants";
import { dariInputWaktu } from "./format";

const angka = (label: string, min: number, max: number) =>
  z
    .string()
    .trim()
    .min(1, `${label} wajib diisi`)
    .pipe(
      z.coerce
        .number({ invalid_type_error: `${label} harus berupa angka` })
        .int(`${label} harus bilangan bulat`)
        .min(min, `${label} minimal ${min}`)
        .max(max, `${label} maksimal ${max}`),
    );

export const robotSchema = z.object({
  kode: z
    .string()
    .trim()
    .toUpperCase()
    .regex(/^[A-Z]{3}-\d{3}$/, "Kode harus berformat AAA-123, contoh PTR-001"),
  nama: z.string().trim().min(3, "Nama minimal 3 karakter").max(60, "Nama maksimal 60 karakter"),
  model: z.string().trim().min(2, "Model minimal 2 karakter").max(60, "Model maksimal 60 karakter"),
  status: z.enum(STATUS_ROBOT, { errorMap: () => ({ message: "Pilih status robot yang valid" }) }),
  baterai: angka("Baterai", 0, 100),
  lokasi: z.string().trim().min(3, "Lokasi minimal 3 karakter").max(100, "Lokasi maksimal 100 karakter"),
});

export const patroliSchema = z.object({
  judul: z.string().trim().min(5, "Judul minimal 5 karakter").max(100, "Judul maksimal 100 karakter"),
  area: z.string().trim().min(3, "Area minimal 3 karakter").max(100, "Area maksimal 100 karakter"),
  rute: z.string().trim().min(10, "Rute minimal 10 karakter").max(500, "Rute maksimal 500 karakter"),
  jadwalMulai: z
    .string()
    .min(1, "Jadwal mulai wajib diisi")
    .refine((v) => !Number.isNaN(dariInputWaktu(v).getTime()), "Format jadwal tidak valid")
    .transform(dariInputWaktu),
  durasiMenit: angka("Durasi", 5, 480),
  status: z.enum(STATUS_PATROLI, { errorMap: () => ({ message: "Pilih status patroli yang valid" }) }),
  catatan: z
    .string()
    .trim()
    .max(300, "Catatan maksimal 300 karakter")
    .transform((v) => (v === "" ? null : v)),
  robotId: z
    .string()
    .min(1, "Pilih robot yang bertugas")
    .pipe(z.coerce.number({ invalid_type_error: "Robot tidak valid" }).int("Robot tidak valid")),
});

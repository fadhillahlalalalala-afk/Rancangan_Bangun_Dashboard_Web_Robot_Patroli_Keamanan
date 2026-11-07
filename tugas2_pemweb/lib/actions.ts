"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./prisma";
import { patroliSchema, robotSchema } from "./validations";

export type FormState = {
  errors?: Record<string, string[] | undefined>;
  message?: string;
  values?: Record<string, string>;
};

const PESAN_FORM = "Periksa kembali isian formulir.";

function ambilNilai(fd: FormData) {
  const out: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (typeof v === "string") out[k] = v;
  return out;
}

function galatDb(e: unknown, values: Record<string, string>): FormState {
  if (typeof e === "object" && e && "code" in e && (e as { code: string }).code === "P2002") {
    return { errors: { kode: ["Kode robot sudah digunakan"] }, message: PESAN_FORM, values };
  }
  console.error(e);
  return { message: "Terjadi kesalahan pada database. Coba lagi.", values };
}

/* ---------- Robot ---------- */

export async function createRobot(_: FormState, fd: FormData): Promise<FormState> {
  const values = ambilNilai(fd);
  const parsed = robotSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: PESAN_FORM, values };
  }
  try {
    await prisma.robot.create({ data: parsed.data });
  } catch (e) {
    return galatDb(e, values);
  }
  revalidatePath("/", "layout");
  redirect("/robots");
}

export async function updateRobot(id: number, _: FormState, fd: FormData): Promise<FormState> {
  const values = ambilNilai(fd);
  const parsed = robotSchema.safeParse(values);
  if (!parsed.success) {
    return { errors: parsed.error.flatten().fieldErrors, message: PESAN_FORM, values };
  }
  try {
    await prisma.robot.update({ where: { id }, data: parsed.data });
  } catch (e) {
    return galatDb(e, values);
  }
  revalidatePath("/", "layout");
  redirect("/robots");
}

export async function deleteRobot(id: number) {
  await prisma.robot.delete({ where: { id } }).catch(() => null);
  revalidatePath("/", "layout");
  redirect("/robots");
}

/* ---------- Patroli ---------- */

async function validasiPatroli(values: Record<string, string>) {
  const parsed = patroliSchema.safeParse(values);
  if (!parsed.success) {
    const state: FormState = { errors: parsed.error.flatten().fieldErrors, message: PESAN_FORM, values };
    return { state };
  }
  const robot = await prisma.robot.findUnique({ where: { id: parsed.data.robotId } });
  if (!robot) {
    const state: FormState = { errors: { robotId: ["Robot tidak ditemukan"] }, message: PESAN_FORM, values };
    return { state };
  }
  return { data: parsed.data };
}

export async function createPatroli(_: FormState, fd: FormData): Promise<FormState> {
  const values = ambilNilai(fd);
  const r = await validasiPatroli(values);
  if (!r.data) return r.state!;
  try {
    await prisma.patroli.create({ data: r.data });
  } catch (e) {
    return galatDb(e, values);
  }
  revalidatePath("/", "layout");
  redirect("/patroli");
}

export async function updatePatroli(id: number, _: FormState, fd: FormData): Promise<FormState> {
  const values = ambilNilai(fd);
  const r = await validasiPatroli(values);
  if (!r.data) return r.state!;
  try {
    await prisma.patroli.update({ where: { id }, data: r.data });
  } catch (e) {
    return galatDb(e, values);
  }
  revalidatePath("/", "layout");
  redirect("/patroli");
}

export async function deletePatroli(id: number) {
  await prisma.patroli.delete({ where: { id } }).catch(() => null);
  revalidatePath("/", "layout");
  redirect("/patroli");
}

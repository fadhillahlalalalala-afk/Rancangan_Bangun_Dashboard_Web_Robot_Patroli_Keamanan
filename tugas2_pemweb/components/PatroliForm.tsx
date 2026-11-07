"use client";

import Link from "next/link";
import { useActionState } from "react";
import { aria, Field } from "./Field";
import type { FormState } from "@/lib/actions";
import { LABEL_STATUS, STATUS_PATROLI } from "@/lib/constants";

type Nilai = {
  judul: string; area: string; rute: string; jadwalMulai: string;
  durasiMenit: string; status: string; catatan: string; robotId: string;
};

export const PATROLI_KOSONG: Nilai = {
  judul: "", area: "", rute: "", jadwalMulai: "", durasiMenit: "60",
  status: "TERJADWAL", catatan: "", robotId: "",
};

export function PatroliForm({
  action,
  robots,
  awal = PATROLI_KOSONG,
  tombol,
}: {
  action: (s: FormState, fd: FormData) => Promise<FormState>;
  robots: { id: number; kode: string; nama: string }[];
  awal?: Nilai;
  tombol: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  const v = { ...awal, ...(state.values ?? {}) };
  const e = state.errors ?? {};

  return (
    <form action={formAction} className="form" noValidate>
      {state.message && <div className="form-error" role="alert">{state.message}</div>}
      <Field id="judul" label="Judul patroli" error={e.judul}>
        <input id="judul" name="judul" defaultValue={v.judul} {...aria("judul", e.judul)} />
      </Field>
      <Field id="robotId" label="Robot bertugas" error={e.robotId}>
        <select id="robotId" name="robotId" defaultValue={v.robotId} {...aria("robotId", e.robotId)}>
          <option value="">Pilih robot</option>
          {robots.map((r) => <option key={r.id} value={r.id}>{r.kode} - {r.nama}</option>)}
        </select>
      </Field>
      <Field id="area" label="Area" error={e.area}>
        <input id="area" name="area" defaultValue={v.area} {...aria("area", e.area)} />
      </Field>
      <Field id="rute" label="Rute patroli" error={e.rute} hint="Pisahkan titik dengan tanda panah, contoh: Lobi -> Lift -> Lobi">
        <textarea id="rute" name="rute" defaultValue={v.rute} {...aria("rute", e.rute, true)} />
      </Field>
      <Field id="jadwalMulai" label="Jadwal mulai (WIB)" error={e.jadwalMulai}>
        <input id="jadwalMulai" name="jadwalMulai" type="datetime-local" defaultValue={v.jadwalMulai} {...aria("jadwalMulai", e.jadwalMulai)} />
      </Field>
      <Field id="durasiMenit" label="Durasi (menit)" error={e.durasiMenit} hint="Antara 5 dan 480 menit">
        <input id="durasiMenit" name="durasiMenit" inputMode="numeric" defaultValue={v.durasiMenit} {...aria("durasiMenit", e.durasiMenit, true)} />
      </Field>
      <Field id="status" label="Status" error={e.status}>
        <select id="status" name="status" defaultValue={v.status} {...aria("status", e.status)}>
          {STATUS_PATROLI.map((s) => <option key={s} value={s}>{LABEL_STATUS[s]}</option>)}
        </select>
      </Field>
      <Field id="catatan" label="Catatan (opsional)" error={e.catatan}>
        <textarea id="catatan" name="catatan" defaultValue={v.catatan} {...aria("catatan", e.catatan)} />
      </Field>
      <div className="form-actions">
        <button className="btn" type="submit" disabled={pending}>{pending ? "Menyimpan..." : tombol}</button>
        <Link className="btn ghost" href="/patroli">Batal</Link>
      </div>
    </form>
  );
}

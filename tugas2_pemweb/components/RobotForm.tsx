"use client";

import Link from "next/link";
import { useActionState } from "react";
import { aria, Field } from "./Field";
import type { FormState } from "@/lib/actions";
import { LABEL_STATUS, STATUS_ROBOT } from "@/lib/constants";

type Nilai = { kode: string; nama: string; model: string; status: string; baterai: string; lokasi: string };

export const ROBOT_KOSONG: Nilai = { kode: "", nama: "", model: "", status: "AKTIF", baterai: "100", lokasi: "" };

export function RobotForm({
  action,
  awal = ROBOT_KOSONG,
  tombol,
}: {
  action: (s: FormState, fd: FormData) => Promise<FormState>;
  awal?: Nilai;
  tombol: string;
}) {
  const [state, formAction, pending] = useActionState(action, {} as FormState);
  const v = { ...awal, ...(state.values ?? {}) };
  const e = state.errors ?? {};

  return (
    <form action={formAction} className="form" noValidate>
      {state.message && <div className="form-error" role="alert">{state.message}</div>}
      <Field id="kode" label="Kode robot" error={e.kode} hint="Format AAA-123, contoh PTR-001">
        <input id="kode" name="kode" defaultValue={v.kode} {...aria("kode", e.kode, true)} />
      </Field>
      <Field id="nama" label="Nama robot" error={e.nama}>
        <input id="nama" name="nama" defaultValue={v.nama} {...aria("nama", e.nama)} />
      </Field>
      <Field id="model" label="Model" error={e.model}>
        <input id="model" name="model" defaultValue={v.model} {...aria("model", e.model)} />
      </Field>
      <Field id="status" label="Status" error={e.status}>
        <select id="status" name="status" defaultValue={v.status} {...aria("status", e.status)}>
          {STATUS_ROBOT.map((s) => <option key={s} value={s}>{LABEL_STATUS[s]}</option>)}
        </select>
      </Field>
      <Field id="baterai" label="Baterai (%)" error={e.baterai} hint="Angka 0 sampai 100">
        <input id="baterai" name="baterai" inputMode="numeric" defaultValue={v.baterai} {...aria("baterai", e.baterai, true)} />
      </Field>
      <Field id="lokasi" label="Lokasi terakhir" error={e.lokasi}>
        <input id="lokasi" name="lokasi" defaultValue={v.lokasi} {...aria("lokasi", e.lokasi)} />
      </Field>
      <div className="form-actions">
        <button className="btn" type="submit" disabled={pending}>{pending ? "Menyimpan..." : tombol}</button>
        <Link className="btn ghost" href="/robots">Batal</Link>
      </div>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { simpanItem } from "@/app/katalog/actions";
import type { StatusForm } from "@/lib/status-form";

const awal: StatusForm = {};
const kolom = "mt-1 block w-full rounded border px-3 py-2";

export default function FormItem() {
  const [status, aksi, pending] = useActionState(simpanItem, awal);
  const g = status.galat;
  const n = status.nilai;

  return (
    <form action={aksi} className="mt-6 space-y-4">
      <div>
        <label htmlFor="judul" className="font-medium">
          Judul (nama titik patroli)
        </label>
        <input
          id="judul"
          name="judul"
          required
          minLength={3}
          maxLength={80}
          defaultValue={n?.judul}
          className={kolom}
          aria-invalid={!!g?.judul}
          aria-describedby="galat-judul"
        />
        <p id="galat-judul" className="text-sm text-red-700">
          {g?.judul?.[0]}
        </p>
      </div>

      <div>
        <label htmlFor="kategori" className="font-medium">
          Kategori
        </label>
        <select
          id="kategori"
          name="kategori"
          required
          key={n?.kategori ?? "awal"}
          defaultValue={n?.kategori ?? ""}
          className={kolom}
          aria-invalid={!!g?.kategori}
          aria-describedby="galat-kategori"
        >
          <option value="" disabled>
            Pilih kategori
          </option>
          <option value="gedung">Gedung</option>
          <option value="parkir">Parkir</option>
          <option value="perimeter">Perimeter</option>
        </select>
        <p id="galat-kategori" className="text-sm text-red-700">
          {g?.kategori?.[0]}
        </p>
      </div>

      <div>
        <label htmlFor="deskripsi" className="font-medium">
          Deskripsi
        </label>
        <textarea
          id="deskripsi"
          name="deskripsi"
          required
          minLength={10}
          maxLength={300}
          rows={4}
          defaultValue={n?.deskripsi}
          className={kolom}
          aria-invalid={!!g?.deskripsi}
          aria-describedby="galat-deskripsi"
        />
        <p id="galat-deskripsi" className="text-sm text-red-700">
          {g?.deskripsi?.[0]}
        </p>
      </div>

      <label className="flex items-center gap-2">
        <input type="checkbox" name="tersedia" defaultChecked />
        Tersedia (aktif dikunjungi robot)
      </label>

      <button
        type="submit"
        disabled={pending}
        className="rounded bg-blue-700 px-4 py-2 text-white disabled:opacity-60"
      >
        {pending ? "Menyimpan..." : "Simpan"}
      </button>
      <p role="status" aria-live="polite">
        {status.pesan}
      </p>
    </form>
  );
}

const WIB_OFFSET_MS = 7 * 3600_000;

export function formatTanggal(d: Date) {
  return (
    new Intl.DateTimeFormat("id-ID", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Jakarta",
    }).format(d) + " WIB"
  );
}

/** Nilai untuk <input type="datetime-local"> dalam zona WIB. */
export function keInputWaktu(d: Date) {
  return new Date(d.getTime() + WIB_OFFSET_MS).toISOString().slice(0, 16);
}

/** Memparse nilai datetime-local (dianggap WIB) menjadi Date. */
export function dariInputWaktu(v: string) {
  return new Date(`${v}+07:00`);
}

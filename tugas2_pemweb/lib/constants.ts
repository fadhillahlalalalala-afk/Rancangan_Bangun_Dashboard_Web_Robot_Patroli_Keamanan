export const STATUS_ROBOT = ["AKTIF", "PATROLI", "CHARGING", "OFFLINE"] as const;
export const STATUS_PATROLI = ["TERJADWAL", "BERJALAN", "SELESAI", "DIBATALKAN"] as const;

export const LABEL_STATUS: Record<string, string> = {
  AKTIF: "Aktif",
  PATROLI: "Sedang patroli",
  CHARGING: "Mengisi daya",
  OFFLINE: "Offline",
  TERJADWAL: "Terjadwal",
  BERJALAN: "Berjalan",
  SELESAI: "Selesai",
  DIBATALKAN: "Dibatalkan",
};

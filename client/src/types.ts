export type JenisKejadian = 'gerak' | 'getar' | 'perintah';
export type StatusKejadian = 'baru' | 'ditangani';
export type Zona = 'A' | 'B' | 'C' | 'D';

export interface Kejadian {
  id: string;
  waktu: string; // ISO 8601
  jenis: JenisKejadian;
  titik: string;
  arah: 'KIRI' | 'TENGAH' | 'KANAN' | '-';
  status: StatusKejadian;
}

export interface TitikJaga {
  id: string;
  nama: string;
  zona: Zona;
  durasiScan: number; // detik
  catatan: string;
}

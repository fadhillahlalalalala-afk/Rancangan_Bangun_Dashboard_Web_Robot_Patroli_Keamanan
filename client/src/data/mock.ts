import type { Kejadian, TitikJaga } from '../types';

// Data tiruan (sintetis). Pada Milestone 2 diganti data dari server dan database.
export const MOCK_KEJADIAN: Kejadian[] = [
  { id: 'k-008', waktu: '2026-10-12T08:41:00', jenis: 'gerak', titik: 'Titik B', arah: 'KIRI', status: 'baru' },
  { id: 'k-007', waktu: '2026-10-12T07:15:00', jenis: 'getar', titik: 'Titik A', arah: '-', status: 'baru' },
  { id: 'k-006', waktu: '2026-10-12T06:02:00', jenis: 'perintah', titik: 'Titik A', arah: '-', status: 'ditangani' },
  { id: 'k-005', waktu: '2026-10-11T22:14:00', jenis: 'gerak', titik: 'Titik C', arah: 'TENGAH', status: 'ditangani' },
  { id: 'k-004', waktu: '2026-10-11T21:30:00', jenis: 'gerak', titik: 'Titik D', arah: 'KANAN', status: 'ditangani' },
  { id: 'k-003', waktu: '2026-10-11T19:05:00', jenis: 'getar', titik: 'Titik B', arah: '-', status: 'ditangani' },
  { id: 'k-002', waktu: '2026-10-10T23:48:00', jenis: 'gerak', titik: 'Titik A', arah: 'KIRI', status: 'ditangani' },
  { id: 'k-001', waktu: '2026-10-10T20:10:00', jenis: 'perintah', titik: 'Titik C', arah: '-', status: 'ditangani' },
];

export const MOCK_TITIK_JAGA: TitikJaga[] = [
  { id: 'tj-1', nama: 'Titik A', zona: 'A', durasiScan: 8, catatan: 'Dekat pintu masuk lab' },
  { id: 'tj-2', nama: 'Titik B', zona: 'B', durasiScan: 8, catatan: 'Area rak server' },
  { id: 'tj-3', nama: 'Titik C', zona: 'C', durasiScan: 10, catatan: 'Meja kerja sisi timur' },
  { id: 'tj-4', nama: 'Titik D', zona: 'D', durasiScan: 5, catatan: 'Sudut belakang' },
];

export const MOCK_ROBOT = { nama: 'robot-01', status: 'Patroli', baterai: 82 };

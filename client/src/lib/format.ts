const fmt = new Intl.DateTimeFormat('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

export function formatWaktu(iso: string): string {
  return fmt.format(new Date(iso));
}

export const LABEL_JENIS = { gerak: 'Gerakan', getar: 'Getaran', perintah: 'Perintah' } as const;

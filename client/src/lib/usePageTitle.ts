import { useEffect } from 'react';

export function usePageTitle(judul: string): void {
  useEffect(() => {
    document.title = `${judul} | SecureBot`;
  }, [judul]);
}

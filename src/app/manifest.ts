import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Dapoer Thatha POS & Kasir',
    short_name: 'POS Thatha',
    description: 'Sistem Kasir Offline-First & Restoran Dapoer Thatha Kemiren',
    start_url: '/pos',
    display: 'standalone',
    background_color: '#FFFDF7',
    theme_color: '#4B3832',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}

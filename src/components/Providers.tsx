'use client';

import { SessionProvider } from 'next-auth/react';
import { OfflineSyncProvider } from '@/context/OfflineSyncContext';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <OfflineSyncProvider>{children}</OfflineSyncProvider>
    </SessionProvider>
  );
}

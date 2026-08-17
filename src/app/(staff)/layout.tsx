// src/app/(staff)/layout.tsx
import React from 'react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'POS Kasir - Dapoer Thatha',
  description: 'Sistem Point of Sales (POS) Kasir Dapoer Thatha Banyuwangi',
};

export default function StaffLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-[100dvh] bg-[#fafaf9] flex flex-col antialiased" suppressHydrationWarning>
      <main className="flex-1 flex flex-col overflow-hidden">
        {children}
      </main>
    </div>
  );
}

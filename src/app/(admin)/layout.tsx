// src/app/(admin)/layout.tsx
import React from 'react';
import type { Metadata } from 'next';
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient';

export const metadata: Metadata = {
  title: 'Owner Dashboard • Manajemen Menu Dapoer Thatha',
  description: 'Panel Superadmin / Owner untuk kelola menu, kategori, dan master data Dapoer Thatha Banyuwangi',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div suppressHydrationWarning>
      <AdminLayoutClient>
        {children}
      </AdminLayoutClient>
    </div>
  );
}

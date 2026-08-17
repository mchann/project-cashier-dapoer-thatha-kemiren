// src/components/admin/AdminLayoutClient.tsx
'use client';

import React, { useState } from 'react';
import { AdminSidebar } from './AdminSidebar';
import { AdminNavbar } from './AdminNavbar';

export function AdminLayoutClient({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#FFFDF7] antialiased overflow-hidden">
      {/* Sidebar Kiri - Responsive via state */}
      <AdminSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      {/* Konten Utama (Kanan) */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Navbar Atas - Terima fungsi untuk toggle sidebar */}
        <AdminNavbar onMenuClick={() => setIsSidebarOpen(true)} />

        {/* Area Konten Dinamis */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Overlay Background saat sidebar terbuka di mobile */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-30 md:hidden"
            onClick={() => setIsSidebarOpen(false)}
            aria-hidden="true"
          />
        )}
      </div>
    </div>
  );
}

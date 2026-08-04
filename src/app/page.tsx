// src/app/page.tsx
import React from 'react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-[100dvh] bg-[#291404] text-white flex flex-col items-center justify-center p-6">
      <main className="max-w-xl w-full bg-[#451a03] border-4 border-[#d97706] rounded-2xl p-8 text-center shadow-2xl space-y-6">
        <div className="inline-block bg-[#78350f] text-[#fcd34d] font-extrabold text-sm px-3.5 py-1.5 rounded-lg border border-[#f59e0b] uppercase tracking-wider">
          SISTEM POS & ORDERING
        </div>

        <h1 className="text-3xl md:text-4xl font-black text-[#fefce8] leading-tight">
          Cashier & Ordering System Dapoer Thatha
        </h1>

        <p className="text-base text-[#fde68a] font-medium leading-relaxed">
          Selamat datang di sistem manajemen restoran Dapoer Thatha Banyuwangi.
          Silakan pilih modul akses untuk operasional kasir atau manajemen.
        </p>

        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/pos"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-[#d97706] hover:bg-[#b45309] text-white font-black text-lg px-8 py-4 rounded-xl border-2 border-[#fcd34d] shadow-lg cursor-pointer transition-colors"
          >
            <span>Buka Dashboard Kasir (POS)</span>
            <span>→</span>
          </Link>
        </div>

        <div className="pt-6 border-t border-[#78350f] text-xs text-[#fde047] font-medium">
          Dapoer Thatha Kemiren • Aksesibilitas WCAG AA & Senior-Friendly UI
        </div>
      </main>
    </div>
  );
}

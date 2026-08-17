// src/components/admin/AdminHeader.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminHeaderProps {
  ownerName?: string;
  totalProducts?: number;
  totalCategories?: number;
  todayRevenue?: number;
}

export function AdminHeader({
  ownerName = 'Bapak / Ibu Owner (Superadmin)',
  totalProducts = 0,
  totalCategories = 0,
  todayRevenue = 2500000,
}: AdminHeaderProps) {
  const pathname = usePathname();

  const isMenuTabActive = pathname === '/admin/menu' || pathname === '/admin';

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  return (
    <header className="bg-[#451a03] text-white px-6 py-4 border-b-4 border-[#d97706] shadow-md flex flex-wrap items-center justify-between gap-4">
      {/* Kiri: Judul & Informasi Owner */}
      <div className="flex items-center gap-4">
        <div 
          className="bg-[#78350f] text-[#fcd34d] px-3.5 py-1.5 rounded-md font-extrabold text-lg tracking-wide border border-[#f59e0b]"
          aria-label="Hak akses Superadmin atau Owner"
        >
          SUPERADMIN
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#fefce8]">
            Dapoer Thatha • Owner Dashboard
          </h1>
          <p className="text-sm text-[#fde68a] font-medium flex items-center gap-2">
            <span>Login sebagai: <strong className="text-white">{ownerName}</strong></span>
            <span aria-hidden="true" className="text-[#a8a29e]">•</span>
            <span>Kontrol Master Menu &amp; Kategori</span>
          </p>
        </div>
      </div>

      {/* Tengah: Rangkuman Cepat (Hanya tampil di tablet & desktop) */}
      <div className="hidden lg:flex items-center gap-4 bg-[#291404] px-4 py-2 rounded-xl border border-[#78350f]">
        <div className="text-center">
          <span className="block text-xs font-bold text-[#fde68a]">PENDAPATAN HARI INI</span>
          <span className="text-lg font-black text-[#22c55e]">{formatRupiah(todayRevenue)}</span>
        </div>
        <div className="w-px h-8 bg-[#78350f]" aria-hidden="true" />
        <div className="text-center">
          <span className="block text-xs font-bold text-[#fde68a]">TOTAL KATEGORI</span>
          <span className="text-lg font-black text-[#fefce8]">{totalCategories}</span>
        </div>
        <div className="w-px h-8 bg-[#78350f]" aria-hidden="true" />
        <div className="text-center">
          <span className="block text-xs font-bold text-[#fde68a]">TOTAL MENU</span>
          <span className="text-lg font-black text-[#fefce8]">{totalProducts}</span>
        </div>
      </div>

      {/* Kanan: Navigasi & Tombol Pindah ke Kasir */}
      <div className="flex items-center gap-3">
        <Link
          href="/admin/menu"
          aria-current={isMenuTabActive ? 'page' : undefined}
          className={`px-4 py-2.5 rounded-lg font-extrabold text-base border-2 transition-colors cursor-pointer ${
            isMenuTabActive
              ? 'bg-[#d97706] text-white border-[#fcd34d] shadow-sm'
              : 'bg-[#78350f] text-[#fde68a] border-[#a8a29e] hover:bg-[#b45309] hover:text-white'
          }`}
        >
          Kelola Menu
        </Link>

        <Link
          href="/pos"
          className="inline-flex items-center gap-2 bg-[#78350f] hover:bg-[#451a03] text-[#fefce8] hover:text-white font-bold px-4 py-2.5 rounded-lg border-2 border-[#f59e0b] shadow-sm text-base cursor-pointer transition-colors"
          aria-label="Kembali ke layar operasional Kasir (POS)"
        >
          <span>Ke Layar Kasir (POS) →</span>
        </Link>
      </div>
    </header>
  );
}

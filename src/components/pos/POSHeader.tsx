// src/components/pos/POSHeader.tsx
'use client';

import React, { useState } from 'react';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { TutupTokoModal } from './TutupTokoModal';

interface POSHeaderProps {
  cashierName?: string;
  shiftName?: string;
  openOrdersCount?: number;
  totalOrders?: number;
  totalRevenue?: number;
  onOpenSidebar: () => void;
  onOpenFakturGantung: () => void;
  onOpenTarikReservasi: () => void;
}

export function POSHeader({
  cashierName = 'Siti (Kasir 01)',
  shiftName = 'Shift Pagi (08:00 - 16:00)',
  openOrdersCount = 3,
  totalOrders = 20,
  totalRevenue = 2500000,
  onOpenSidebar,
  onOpenFakturGantung,
  onOpenTarikReservasi,
}: POSHeaderProps) {
  // Format tanggal hari ini
  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(number);
  };

  const [isTutupTokoOpen, setIsTutupTokoOpen] = useState(false);

  return (
    <>
    <header className="bg-[#FFFDF7] px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30">
      {/* Kiri: Burger, Logo & Tanggal */}
      <div className="flex items-center gap-6">
        {/* Burger Button */}
        <button 
          onClick={onOpenSidebar}
          className="p-2 bg-white border border-[#DCC7AA] text-[#4B3832] rounded-full hover:bg-[#F5E6CA] transition-colors shadow-sm"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>

        <h1 className="text-xl md:text-2xl font-black tracking-tighter text-[#4B3832] leading-none uppercase flex flex-col">
          <span>Dapoer</span>
          <span>Thatha</span>
        </h1>
        <p className="text-sm font-bold text-[#4B3832] hidden md:block">
          {today}
        </p>
      </div>

      {/* Kanan: Stats, Tombol, Profile */}
      <div className="flex items-center gap-4">
        <div className="hidden lg:flex flex-col items-end mr-1">
          <span className="text-[10px] font-bold text-[#6F4E37] uppercase tracking-wider">Penjualan Hari Ini</span>
          <span className="text-sm font-black text-[#4B3832]">{formatRupiah(totalRevenue)}</span>
        </div>
        
        <div className="hidden lg:flex flex-col items-end mr-3 border-l border-[#DCC7AA] pl-4">
          <span className="text-[10px] font-bold text-[#6F4E37] uppercase tracking-wider">Total Pesanan</span>
          <span className="text-sm font-black text-[#4B3832]">{totalOrders} Transaksi</span>
        </div>

        {/* Tarik Reservasi Button */}
        <button
          type="button"
          onClick={onOpenTarikReservasi}
          className="relative inline-flex items-center gap-2 bg-[#4B3832] border border-[#4B3832] px-4 py-2 rounded-full font-bold text-sm text-[#FFFDF7] hover:bg-[#6F4E37] transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
          <span className="hidden sm:inline">Tarik Reservasi</span>
        </button>

        {/* Faktur Gantung Button */}
        <button
          type="button"
          onClick={onOpenFakturGantung}
          className="relative inline-flex items-center gap-2 bg-white border border-[#DCC7AA] px-4 py-2 rounded-full font-bold text-sm text-[#4B3832] hover:bg-[#F5E6CA] transition-colors group"
        >
          <span className="hidden sm:inline">Faktur Gantung</span>
          {openOrdersCount > 0 && (
            <span className="bg-[#ef4444] text-white font-extrabold px-1.5 py-0.5 rounded-full text-[10px]">
              {openOrdersCount}
            </span>
          )}
        </button>

        {/* Notification Bell */}
        <NotificationBell role="staff" />

        {/* Profile Dropdown */}
        <div className="relative group">
          <div className="flex items-center gap-3 bg-white border border-[#DCC7AA] pl-1 pr-4 py-1 rounded-full cursor-pointer hover:bg-[#F5E6CA] transition-colors">
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(cashierName)}&background=4B3832&color=FFFDF7`}
              alt="Profile" 
              className="w-8 h-8 rounded-full"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#4B3832] leading-none mb-1">{cashierName}</span>
              <span className="text-[10px] text-[#6F4E37] leading-none uppercase">{shiftName}</span>
            </div>
            <svg className="w-4 h-4 ml-2 text-[#6F4E37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 mt-2 w-48 bg-white border border-[#DCC7AA] rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
            <div className="p-2">
              <button 
                onClick={() => setIsTutupTokoOpen(true)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm font-bold text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                Tutup Toko
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>

    {isTutupTokoOpen && (
      <TutupTokoModal 
        onClose={() => setIsTutupTokoOpen(false)} 
        cashierName={cashierName} 
      />
    )}
    </>
  );
}

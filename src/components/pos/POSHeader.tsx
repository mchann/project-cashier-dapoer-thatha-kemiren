// src/components/pos/POSHeader.tsx
'use client';

import React, { useState } from 'react';
import { NotificationBell } from '@/components/shared/NotificationBell';
import { TutupTokoModal } from './TutupTokoModal';
import { useOfflineSync } from '@/context/OfflineSyncContext';

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
  const { isOnline, isSyncing, pendingCount, setIsOfflineModalOpen } = useOfflineSync();

  return (
    <>
    <div className="bg-[#FFFDF7] px-4 md:px-5 py-2.5 flex items-center justify-between gap-3 w-full h-full">
      {/* Kiri: Burger, Logo & Tanggal */}
      <div className="flex items-center gap-3">
        {/* Burger Button */}
        <button 
          onClick={onOpenSidebar}
          className="p-1.5 bg-white border border-[#DCC7AA] text-[#4B3832] rounded-full hover:bg-[#F5E6CA] transition-colors shadow-sm"
          title="Menu Navigasi"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>

        <h1 className="text-lg md:text-xl font-black tracking-tighter text-[#4B3832] leading-none uppercase flex flex-col">
          <span>Dapoer</span>
          <span>Thatha</span>
        </h1>
        <p suppressHydrationWarning className="text-xs font-bold text-[#6F4E37] hidden xl:block border-l border-[#DCC7AA]/50 pl-3">
          {today}
        </p>
      </div>

      {/* Kanan: Stats, Tombol, Profile */}
      <div className="flex items-center gap-2">
        <div className="hidden 2xl:flex flex-col items-end mr-1">
          <span className="text-[10px] font-bold text-[#6F4E37] uppercase tracking-wider">Penjualan Hari Ini</span>
          <span className="text-xs font-black text-[#4B3832]">{formatRupiah(totalRevenue)}</span>
        </div>
        
        <div className="hidden 2xl:flex flex-col items-end mr-2 border-l border-[#DCC7AA] pl-3">
          <span className="text-[10px] font-bold text-[#6F4E37] uppercase tracking-wider">Total Pesanan</span>
          <span className="text-xs font-black text-[#4B3832]">{totalOrders} Transaksi</span>
        </div>

        {/* Connection & Offline Sync Status Button */}
        <button
          type="button"
          onClick={() => setIsOfflineModalOpen(true)}
          className={`relative inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full font-bold text-xs transition-colors border shadow-sm ${
            !isOnline
              ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
              : pendingCount > 0
              ? 'bg-amber-50 border-amber-300 text-amber-900 hover:bg-amber-100'
              : 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
          }`}
          title="Klik untuk membuka status koneksi & sinkronisasi data"
        >
          <span className={`w-2 h-2 rounded-full ${isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
          <span className="hidden sm:inline text-[11px]">
            {isSyncing ? 'Sinkron...' : isOnline ? 'Online' : 'Offline'}
          </span>
          {pendingCount > 0 && (
            <span className="bg-amber-500 text-white font-extrabold px-1.5 py-0.2 rounded-full text-[9px] animate-bounce">
              {pendingCount}
            </span>
          )}
        </button>

        {/* Tarik Reservasi Button */}
        <button
          type="button"
          onClick={onOpenTarikReservasi}
          className="relative inline-flex items-center gap-1.5 bg-[#4B3832] border border-[#4B3832] px-3 py-1.5 rounded-full font-bold text-xs text-[#FFFDF7] hover:bg-[#6F4E37] transition-colors shadow-sm whitespace-nowrap"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" /></svg>
          <span className="hidden md:inline">Reservasi</span>
        </button>

        {/* Faktur Gantung Button */}
        <button
          type="button"
          onClick={onOpenFakturGantung}
          className="relative inline-flex items-center gap-1.5 bg-white border border-[#DCC7AA] px-3 py-1.5 rounded-full font-bold text-xs text-[#4B3832] hover:bg-[#F5E6CA] transition-colors group whitespace-nowrap"
        >
          <span className="hidden md:inline">Faktur Gantung</span>
          {openOrdersCount > 0 && (
            <span className="bg-[#ef4444] text-white font-extrabold px-1.5 py-0.2 rounded-full text-[10px]">
              {openOrdersCount}
            </span>
          )}
        </button>

        {/* Notification Bell */}
        <NotificationBell role="staff" />

        {/* Profile Dropdown */}
        <div className="relative group">
          <div className="flex items-center gap-2 bg-white border border-[#DCC7AA] pl-1 pr-3 py-1 rounded-full cursor-pointer hover:bg-[#F5E6CA] transition-colors">
            <img 
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(cashierName)}&background=4B3832&color=FFFDF7`}
              alt="Profile" 
              className="w-7 h-7 rounded-full"
            />
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#4B3832] leading-none mb-0.5">{cashierName}</span>
              <span className="text-[9px] text-[#6F4E37] leading-none uppercase">{shiftName}</span>
            </div>
            <svg className="w-3.5 h-3.5 ml-1 text-[#6F4E37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
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
    </div>

    {isTutupTokoOpen && (
      <TutupTokoModal 
        onClose={() => setIsTutupTokoOpen(false)} 
        cashierName={cashierName} 
      />
    )}
    </>
  );
}

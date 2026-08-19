// src/components/pos/POSHeader.tsx
'use client';

import React from 'react';

interface POSHeaderProps {
  cashierName?: string;
  shiftName?: string;
  openOrdersCount?: number;
  totalOrders?: number;
  totalRevenue?: number;
  onOpenSidebar: () => void;
  onOpenFakturGantung: () => void;
}

export function POSHeader({
  cashierName = 'Siti (Kasir 01)',
  shiftName = 'Shift Pagi (08:00 - 16:00)',
  openOrdersCount = 3,
  totalOrders = 20,
  totalRevenue = 2500000,
  onOpenSidebar,
  onOpenFakturGantung,
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

  return (
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

        {/* Faktur Gantung Button */}
        <button
          type="button"
          onClick={onOpenFakturGantung}
          className="relative inline-flex items-center gap-2 bg-white border border-[#DCC7AA] px-4 py-2 rounded-full font-bold text-sm text-[#4B3832] hover:bg-[#F5E6CA] transition-colors group"
        >
          <span>Faktur Gantung</span>
          {openOrdersCount > 0 && (
            <span className="bg-[#ef4444] text-white font-extrabold px-1.5 py-0.5 rounded-full text-[10px]">
              {openOrdersCount}
            </span>
          )}
        </button>

        {/* Notification Bell */}
        <button className="relative p-2.5 bg-white border border-[#DCC7AA] rounded-full text-[#4B3832] hover:bg-[#F5E6CA] transition-colors">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
          <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-[#ef4444] border-2 border-white rounded-full"></span>
        </button>

        {/* Profile */}
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
        </div>
      </div>
    </header>
  );
}

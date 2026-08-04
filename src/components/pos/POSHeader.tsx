// src/components/pos/POSHeader.tsx
'use client';

import React from 'react';

interface POSHeaderProps {
  cashierName?: string;
  shiftName?: string;
  openOrdersCount?: number;
  onOpenFakturGantung: () => void;
}

export function POSHeader({
  cashierName = 'Siti (Kasir 01)',
  shiftName = 'Shift Pagi (08:00 - 16:00)',
  openOrdersCount = 3,
  onOpenFakturGantung,
}: POSHeaderProps) {
  return (
    <header className="bg-[#451a03] text-white px-6 py-4 border-b-4 border-[#d97706] shadow-md flex flex-wrap items-center justify-between gap-4">
      {/* Kiri: Judul & Informasi Kasir */}
      <div className="flex items-center gap-4">
        <div className="bg-[#78350f] text-[#fcd34d] px-3 py-1.5 rounded-md font-extrabold text-lg tracking-wide border border-[#f59e0b]">
          POS KASIR
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-black tracking-tight text-[#fefce8]">
            Dapoer Thatha
          </h1>
          <p className="text-sm text-[#fde68a] font-medium flex items-center gap-2">
            <span>Kasir: <strong className="text-white">{cashierName}</strong></span>
            <span aria-hidden="true" className="text-[#a8a29e]">•</span>
            <span>{shiftName}</span>
          </p>
        </div>
      </div>

      {/* Kanan: Status Koneksi & Tombol Antrean Faktur Gantung */}
      <div className="flex items-center gap-3">
        {/* Badge Koneksi */}
        <div 
          className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#291404] border border-[#78350f] text-[#fefce8] text-sm font-medium"
          role="status"
          aria-label="Status server terhubung online"
        >
          <span className="w-2.5 h-2.5 rounded-full bg-[#10b981] inline-block" />
          <span>Online</span>
        </div>

        {/* Tombol Faktur Gantung (Kontras Tinggi & Ramah Lansia/Orang Tua) */}
        <button
          type="button"
          onClick={onOpenFakturGantung}
          className="relative inline-flex items-center gap-2 bg-[#d97706] hover:bg-[#b45309] text-white font-bold px-5 py-2.5 rounded-lg border-2 border-[#fcd34d] shadow-sm text-base cursor-pointer transition-colors"
          aria-label={`Buka antrean Faktur Gantung. Terdapat ${openOrdersCount} faktur aktif.`}
        >
          <span>Faktur Gantung</span>
          {openOrdersCount > 0 && (
            <span className="bg-white text-[#451a03] font-extrabold px-2.5 py-0.5 rounded-full text-sm border border-[#78350f]">
              {openOrdersCount}
            </span>
          )}
          <span className="hidden lg:inline-block ml-1 text-xs bg-[#78350f] px-1.5 py-0.5 rounded border border-[#f59e0b]">
            [F2]
          </span>
        </button>
      </div>
    </header>
  );
}

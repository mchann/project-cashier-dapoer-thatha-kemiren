// src/components/pos/POSSidebar.tsx
'use client';

import React from 'react';

import Link from 'next/link';

interface POSSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPrinter: () => void;
}

export function POSSidebar({ isOpen, onClose, onOpenPrinter }: POSSidebarProps) {
  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-[#4B3832]/30 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>
      )}

      {/* Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-[#FFFDF7] z-50 shadow-2xl transform transition-transform duration-300 ease-in-out border-r border-[#DCC7AA]/50 flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-[#DCC7AA]/30 flex items-center justify-between">
           <h1 className="text-2xl font-black tracking-tighter text-[#4B3832] leading-none uppercase flex flex-col">
            <span>Dapoer</span>
            <span>Thatha</span>
          </h1>
          <button onClick={onClose} className="p-2 bg-[#F5E6CA] text-[#4B3832] rounded-full hover:bg-[#DCC7AA] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <nav className="p-4 flex-1 space-y-2">
          <button
            onClick={onClose}
            className="w-full flex items-center gap-3 px-4 py-3 bg-[#4B3832] text-[#FFFDF7] rounded-2xl font-bold shadow-sm"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
            Kasir Utama
          </button>

          <Link
            href="/pos/history"
            onClick={onClose}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#6F4E37] hover:bg-[#F5E6CA] hover:text-[#4B3832] rounded-2xl font-bold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path></svg>
            Riwayat Pesanan
          </Link>

          <button
             onClick={() => { onClose(); onOpenPrinter(); }}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#6F4E37] hover:bg-[#F5E6CA] hover:text-[#4B3832] rounded-2xl font-bold transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
            Pengaturan Printer
          </button>
        </nav>

        <div className="p-4 border-t border-[#DCC7AA]/30">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-600 hover:bg-red-50 rounded-2xl font-bold transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
            Keluar Aplikasi
          </button>
        </div>
      </aside>
    </>
  );
}

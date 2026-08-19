// src/components/admin/AdminNavbar.tsx
'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';

interface AdminNavbarProps {
  ownerName?: string;
  onMenuClick?: () => void;
}

export function AdminNavbar({ ownerName = 'Bapak / Ibu Owner', onMenuClick }: AdminNavbarProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    window.addEventListener('mousedown', handleClickOutside);
    return () => window.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="bg-[#FFFDF7]/90 backdrop-blur-md px-4 md:px-8 py-4 border-b border-[#DCC7AA] flex items-center justify-between gap-4 sticky top-0 z-30">
      {/* Kiri: Tombol Hamburger (Mobile) & Search Bar */}
      <div className="flex-1 flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 text-[#4B3832] rounded-xl hover:bg-[#F5E6CA] transition-colors"
          aria-label="Buka Menu"
        >
          <HamburgerIcon className="w-6 h-6" />
        </button>

        <div className="relative w-full max-w-md hidden md:block group">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#DCC7AA] group-focus-within:text-[#6F4E37] transition-colors">
            <SearchIcon className="w-5 h-5" />
          </span>
          <input
            type="text"
            placeholder="Pencarian cepat..."
            className="w-full bg-[#FFFDF7] hover:bg-[#F5E6CA] border border-[#DCC7AA] focus:border-[#6F4E37] focus:bg-[#FFFDF7] rounded-full pl-12 pr-4 py-2.5 text-sm font-semibold text-[#4B3832] outline-none transition-all shadow-[inset_0_1px_3px_rgba(0,0,0,0.02)]"
          />
        </div>
      </div>

      {/* Aksi Kanan (Profile & POS Button) */}
      <div className="flex items-center gap-5">
        <Link
          href="/pos"
          className="hidden sm:inline-flex items-center gap-2 bg-[#FFFDF7] hover:bg-[#F5E6CA] text-[#4B3832] font-semibold px-5 py-2.5 rounded-full border border-[#DCC7AA] shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:border-[#6F4E37] cursor-pointer transition-all text-sm"
          title="Buka Layar Kasir (POS)"
        >
          <PosIcon className="w-4 h-4 text-[#6F4E37]" />
          <span>Layar POS</span>
        </Link>

        <div className="w-px h-8 bg-[#DCC7AA] hidden sm:block" aria-hidden="true" />

        <div className="relative" ref={profileRef}>
          <div 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#4B3832] leading-tight group-hover:text-[#6F4E37] transition-colors">
                {ownerName}
              </p>
              <p className="text-[11px] font-bold text-[#6F4E37] uppercase tracking-wider">Superadmin</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#6F4E37] text-[#FFFDF7] flex items-center justify-center font-black shadow-md shadow-[#6F4E37]/20 border border-[#DCC7AA] transition-transform group-hover:scale-105">
              O
            </div>
          </div>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-3 w-56 bg-[#FFFDF7] rounded-2xl shadow-xl border border-[#DCC7AA] py-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-[#DCC7AA]/50 sm:hidden">
                <p className="text-sm font-bold text-[#4B3832] truncate">{ownerName}</p>
                <p className="text-[11px] font-bold text-[#6F4E37] uppercase">Superadmin</p>
              </div>
              
              <Link 
                href="/"
                className="flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-[#4B3832] hover:bg-[#F5E6CA] transition-colors"
                onClick={() => setIsProfileOpen(false)}
              >
                <svg className="w-4 h-4 text-[#6F4E37]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
                Ke Halaman Utama
              </Link>
              
              <div className="h-px bg-[#DCC7AA]/50 my-1"></div>
              
              <button
                onClick={() => {
                  setIsProfileOpen(false);
                  signOut({ callbackUrl: '/login' });
                }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                Logout / Keluar
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

// --- Ikon SVG Internal ---

function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}

function PosIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
    </svg>
  );
}

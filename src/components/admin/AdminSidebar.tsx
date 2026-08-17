// src/components/admin/AdminSidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function AdminSidebar({ isOpen = false, onClose }: AdminSidebarProps) {
  const pathname = usePathname();

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: DashboardIcon },
    { name: 'Kelola Menu', href: '/admin/menu', icon: MenuIcon },
    { name: 'Karyawan', href: '/admin/users', icon: UsersIcon },
    { name: 'Laporan', href: '/admin/report', icon: ReportIcon },
    { name: 'Pengaturan', href: '/admin/settings', icon: SettingsIcon },
  ];

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } md:relative md:translate-x-0 transition-transform duration-300 ease-in-out w-64 bg-[#FFFDF7] text-[#4B3832] flex flex-col h-full border-r border-[#DCC7AA] shadow-[4px_0_24px_rgba(0,0,0,0.02)] flex-shrink-0`}
    >
      {/* Logo / Judul Sidebar */}
      <div className="px-6 py-6 border-b border-[#DCC7AA] flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-[#4B3832] tracking-tight">
            Dapoer Thatha
          </h2>
          <p className="text-[11px] font-bold text-[#6F4E37] mt-1 tracking-widest uppercase">
            Owner Dashboard
          </p>
        </div>
        {/* Tombol Tutup Mobile */}
        <button
          onClick={onClose}
          className="md:hidden p-1 text-[#6F4E37] hover:text-[#4B3832] bg-[#F5E6CA] rounded-lg transition-colors"
        >
          <CloseIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Menu Navigasi */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
        <div className="text-[10px] font-extrabold text-[#DCC7AA] uppercase mb-4 px-3 tracking-widest">
          Menu Utama
        </div>

        {navigation.map((item) => {
          // Khusus menu admin, anggap aktif jika url sama, atau jika url "/admin" redirect ke "/admin/menu"
          const isActive =
            pathname === item.href ||
            (item.href === '/admin/menu' && pathname === '/admin');

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all ${
                isActive
                  ? 'bg-[#4B3832] text-[#FFFDF7] shadow-sm'
                  : 'text-[#6F4E37] hover:bg-[#F5E6CA] hover:text-[#4B3832]'
              }`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-[#FFFDF7]' : 'text-[#6F4E37]'}`} />
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer Sidebar (Logout dll) */}
      <div className="p-4 border-t border-[#DCC7AA]">
        <Link
          href="/login"
          className="flex items-center gap-3 px-4 py-3 rounded-xl font-semibold text-[#ef4444] hover:bg-[#fef2f2] transition-all"
        >
          <LogoutIcon className="w-5 h-5 text-[#f87171]" />
          <span className="text-sm">Keluar Akun</span>
        </Link>
      </div>
    </aside>
  );
}

// --- IKON SVG SEDERHANA ---
function DashboardIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm0 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10-10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zm0 8a1 1 0 011-1h4a1 1 0 011 1v6a1 1 0 01-1 1h-4a1 1 0 01-1-1v-6z" />
    </svg>
  );
}
function MenuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
    </svg>
  );
}
function UsersIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  );
}
function ReportIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function SettingsIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function LogoutIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
function CloseIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
